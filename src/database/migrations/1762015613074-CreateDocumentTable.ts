import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocumentTable1762015613074 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "documents" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(100) NOT NULL,
        "notes" VARCHAR(255),
        "descriptions" TEXT,
        "entity_id" uuid NOT NULL,
        "entity_type" VARCHAR(50) NOT NULL CHECK ("entity_type" IN ('course', 'chapter', 'lecture')),
        "file_url" VARCHAR(500) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP,
        "created_by" uuid NOT NULL,
        CONSTRAINT "fk_document_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT
    )`);

    await queryRunner.query(`CREATE INDEX "idx_document_created_by" ON "documents"("created_by")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_document_created_by"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "documents"`);
  }
}
