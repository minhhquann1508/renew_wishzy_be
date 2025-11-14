import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'The ID of the user creating the comment',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    description: 'The ID of the course being commented on',
    example: '123e4567-e89b-12d3-a456-426614174001',
    type: String,
  })
  @IsUUID()
  @IsNotEmpty()
  courseId!: string;

  @ApiProperty({
    description: 'The content of the comment',
    example: 'This is a great course! I learned a lot.',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({
    description: 'Rating for the course (1-5)',
    example: 5,
    type: Number,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @IsNotEmpty()
  rating!: number;
}
