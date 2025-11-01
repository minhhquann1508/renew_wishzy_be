import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { CourseLevel } from 'src/app/entities/enums/course.enum';

export class CreateCourseDto {
  @ApiProperty({
    example: 'K8S Course',
    description: 'Course name',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 50000,
    description: 'Course price',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  price!: number;

  @ApiProperty({
    example: 'beginner',
    description: 'Course level',
    required: true,
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  @IsEnum(CourseLevel)
  @IsNotEmpty()
  level!: CourseLevel;

  @ApiProperty({
    example: 0,
    description: 'Course total duration',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  totalDuration!: number;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Category ID',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @ApiProperty({
    example: 'Description',
    description: 'Course description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'Notes',
    description: 'Course notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    example: 'Thumbnail',
    description: 'Course thumbnail',
    required: false,
  })
  @IsString()
  @IsOptional()
  thumbnail?: string;
}
