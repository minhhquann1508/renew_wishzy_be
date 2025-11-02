import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChapterTable1762054277839 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE chapters (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            duration INT,
            course_id UUID NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP,
            created_by UUID NOT NULL,
            CONSTRAINT "fk_chapter_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT,
            CONSTRAINT "fk_chapter_course" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT
        )`);

    await queryRunner.query(`CREATE INDEX "idx_chapter_created_by" ON "chapters"("created_by")`);
    await queryRunner.query(`CREATE INDEX "idx_chapter_course" ON "chapters"("course_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_chapter_created_by"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_chapter_course"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "chapters"`);
  }
}
