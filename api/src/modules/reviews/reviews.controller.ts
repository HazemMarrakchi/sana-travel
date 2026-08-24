import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ReviewsService } from './reviews.service'
import { Review } from './schemas/review.schema'
import { CreateReviewDto } from './dto'
import { JwtAuthGuard, Roles } from '../auth/jwt-auth.guard'

@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /** Public: list reviews (optionally filtered ?slug=) */
  @Get()
  findByOffer(@Query('slug') slug?: string): Promise<Review[]> {
    return this.reviewsService.findByOffer(slug)
  }

  /** Public: post a review */
  @Post()
  create(@Body() dto: CreateReviewDto): Promise<Review> {
    return this.reviewsService.create(dto)
  }

  /** Admin: moderate */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  async remove(@Param('id') id: string): Promise<{ ok: true }> {
    await this.reviewsService.remove(id)
    return { ok: true }
  }
}
