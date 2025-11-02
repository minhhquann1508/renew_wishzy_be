import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLectureDto {
  @ApiProperty({
    description: 'Lecture name',
    example: 'Lecture 1',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'File URL',
    example: 'https://example.com/file.mp4',
  })
  @IsString()
  @IsNotEmpty()
  fileUrl!: string;

  @ApiProperty({
    description: 'Lecture duration (minutes)',
    example: 120,
  })
  @IsNumber()
  @IsNotEmpty()
  duration!: number;

  @ApiProperty({
    description: 'Is this a preview lecture',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isPreview?: boolean;

  @ApiProperty({
    description: 'Position of the lecture in the chapter',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  orderIndex!: number;

  @ApiProperty({
    description: 'Chapter ID',
    example: '123',
  })
  @IsUUID()
  @IsNotEmpty()
  chapterId!: string;
}
