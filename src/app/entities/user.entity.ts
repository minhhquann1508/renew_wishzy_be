import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import bcrypt from 'bcryptjs';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
}

export enum LoginType {
  LOCAL = 'local',
  GOOGLE = 'google',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, name: 'full_name' })
  fullName!: string;

  @Column({ type: 'date', nullable: true })
  dob?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  gender?: string;

  @Column({ type: 'boolean', default: false })
  verified!: boolean;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'verification_token',
    select: false,
  })
  verificationToken?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'verification_token_exp', select: false })
  verificationTokenExp?: Date;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  password?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar?: string;

  @Column({ type: 'int', nullable: true })
  age?: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({
    type: 'enum',
    enum: LoginType,
    default: LoginType.LOCAL,
    name: 'login_type',
  })
  loginType!: LoginType;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column({ type: 'boolean', default: false, name: 'is_instructor_active' })
  isInstructorActive!: boolean;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'reset_password_token',
    select: false,
  })
  resetPasswordToken?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'reset_password_exp', select: false })
  resetPasswordExp?: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  // Flag to track if password was modified
  private passwordModified = false;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Only hash if password exists and was modified
    if (this.password && (this.passwordModified || !this.id)) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      this.passwordModified = false;
    }
  }

  // Method to set password and mark as modified
  setPassword(password: string) {
    this.password = password;
    this.passwordModified = true;
  }

  // Method to validate password
  async validatePassword(password: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
  }
}
