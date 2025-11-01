import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Name of the category' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Notes of the category' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Parent ID of the category' })
  @IsString()
  @IsOptional()
  parentId?: string;
}
