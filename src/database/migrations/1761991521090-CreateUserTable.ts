import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1761991521090 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create enum types
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE user_login_type AS ENUM ('local', 'google');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('user', 'admin', 'instructor');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) NOT NULL UNIQUE,
        full_name VARCHAR(255) NOT NULL,
        dob DATE,
        gender VARCHAR(50),
        verified BOOLEAN NOT NULL DEFAULT false,
        verification_token VARCHAR(500),
        verification_token_exp TIMESTAMP,
        address TEXT,
        password VARCHAR(255),
        avatar VARCHAR(500),
        age INTEGER,
        phone VARCHAR(20),
        login_type user_login_type NOT NULL DEFAULT 'local',
        role user_role NOT NULL DEFAULT 'user',
        is_instructor_active BOOLEAN NOT NULL DEFAULT false,
        reset_password_token VARCHAR(500),
        reset_password_exp TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token)
    `);

    // Create trigger for updated_at
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_users_updated_at ON users`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_verification_token`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email`);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS users`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS user_role`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_login_type`);
  }
}
