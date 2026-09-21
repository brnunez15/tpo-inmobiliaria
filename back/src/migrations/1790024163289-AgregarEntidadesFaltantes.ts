import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregarEntidadesFaltantes1790024163289 implements MigrationInterface {
    name = 'AgregarEntidadesFaltantes1790024163289'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sellers" ("id" SERIAL NOT NULL, "fullName" character varying(120) NOT NULL, "email" character varying(255) NOT NULL, "passwordHash" character varying(255) NOT NULL, "phone" character varying(40), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_60a049dd3231ed458dccfdaf406" UNIQUE ("email"), CONSTRAINT "PK_97337ccbf692c58e6c7682de8a2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "agencies" ("id" SERIAL NOT NULL, "name" character varying(120) NOT NULL, "description" text NOT NULL, "logoUrl" character varying(500), "contactPhone" character varying(40) NOT NULL, "contactEmail" character varying(255) NOT NULL, "officeAddress" character varying(255), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "seller_id" integer NOT NULL, CONSTRAINT "UQ_1ea16c73ecef4bab2f61c31c889" UNIQUE ("name"), CONSTRAINT "REL_0fc39ad31050a5a3321c5a2c39" UNIQUE ("seller_id"), CONSTRAINT "PK_8ab1f1f53f56c8255b0d7e68b28" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."properties_type_enum" AS ENUM('HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL')`);
        await queryRunner.query(`CREATE TYPE "public"."properties_operation_enum" AS ENUM('SALE', 'RENT')`);
        await queryRunner.query(`CREATE TYPE "public"."properties_status_enum" AS ENUM('DRAFT', 'PUBLISHED', 'RESERVED', 'PAUSED', 'SOLD', 'RENTED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "properties" ("id" SERIAL NOT NULL, "title" character varying(160) NOT NULL, "description" text NOT NULL, "type" "public"."properties_type_enum" NOT NULL, "operation" "public"."properties_operation_enum" NOT NULL, "price" numeric(14,2) NOT NULL, "currency" character varying(3) NOT NULL, "address" character varying(255) NOT NULL, "area" character varying(120) NOT NULL, "coveredAreaM2" numeric(10,2), "totalAreaM2" numeric(10,2) NOT NULL, "rooms" smallint, "bedrooms" smallint, "bathrooms" smallint, "ageYears" smallint, "tags" text NOT NULL DEFAULT '', "status" "public"."properties_status_enum" NOT NULL DEFAULT 'DRAFT', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "agency_id" integer NOT NULL, CONSTRAINT "PK_2d83bfa0b9fcd45dee1785af44d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."visit_requests_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "visit_requests" ("id" SERIAL NOT NULL, "requesterName" character varying(120) NOT NULL, "requesterPhone" character varying(40) NOT NULL, "proposedDate" TIMESTAMP WITH TIME ZONE NOT NULL, "message" text, "status" "public"."visit_requests_status_enum" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "property_id" integer NOT NULL, CONSTRAINT "PK_d209b01c050073f9407a5fac5a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reviews" ("id" SERIAL NOT NULL, "authorName" character varying(120) NOT NULL, "content" text NOT NULL, "rating" smallint NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "agency_id" integer NOT NULL, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."property_status_history_fromstatus_enum" AS ENUM('DRAFT', 'PUBLISHED', 'RESERVED', 'PAUSED', 'SOLD', 'RENTED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TYPE "public"."property_status_history_tostatus_enum" AS ENUM('DRAFT', 'PUBLISHED', 'RESERVED', 'PAUSED', 'SOLD', 'RENTED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "property_status_history" ("id" SERIAL NOT NULL, "fromStatus" "public"."property_status_history_fromstatus_enum" NOT NULL, "toStatus" "public"."property_status_history_tostatus_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "property_id" integer NOT NULL, CONSTRAINT "PK_18a82911050df3c4e98556ca360" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comments" ("id" SERIAL NOT NULL, "authorName" character varying(120) NOT NULL, "content" text NOT NULL, "response" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "property_id" integer NOT NULL, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."activities_type_enum" AS ENUM('COMMENT', 'VISIT_REQUEST', 'PROPERTY_STATUS_CHANGE', 'REVIEW')`);
        await queryRunner.query(`CREATE TABLE "activities" ("id" SERIAL NOT NULL, "type" "public"."activities_type_enum" NOT NULL, "read" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "agency_id" integer NOT NULL, "property_id" integer, "comment_id" integer, "visit_request_id" integer, "review_id" integer, CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "agencies" ADD CONSTRAINT "FK_0fc39ad31050a5a3321c5a2c39f" FOREIGN KEY ("seller_id") REFERENCES "sellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_74a7c13d05077a21be358f7fbe2" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "visit_requests" ADD CONSTRAINT "FK_4e4919631ee8c8d53c7c5cf530f" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_5e8bc32787782492ed9729e4f35" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "property_status_history" ADD CONSTRAINT "FK_c135f47bc77ad7017934d9a4a08" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_441d260cc0bf18a03aab02b3b22" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_d9a24177a472979c6c0d0d04a3d" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_aa867f3834f2ae0f3597b02fae9" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_e7a2923773edf1e04a085eb00f8" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_e0e965ee3250b219401452422fa" FOREIGN KEY ("visit_request_id") REFERENCES "visit_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_a13d1f6eec3e7ef267348c2b2c1" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_a13d1f6eec3e7ef267348c2b2c1"`);
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_e0e965ee3250b219401452422fa"`);
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_e7a2923773edf1e04a085eb00f8"`);
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_aa867f3834f2ae0f3597b02fae9"`);
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_d9a24177a472979c6c0d0d04a3d"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_441d260cc0bf18a03aab02b3b22"`);
        await queryRunner.query(`ALTER TABLE "property_status_history" DROP CONSTRAINT "FK_c135f47bc77ad7017934d9a4a08"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_5e8bc32787782492ed9729e4f35"`);
        await queryRunner.query(`ALTER TABLE "visit_requests" DROP CONSTRAINT "FK_4e4919631ee8c8d53c7c5cf530f"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP CONSTRAINT "FK_74a7c13d05077a21be358f7fbe2"`);
        await queryRunner.query(`ALTER TABLE "agencies" DROP CONSTRAINT "FK_0fc39ad31050a5a3321c5a2c39f"`);
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`DROP TYPE "public"."activities_type_enum"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP TABLE "property_status_history"`);
        await queryRunner.query(`DROP TYPE "public"."property_status_history_tostatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."property_status_history_fromstatus_enum"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
        await queryRunner.query(`DROP TABLE "visit_requests"`);
        await queryRunner.query(`DROP TYPE "public"."visit_requests_status_enum"`);
        await queryRunner.query(`DROP TABLE "properties"`);
        await queryRunner.query(`DROP TYPE "public"."properties_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."properties_operation_enum"`);
        await queryRunner.query(`DROP TYPE "public"."properties_type_enum"`);
        await queryRunner.query(`DROP TABLE "agencies"`);
        await queryRunner.query(`DROP TABLE "sellers"`);
    }

}
