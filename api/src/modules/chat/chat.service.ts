import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Offer, OfferDocument } from '../offers/schemas/offer.schema'
import { ChatLog, ChatLogDocument } from './schemas/chat-log.schema'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatReply {
  reply: string
  escalate: boolean
  engine: 'groq' | 'rules'
}

const EUR_TND = 3.4

interface OfferFact {
  title: string
  city: string
  country: string
  priceTnd: number
  nights: number
  rating: number
  tags: string[]
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name)

  constructor(
    @InjectModel(Offer.name) private readonly offerModel: Model<OfferDocument>,
    @InjectModel(ChatLog.name) private readonly chatLogModel: Model<ChatLogDocument>,
  ) {}

  async ask(message: string, history: ChatMessage[]): Promise<ChatReply> {
    const clean = String(message ?? '').trim().slice(0, 1000)
    if (!clean) {
      return {
        reply: 'N’hésitez pas à me poser votre question sur nos destinations ! 😊',
        escalate: false,
        engine: 'rules',
      }
    }

    const facts = await this.loadOfferFacts()

    let reply: ChatReply
    if (process.env.GROQ_API_KEY) {
      try {
        reply = await this.askGroq(message, history, facts)
      } catch (err) {
        this.logger.warn(`Groq failed (${(err as Error).message}) → fallback rules`)
        reply = this.askRules(message, facts)
      }
    } else {
      reply = this.askRules(message, facts)
    }

    await this.chatLogModel.create({
      question: clean,
      answer: reply.reply,
      escalated: reply.escalate,
      engine: reply.engine,
    })
    return reply
  }

  private async loadOfferFacts(): Promise<OfferFact[]> {
    const docs = await this.offerModel.find().lean().exec()
    return (docs as unknown as Offer[]).map((o) => ({
      title: o.title,
      city: o.city,
      country: o.country,
      priceTnd: Math.round((o.priceEur * EUR_TND) / 10) * 10,
      nights: o.nights,
      rating: o.rating,
      tags: o.tags ?? [],
    }))
  }

  private catalogText(facts: OfferFact[]): string {
    return facts
      .map(
        (f) =>
          `- ${f.title} — ${f.city}, ${f.country} · ${f.nights} nuits · ${f.priceTnd} DT · note ${f.rating}/5${
            f.tags.length ? ` · ${f.tags.join(', ')}` : ''
          }`,
      )
      .join('\n')
  }

  private async askGroq(message: string, history: ChatMessage[], facts: OfferFact[]): Promise<ChatReply> {
    const system = [
      "Tu es Sana, la conciergerie virtuelle de l'agence SANA Travel (agence de voyage tunisienne).",
      "Réponds en français, ton chaleureux et professionnel, réponses courtes (2-5 phrases max).",
      'Les prix sont TOUJOURS en dinar tunisien (DT). Voici le catalogue actuel :',
      this.catalogText(facts),
      "Si la question sort du voyage/tourisme ou si tu n'as pas l'information, réponds exactement :",
      '"Je transmets votre question à un conseiller humain SANA Travel, il vous répondra très vite. 🙏"',
    ].join('\n')

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        temperature: 0.4,
        max_tokens: 300,
        messages: [
          { role: 'system', content: system },
          ...history.slice(-6),
          { role: 'user', content: message },
        ],
      }),
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) throw new Error(`groq ${res.status}`)
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
    const text = data.choices?.[0]?.message?.content?.trim()
    if (!text) throw new Error('empty completion')
    const escalate = text.includes('conseiller humain')
    return { reply: text, escalate, engine: 'groq' }
  }

  private normalize(s: string): string {
    return s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  private askRules(message: string, facts: OfferFact[]): ChatReply {
    const m = this.normalize(message)

    // greetings
    if (/^(bonjour|salut|hello|salam|hi|coucou)\b/.test(m)) {
      return {
        reply:
          'Bonjour ! 👋 Je suis Sana, votre concierge virtuelle. Je peux vous renseigner sur nos destinations, prix et durées de séjour. Que cherchez-vous ?',
        escalate: false,
        engine: 'rules',
      }
    }

    // price question → cheapest offers
    if (/(prix|tarif|combien|coute|budget|cher)/.test(m)) {
      const sorted = [...facts].sort((a, b) => a.priceTnd - b.priceTnd).slice(0, 3)
      return {
        reply: `Nos offres démarrent à ${sorted[0].priceTnd} DT. Les plus abordables :\n${sorted
          .map((f) => `• ${f.title} — ${f.nights} nuits à ${f.priceTnd} DT`)
          .join('\n')}\nSouhaitez-vous un devis personnalisé ?`,
        escalate: false,
        engine: 'rules',
      }
    }

    // duration question
    if (/(duree|jours|nuits|sejour|combien de temps)/.test(m)) {
      const longest = [...facts].sort((a, b) => b.nights - a.nights)[0]
      return {
        reply: `Nos séjours vont de ${Math.min(...facts.map((f) => f.nights))} à ${
          longest.nights
        } nuits. Par exemple « ${longest.title} » dure ${longest.nights} nuits pour ${longest.priceTnd} DT.`,
        escalate: false,
        engine: 'rules',
      }
    }

    // destination match by city/country/tag/title words
    const match = facts.find((f) => {
      const hay = this.normalize(`${f.city} ${f.country} ${f.title} ${f.tags.join(' ')}`)
      return m.split(/\s+/).some((w) => w.length > 3 && hay.includes(w))
    })
    if (match) {
      return {
        reply: `« ${match.title} » vous emmène à ${match.city} (${match.country}) pour ${
          match.nights
        } nuits — ${match.priceTnd} DT par personne, noté ${match.rating}/5 ⭐. Voulez-vous que je vous prépare un devis ?`,
        escalate: false,
        engine: 'rules',
      }
    }

    // contact / human
    if (/(humain|conseiller|agent|telephone|appeler|contact|parler)/.test(m)) {
      return {
        reply:
          'Bien sûr ! Notre équipe est joignable au +216 71 000 000 ou directement à l\'agence. Vous pouvez aussi laisser votre question ici et nous vous rappelons. 📞',
        escalate: true,
        engine: 'rules',
      }
    }

    // fallback → propose le catalogue puis escalade
    const dests = facts.map((f) => `${f.city} (${f.country})`).join(' · ')
    return {
      reply: `Je n'ai pas d'offre correspondant exactement à votre demande. Nos destinations du moment : ${dests}. Je transmets également votre question à un conseiller humain SANA Travel. 🙏`,
      escalate: true,
      engine: 'rules',
    }
  }

  async escalatedLogs(limit = 20) {
    return this.chatLogModel.find({ escalated: true }).sort({ createdAt: -1 }).limit(limit).lean().exec()
  }
}
