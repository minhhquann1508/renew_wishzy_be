import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWishlist1762869782577 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create wishlist table
    await queryRunner.query(
      `CREATE TABLE "wishlist" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "courses" JSONB,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_wishlist_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )`,
    );

    // Create index on user_id for better query performance
    await queryRunner.query(`CREATE INDEX "idx_wishlist_user_id" ON "wishlist"("user_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_wishlist_user_id"`);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS "wishlist"`);
  }
}
