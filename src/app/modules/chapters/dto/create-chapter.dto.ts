import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateChapterDto {
  @ApiProperty({
    example: 'Chapter 1',
    description: 'Name of the chapter',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the course',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @ApiPropertyOptional({
    example: 'Description of the chapter',
    description: 'Description of the chapter',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 60,
    description: 'Duration of the chapter',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  duration?: number;
}
