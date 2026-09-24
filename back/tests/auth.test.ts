import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { AppDataSource } from "../src/config/data-source";
import { app } from "../src/index";

describe("Auth Integration Tests", () => {
  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it("should register a new user", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        fullName: "Test User",
        email: "test@example.com",
        password: "password123",
        agencyName: "Test Agency",
        contactPhone: "12345678",
        contactEmail: "agency@example.com",
        description: "A test agency"
      });
    console.log("Register response:", res.body);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
  });

  it("should login the user", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: "test@example.com",
        password: "password123"
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});
