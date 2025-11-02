import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('lectures')
export class Lecture {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', name: 'file_url', length: 500 })
  fileUrl: string;

  @Column({ type: 'int' })
  duration!: number;

  @Column({ type: 'boolean', name: 'is_preview', default: false })
  isPreview?: boolean;

  @Column({ type: 'int', name: 'order_index' })
  orderIndex!: number;

  @Column({ type: 'uuid', name: 'chapter_id' })
  chapterId!: string;

  @Column({ type: 'uuid', name: 'created_by' })
  createdBy!: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
