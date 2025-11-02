import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BadRequestException } from '@nestjs/common';

export enum DiscountType {
  FIXED = 'fixed',
  PERCENT = 'percent',
}

export enum ApplyScope {
  ALL = 'all',
  CATEGORY = 'category',
  COURSE = 'course',
}

@Entity('vouchers')
export class Voucher {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  code!: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, name: 'discount_value' })
  discountValue!: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    name: 'discount_type',
    default: DiscountType.PERCENT,
  })
  discountType!: DiscountType;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'max_discount_amount',
  })
  maxDiscountAmount?: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'min_order_amount',
  })
  minOrderAmount?: number;

  @Column({ type: 'int', nullable: true, name: 'per_user_limit' })
  perUserLimit?: number;

  @Column({ type: 'int', nullable: true, name: 'total_limit' })
  totalLimit?: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    name: 'apply_scope',
    default: ApplyScope.ALL,
  })
  applyScope!: ApplyScope;

  @Column({ type: 'uuid', nullable: true, name: 'category_id' })
  categoryId?: string;

  @Column({ type: 'uuid', nullable: true, name: 'course_id' })
  courseId?: string;

  @Column({ type: 'boolean', nullable: false, name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp', nullable: false, name: 'start_date' })
  startDate!: Date;

  @Column({ type: 'timestamp', nullable: false, name: 'end_date' })
  endDate!: Date;

  @Column({ type: 'uuid', nullable: false, name: 'user_id' })
  userId!: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  validateVoucher() {
    // Validate discount percentage
    if (this.discountType === DiscountType.PERCENT && this.discountValue > 100) {
      throw new BadRequestException('Discount percentage cannot exceed 100%');
    }

    // Validate discount value is positive
    if (this.discountValue <= 0) {
      throw new BadRequestException('Discount value must be greater than 0');
    }

    // Validate dates
    if (this.startDate && this.endDate && this.startDate >= this.endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Validate scope constraints
    if (this.applyScope === ApplyScope.CATEGORY && !this.categoryId) {
      throw new BadRequestException('Category ID is required when apply scope is CATEGORY');
    }

    if (this.applyScope === ApplyScope.COURSE && !this.courseId) {
      throw new BadRequestException('Course ID is required when apply scope is COURSE');
    }

    // Validate limits
    if (this.perUserLimit !== undefined && this.perUserLimit <= 0) {
      throw new BadRequestException('Per user limit must be greater than 0');
    }

    if (this.totalLimit !== undefined && this.totalLimit <= 0) {
      throw new BadRequestException('Total limit must be greater than 0');
    }

    // Validate min/max discount amounts
    if (
      this.minOrderAmount !== undefined &&
      this.maxDiscountAmount !== undefined &&
      this.minOrderAmount > this.maxDiscountAmount
    ) {
      throw new BadRequestException('Minimum order amount cannot exceed maximum discount amount');
    }
  }
}
