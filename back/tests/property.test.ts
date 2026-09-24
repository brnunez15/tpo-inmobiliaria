import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { app } from "../src/index";
import { AppDataSource } from "../src/config/data-source";

describe("Property Integration Tests", () => {
  let token = "";

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // create a user to get a token
    const res = await request(app).post("/auth/register").send({
      fullName: "Prop Tester",
      email: "proptester@example.com",
      password: "password123",
      agencyName: "Prop Test Agency",
      contactPhone: "12345678",
      contactEmail: "propagency@example.com",
      description: "Prop test agency"
    });
    token = res.body.token;
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it("should get properties with filters", async () => {
    const res = await request(app).get("/properties?type=HOUSE&currency=USD");
    console.log("Properties response:", res.body);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBeTruthy();
  });
});
