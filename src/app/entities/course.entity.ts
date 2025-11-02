import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { Category } from './category.entity';
import { User } from './user.entity';
import { CourseLevel, SaleType } from './enums/course.enum';
import { ApiHideProperty } from '@nestjs/swagger';
import { Chapter } from './chapter.entity';

export interface SaleInfo {
  saleType?: SaleType;
  value?: number;
  saleStartDate?: Date;
  saleEndDate?: Date;
}

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnail?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'jsonb', nullable: true, name: 'sale_info' })
  saleInfo?: SaleInfo;

  @Column({ type: 'integer', default: 0 })
  rating!: number;

  @Column({ type: 'boolean', default: false })
  status?: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0, name: 'average_rating' })
  averageRating!: number;

  @Column({ type: 'integer', default: 0, name: 'number_of_students' })
  numberOfStudents!: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: CourseLevel.BEGINNER,
  })
  level!: CourseLevel;

  @Column({ type: 'integer', default: 0, name: 'total_duration' })
  totalDuration!: number;

  @Column({ type: 'uuid', name: 'category_id' })
  categoryId!: string;

  @ApiHideProperty()
  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @Column({ type: 'uuid', name: 'created_by' })
  createdBy!: string;

  @ApiHideProperty()
  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ApiHideProperty()
  @OneToMany('Chapter', 'course')
  chapters?: Chapter[];

  @BeforeInsert()
  @BeforeUpdate()
  validateSale() {
    if (
      this.saleInfo?.saleType === SaleType.PERCENT &&
      this.saleInfo.value !== undefined &&
      this.saleInfo.value > 50
    ) {
      throw new BadRequestException('Sale percentage cannot exceed 50%');
    }
  }
}
