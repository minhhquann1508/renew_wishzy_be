import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { DocumentEntityType } from 'src/app/entities/document.entity';

export class CreateDocumentDto {
  @ApiProperty({ example: 'Document name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Document notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 'Document descriptions' })
  @IsString()
  @IsOptional()
  descriptions?: string;

  @ApiPropertyOptional({ example: 'Document file_url' })
  @IsString()
  @IsOptional()
  fileUrl?: string;

  @ApiProperty({ example: 'Document entity id' })
  @IsUUID()
  @IsNotEmpty()
  entityId!: string;

  @ApiProperty({ example: DocumentEntityType.COURSE, enum: DocumentEntityType })
  @IsEnum(DocumentEntityType)
  @IsNotEmpty()
  entityType!: DocumentEntityType;
}
