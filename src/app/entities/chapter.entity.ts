import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiHideProperty } from '@nestjs/swagger';
import { Course } from './course.entity';
import { Lecture } from './lecture.entity';

@Entity('chapters')
export class Chapter {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'integer', nullable: true })
  duration?: number;

  @Column({ type: 'uuid', nullable: false, name: 'course_id' })
  courseId!: string;

  @Column({ type: 'uuid', nullable: false, name: 'created_by' })
  createdBy!: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ApiHideProperty()
  @ManyToOne('Course', 'chapters', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course?: Course;

  // @ApiHideProperty()
  // @OneToMany('Lecture', 'chapter', { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'chapter_id' })
  // lecture?: Lecture[];
}
