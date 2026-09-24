"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
require("dotenv/config");
const node_path_1 = require("node:path");
const typeorm_1 = require("typeorm");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
    database: process.env.DB_NAME ?? "tpo_inmobiliario",
    synchronize: false,
    logging: false,
    entities: [(0, node_path_1.join)(__dirname, "..", "entities", "**", "*.{ts,js}")],
    migrations: [(0, node_path_1.join)(__dirname, "..", "migrations", "**", "*.{ts,js}")],
});
//# sourceMappingURL=data-source.js.map