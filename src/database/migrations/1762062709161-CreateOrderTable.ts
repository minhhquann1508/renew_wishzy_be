import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderTable1762062709161 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "orders" (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            voucher_id UUID,
            course_id UUID NOT NULL,
            total_price DECIMAL NOT NULL,
            status VARCHAR(100) CHECK ("status" IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
            payment_method VARCHAR(100) CHECK ("payment_method" IN ('momo', 'vnpay', 'zalopay')) DEFAULT 'vnpay',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id UUID NOT NULL,
            CONSTRAINT "fk_order_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT,
            CONSTRAINT "fk_order_course" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT,
            CONSTRAINT "fk_order_voucher" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id") ON DELETE RESTRICT
        )
    `);

    await queryRunner.query(`
        CREATE INDEX "idx_orders_id" ON "orders"("id")
    `);

    await queryRunner.query(`
        CREATE INDEX "idx_orders_user_id" ON "orders"("user_id")
    `);

    await queryRunner.query(`
        CREATE INDEX "idx_orders_course_id" ON "orders"("course_id")
    `);

    await queryRunner.query(`
        CREATE INDEX "idx_orders_voucher_id" ON "orders"("voucher_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_course_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_voucher_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders"`);
  }
}
