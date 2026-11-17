import { MigrationInterface, QueryRunner } from "typeorm";

export class Run1790901339219 implements MigrationInterface {
    name = 'Run1790901339219'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "property_images" ("id" SERIAL NOT NULL, "url" character varying(500) NOT NULL, "position" smallint NOT NULL DEFAULT '0', "isCover" boolean NOT NULL DEFAULT false, "property_id" integer NOT NULL, CONSTRAINT "PK_317c3774ee70c26d70c4f80e200" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "property_images" ADD CONSTRAINT "FK_162a7701665354b4751ffb835e4" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "property_images" DROP CONSTRAINT "FK_162a7701665354b4751ffb835e4"`);
        await queryRunner.query(`DROP TABLE "property_images"`);
    }

}
