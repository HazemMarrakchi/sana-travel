import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Offer, OfferDocument } from './schemas/offer.schema'

export interface OfferFilters {
  country?: string
  tag?: string
  maxPrice?: number
  featured?: string
}

@Injectable()
export class OffersService {
  constructor(@InjectModel(Offer.name) private offerModel: Model<OfferDocument>) {}

  async findAll(filters: OfferFilters): Promise<Offer[]> {
    const query: Record<string, unknown> = {}
    if (filters.country) query.country = new RegExp(`^${filters.country}$`, 'i')
    if (filters.tag) query.tags = filters.tag
    if (filters.maxPrice) query.priceEur = { $lte: Number(filters.maxPrice) }
    if (filters.featured === 'true') query.featured = true
    return this.offerModel.find(query).sort({ priceEur: 1 }).exec()
  }

  async findBySlug(slug: string): Promise<Offer> {
    const offer = await this.offerModel.findOne({ slug }).exec()
    if (!offer) throw new NotFoundException(`Offer "${slug}" not found`)
    return offer
  }

  async create(data: Partial<Offer>): Promise<Offer> {
    return this.offerModel.create(data)
  }

  async update(slug: string, data: Partial<Offer>): Promise<Offer> {
    const offer = await this.offerModel.findOneAndUpdate({ slug }, data, { new: true }).exec()
    if (!offer) throw new NotFoundException(`Offer "${slug}" not found`)
    return offer
  }

  async remove(slug: string): Promise<void> {
    const res = await this.offerModel.deleteOne({ slug }).exec()
    if (res.deletedCount === 0) throw new NotFoundException(`Offer "${slug}" not found`)
  }
}
