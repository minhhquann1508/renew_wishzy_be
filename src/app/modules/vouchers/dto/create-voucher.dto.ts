import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApplyScope, DiscountType } from 'src/app/entities/vouchers.entity';

export class CreateVoucherDto {
  @ApiProperty({
    description: 'Voucher code',
    example: 'SUMMER2025',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code!: string;

  @ApiProperty({
    description: 'Voucher name',
    example: 'Summer Sale 2025',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Discount value (percentage or fixed amount)',
    example: 20,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @IsPositive()
  discountValue!: number;

  @ApiProperty({
    description: 'Type of discount',
    enum: DiscountType,
    example: DiscountType.PERCENT,
    default: DiscountType.PERCENT,
  })
  @IsEnum(DiscountType)
  @IsNotEmpty()
  discountType!: DiscountType;

  @ApiPropertyOptional({
    description: 'Maximum discount amount (for percentage discounts)',
    example: 100000,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  maxDiscountAmount?: number;

  @ApiPropertyOptional({
    description: 'Minimum order amount required to use voucher',
    example: 500000,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of times a user can use this voucher',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  perUserLimit?: number;

  @ApiPropertyOptional({
    description: 'Total number of times this voucher can be used',
    example: 100,
    minimum: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  totalLimit?: number;

  @ApiProperty({
    description: 'Scope where voucher can be applied',
    enum: ApplyScope,
    example: ApplyScope.ALL,
    default: ApplyScope.ALL,
  })
  @IsEnum(ApplyScope)
  @IsNotEmpty()
  applyScope!: ApplyScope;

  @ApiPropertyOptional({
    description: 'Category ID (required if apply scope is CATEGORY)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Course ID (required if apply scope is COURSE)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({
    description: 'Whether the voucher is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Voucher start date',
    example: '2025-06-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate!: Date;

  @ApiProperty({
    description: 'Voucher end date',
    example: '2025-08-31T23:59:59.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate!: Date;
}
