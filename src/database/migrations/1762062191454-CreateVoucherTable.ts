import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVoucherTable1762062191454 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "vouchers" (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            code VARCHAR(100) NOT NULL,
            name VARCHAR(100) NOT NULL,
            discount_value DECIMAL(10, 2) NOT NULL,
            discount_type VARCHAR(100) CHECK ("discount_type" IN ('fixed', 'percent')) DEFAULT 'percent',
            max_discount_amount DECIMAL(10, 2),
            min_order_amount DECIMAL(10, 2),
            per_user_limit INT,
            total_limit INT,
            apply_scope VARCHAR(100) CHECK ("apply_scope" IN ('all', 'category', 'course')) DEFAULT 'all',
            category_id UUID,
            course_id UUID,
            is_active BOOLEAN DEFAULT TRUE,
            start_date TIMESTAMP NOT NULL,
            end_date TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id UUID NOT NULL,
            CONSTRAINT "fk_voucher_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT,
            CONSTRAINT "fk_voucher_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT,
            CONSTRAINT "fk_voucher_course" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT
        )
    `);

    await queryRunner.query(`
        CREATE INDEX "idx_vouchers_id" ON "vouchers"("id")
    `);

    await queryRunner.query(`
        CREATE INDEX "idx_vouchers_user_id" ON "vouchers"("user_id")
    `);

    await queryRunner.query(`
        CREATE INDEX "idx_vouchers_category_id" ON "vouchers"("category_id")
    `);

    await queryRunner.query(`
        CREATE INDEX "idx_vouchers_course_id" ON "vouchers"("course_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_vouchers_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_vouchers_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_vouchers_category_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_vouchers_course_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vouchers"`);
  }
}
