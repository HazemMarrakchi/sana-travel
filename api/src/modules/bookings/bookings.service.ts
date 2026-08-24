import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import Stripe from 'stripe'
import { Booking, BookingDocument } from './schemas/booking.schema'
import { Offer, OfferDocument } from '../offers/schemas/offer.schema'

export interface CreateBookingInput {
  offerSlug: string
  startDate: string
  travelers: number
  contactName: string
  contactEmail: string
  contactPhone?: string
}

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function makeReference(): string {
  let ref = ''
  for (let i = 0; i < 6; i++) {
    ref += REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)]
  }
  return `SNA-${ref}`
}

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name)
  private stripe: Stripe | null = null

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Offer.name) private offerModel: Model<OfferDocument>,
  ) {}

  /** Rattache les réservations invitées (même email, sans compte) au compte client */
  async claimGuests(userId: string, email: string): Promise<{ linked: number }> {
    const res = await this.bookingModel
      .updateMany(
        { userId: { $in: [null, undefined] }, contactEmail: new RegExp(`^${email}$`, 'i') },
        { userId },
      )
      .exec()
    return { linked: res.modifiedCount ?? 0 }
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingModel.find().sort({ createdAt: -1 }).exec()
  }

  async findAllForUser(userId: string): Promise<Booking[]> {
    return this.bookingModel.find({ userId }).sort({ createdAt: -1 }).exec()
  }

  /** Compte connecté : réservations liées au userId OU au même email (invité) */
  async findMine(userId: string, email: string): Promise<Booking[]> {
    const q = email
      ? { $or: [{ userId }, { contactEmail: new RegExp(`^${email}$`, 'i') }] }
      : { userId }
    return this.bookingModel.find(q).sort({ createdAt: -1 }).exec()
  }

  async findByReference(reference: string): Promise<Booking> {
    const booking = await this.bookingModel.findOne({ reference }).exec()
    if (!booking) throw new NotFoundException(`Booking ${reference} not found`)
    return booking
  }

  async create(input: CreateBookingInput): Promise<Booking> {
    const offer = await this.offerModel.findOne({ slug: input.offerSlug }).exec()
    if (!offer) throw new NotFoundException(`Offer "${input.offerSlug}" not found`)

    const travelers = Math.max(1, Math.min(12, Math.round(Number(input.travelers) || 1)))
    const startDate = new Date(input.startDate)
    if (Number.isNaN(startDate.getTime())) throw new NotFoundException('Invalid start date')

    let reference = makeReference()
    // collision-safe retry
    for (let i = 0; i < 5; i++) {
      const exists = await this.bookingModel.exists({ reference })
      if (!exists) break
      reference = makeReference()
    }

    const created = await this.bookingModel.create({
      reference,
      offerId: String(offer._id),
      offerSlug: offer.slug,
      contactName: input.contactName.trim(),
      contactEmail: input.contactEmail.trim().toLowerCase(),
      contactPhone: input.contactPhone?.trim() || undefined,
      travelers,
      startDate,
      status: 'quote_sent',
      totalEur: offer.priceEur * travelers,
    })

    void this.sendQuoteEmail(created, offer)
    return created
  }

  async updateStatus(id: string, status: Booking['status']): Promise<Booking> {
    const booking = await this.bookingModel.findByIdAndUpdate(id, { status }, { new: true }).exec()
    if (!booking) throw new NotFoundException(`Booking ${id} introuvable`)
    return booking
  }

  async findById(id: string): Promise<BookingDocument | null> {
    return this.bookingModel.findById(id).exec()
  }

  /** Session Stripe Checkout pour l'acompte 30% (mode test) */
  async createDepositSession(booking: BookingDocument): Promise<string> {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new NotFoundException('Paiement en ligne non configuré (STRIPE_SECRET_KEY manquant)')
    if (!this.stripe) this.stripe = new Stripe(key)
    if (booking.depositPaid) throw new NotFoundException('Acompte déjà payé')
    if (booking.status === 'cancelled') throw new NotFoundException('Réservation annulée')

    const frontUrl = process.env.FRONT_URL ?? 'http://localhost:5174'
    const deposit = Math.round(booking.totalEur * 0.3 * 100) / 100
    const offer = await this.offerModel.findOne({ slug: booking.offerSlug }).exec()
    const label = `${offer?.title ?? booking.offerSlug} — acompte 30% (${booking.reference})`

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(deposit * 100),
            product_data: { name: label },
          },
        },
      ],
      success_url: `${frontUrl}/paiement/retour?ref=${booking.reference}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontUrl}/account?paiement=annule`,
      metadata: { bookingId: String(booking._id), reference: booking.reference },
    })

    await this.bookingModel
      .updateOne({ _id: booking._id }, { stripeSessionId: session.id, depositEur: deposit })
      .exec()

    return session.url ?? ''
  }

  /** Vérifie la session Stripe après retour de paiement et confirme l'acompte */
  async confirmDeposit(reference: string, sessionId: string): Promise<Booking> {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new NotFoundException('Paiement en ligne non configuré')
    if (!this.stripe) this.stripe = new Stripe(key)

    const booking = await this.bookingModel.findOne({ reference }).exec()
    if (!booking) throw new NotFoundException(`Booking ${reference} introuvable`)
    if (booking.depositPaid) return booking
    if (booking.stripeSessionId && booking.stripeSessionId !== sessionId) {
      throw new NotFoundException('Session de paiement inconnue')
    }

    const session = await this.stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') throw new NotFoundException('Paiement non confirmé')
    if (session.metadata?.bookingId !== String(booking._id)) {
      throw new NotFoundException('Session de paiement inconnue')
    }

    booking.depositPaid = true
    booking.status = 'confirmed'
    await booking.save()
    this.logger.log(`Deposit paid for ${booking.reference} (${booking.depositEur} EUR)`)
    return booking
  }

  /** Fire-and-forget quote email via Resend REST API. Silently skipped without RESEND_API_KEY. */
  private async sendQuoteEmail(booking: BookingDocument, offer: OfferDocument): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.FROM_EMAIL ?? 'SANA Travel <onboarding@resend.dev>'
    if (!apiKey) {
      this.logger.warn(`No RESEND_API_KEY — quote ${booking.reference} generated but NOT emailed`)
      return
    }
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to: [booking.contactEmail],
          subject: `Votre devis SANA ${booking.reference} — ${offer.title}`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:auto">
              <h1 style="color:#e2b04a">SANA Travel</h1>
              <p>Bonjour ${booking.contactName},</p>
              <p>Voici votre devis pour <b>${offer.title}</b> (${offer.city}, ${offer.country}).</p>
              <ul>
                <li>Référence : <b>${booking.reference}</b></li>
                <li>Départ : ${booking.startDate.toISOString().slice(0, 10)}</li>
                <li>Voyageurs : ${booking.travelers}</li>
                <li>Hôtel : ${offer.hotelName} (${offer.nights} nuits)</li>
                <li>Total : <b>${booking.totalEur} €</b> (≈ ${Math.round((booking.totalEur * 3.4) / 10) * 10} DT)</li>
              </ul>
              <p>Notre conseiller vous rappelle sous 24h pour confirmer.</p>
              <p style="color:#8fa3bd">SANA Travel — Tunis · Paris · Dubaï</p>
            </div>`,
        }),
      })
      if (!res.ok) {
        this.logger.error(`Resend rejected quote email ${booking.reference}: ${res.status}`)
      } else {
        this.logger.log(`Quote email sent for ${booking.reference}`)
      }
    } catch (err) {
      this.logger.error(`Quote email failed for ${booking.reference}`, err as Error)
    }
  }
}
