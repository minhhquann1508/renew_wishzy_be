import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLectureTable1762057592241 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE lectures (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL, 
            description TEXT,
            file_url VARCHAR(500) NOT NULL,
            duration INT NOT NULL,
            is_preview BOOLEAN NOT NULL DEFAULT FALSE,
            order_index INT NOT NULL,
            chapter_id UUID NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP,
            created_by UUID NOT NULL,
            CONSTRAINT "fk_lecture_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT,
            CONSTRAINT "fk_lecture_chapter" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE RESTRICT
        )
    `);

    await queryRunner.query(`CREATE INDEX "idx_lecture_id" ON "lectures"("id")`);
    await queryRunner.query(`CREATE INDEX "idx_lecture_created_by" ON "lectures"("created_by")`);
    await queryRunner.query(`CREATE INDEX "idx_lecture_chapter" ON "lectures"("chapter_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_lecture_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_lecture_created_by"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_lecture_chapter"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "lectures"`);
  }
}
