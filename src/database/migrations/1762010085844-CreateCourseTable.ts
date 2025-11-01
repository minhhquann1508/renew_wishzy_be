import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCourseTable1762010085844 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "courses" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "notes" VARCHAR(255),
        "thumbnail" VARCHAR(500),
        "price" DECIMAL(10, 2) NOT NULL,
        "sale_info" JSONB,
        "rating" INTEGER DEFAULT 0,
        "average_rating" DECIMAL(3, 2) DEFAULT 0,
        "number_of_students" INTEGER DEFAULT 0,
        "level" VARCHAR(20) CHECK ("level" IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
        "total_duration" INTEGER DEFAULT 0,
        "category_id" uuid NOT NULL,
        "created_by" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP,
        CONSTRAINT "fk_courses_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_courses_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_courses_category_id" ON "courses"("category_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_courses_created_by" ON "courses"("created_by")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_courses_created_by"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_courses_category_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "courses"`);
  }
}
