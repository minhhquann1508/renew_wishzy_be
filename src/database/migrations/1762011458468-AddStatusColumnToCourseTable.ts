import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusColumnToCourseTable1762011458468 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE courses ADD COLUMN status BOOLEAN DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE courses DROP COLUMN status`);
  }
}
