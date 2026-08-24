import { IsIn, IsInt, IsString, Length, Max, Min } from 'class-validator'

export class CreateReviewDto {
  @IsString()
  offerSlug!: string

  @IsString()
  @Length(2, 60)
  authorName!: string

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number

  @IsString()
  @Length(5, 800)
  comment!: string
}
