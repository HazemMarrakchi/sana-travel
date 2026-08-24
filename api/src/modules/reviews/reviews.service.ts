import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Review, ReviewDocument } from './schemas/review.schema'

export interface CreateReviewInput {
  offerSlug: string
  authorName: string
  rating: number
  comment: string
}

@Injectable()
export class ReviewsService {
  constructor(@InjectModel(Review.name) private reviewModel: Model<ReviewDocument>) {}

  async findByOffer(offerSlug?: string): Promise<Review[]> {
    const q = offerSlug ? { offerSlug } : {}
    return this.reviewModel.find(q).sort({ createdAt: -1 }).limit(50).exec()
  }

  async create(input: CreateReviewInput): Promise<Review> {
    return this.reviewModel.create({
      offerSlug: input.offerSlug,
      authorName: input.authorName.trim(),
      rating: Math.round(input.rating),
      comment: input.comment.trim(),
    })
  }

  async remove(id: string): Promise<void> {
    const res = await this.reviewModel.findByIdAndDelete(id).exec()
    if (!res) throw new NotFoundException(`Review ${id} introuvable`)
  }
}
