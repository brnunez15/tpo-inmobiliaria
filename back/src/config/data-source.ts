import "reflect-metadata";
import "dotenv/config";
import { join } from "node:path";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD ?? "postgres",
  database: process.env.NODE_ENV === "test" ? (process.env.DB_NAME_TEST ?? "tpo_inmobiliario_test") : (process.env.DB_NAME ?? "tpo_inmobiliario"),
  synchronize: process.env.NODE_ENV === "test", // auto-create schema in tests
  dropSchema: process.env.NODE_ENV === "test", // wipe data before each initialize
  logging: false,
  entities: [join(__dirname, "..", "entities", "**", "*.{ts,js}")],
  migrations: [join(__dirname, "..", "migrations", "**", "*.{ts,js}")],
});
