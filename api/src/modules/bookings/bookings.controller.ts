import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common'
import { BookingsService } from './bookings.service'
import { Booking } from './schemas/booking.schema'
import { JwtAuthGuard, Roles } from '../auth/jwt-auth.guard'
import type { RequestUser } from '../auth/auth.types'
import type { BookingStatus } from './schemas/booking.schema'

@Controller('api/bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /** Public: create a guest quote (no auth needed) */
  @Post()
  create(@Body() data: Parameters<BookingsService['create']>[0]): Promise<Booking> {
    return this.bookingsService.create(data)
  }

  /** Admin: all bookings (optional ?userId= filter) */
  @Get()
  @Roles('admin')
  findAll(@Query('userId') userId?: string): Promise<Booking[]> {
    return userId ? this.bookingsService.findAllForUser(userId) : this.bookingsService.findAll()
  }

  /** Authenticated: my bookings (linked after account creation) */
  @Get('mine')
  @Roles('client', 'admin')
  findMine(@Req() req: Request & { user?: RequestUser }): Promise<Booking[]> {
    return this.bookingsService.findMine(req.user!.sub, req.user!.email)
  }

  /** Authenticated: rattachement des devis invités (même email) à ce compte */
  @Post('claim')
  @Roles('client', 'admin')
  claim(@Req() req: Request & { user?: RequestUser }): Promise<{ linked: number }> {
    return this.bookingsService.claimGuests(req.user!.sub, req.user!.email)
  }

  /** Public: vérifie le paiement Stripe au retour du checkout */
  @Post('pay-confirm')
  payConfirm(
    @Body('reference') reference: string,
    @Body('sessionId') sessionId: string,
  ): Promise<Booking> {
    return this.bookingsService.confirmDeposit(reference, sessionId)
  }

  /** Public: quote lookup by reference */
  @Get(':reference')
  findByReference(@Param('reference') reference: string): Promise<Booking> {
    return this.bookingsService.findByReference(reference)
  }

  /** Propriétaire (ou admin): créer une session Stripe pour l'acompte 30% */
  @Post(':id/pay')
  @Roles('client', 'admin')
  async pay(
    @Req() req: Request & { user?: RequestUser },
    @Param('id') id: string,
  ): Promise<{ url: string }> {
    const booking = await this.bookingsService.findById(id)
    if (!booking) throw new NotFoundException(`Booking ${id} introuvable`)
    const isOwner = (!!booking.userId && String(booking.userId) === req.user!.sub) ||
      (!!booking.contactEmail && booking.contactEmail.toLowerCase() === req.user!.email.toLowerCase())
    if (!isOwner && req.user!.role !== 'admin') throw new UnauthorizedException('Dossier non rattaché à ce compte')
    const url = await this.bookingsService.createDepositSession(booking)
    return { url }
  }

  /** Admin: change booking status */
  @Patch(':id/status')
  @Roles('admin')
  updateStatus(@Param('id') id: string, @Body('status') status: BookingStatus): Promise<Booking> {
    return this.bookingsService.updateStatus(id, status)
  }

  /** Client propriétaire (ou admin): demande d'annulation */
  @Patch(':id/cancel')
  @Roles('client', 'admin')
  async cancelOwn(@Req() req: Request & { user?: RequestUser }, @Param('id') id: string): Promise<Booking> {
    const booking = await this.bookingsService.findById(id)
    if (!booking) throw new NotFoundException(`Booking ${id} introuvable`)
    const isOwner = (!!booking.userId && String(booking.userId) === req.user!.sub) ||
      (!!booking.contactEmail && booking.contactEmail.toLowerCase() === req.user!.email.toLowerCase())
    if (!isOwner && req.user!.role !== 'admin') throw new UnauthorizedException('Dossier non rattaché à ce compte')
    if (booking.status === 'cancelled' || booking.status === 'confirmed') {
      throw new BadRequestException(`Impossible d'annuler une réservation ${booking.status}`)
    }
    return this.bookingsService.updateStatus(id, 'cancelled')
  }
}
