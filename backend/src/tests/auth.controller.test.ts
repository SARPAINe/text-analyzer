import request from "supertest";
import app from "../app";
import { sequelize } from "../database";
import { User } from "../models";

beforeAll(async () => {
  await sequelize.sync({ force: true }); // Reset the database
});

afterAll(async () => {
  await sequelize.close(); // Close the database connection
});

describe("POST /api/v1/auth/register", () => {
  it("should register a new user successfully", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "testuser2@example.com",
      password: "Test@1234",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "User registered successfully");
    expect(res.body.data).toHaveProperty("email", "testuser2@example.com");

    const user = await User.findOne({
      where: { email: "testuser2@example.com" },
    });
    expect(user).not.toBeNull();
  });

  it("should return 400 if password is missing", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "testuser@example.com",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", '"Password" is required');
  });
});

describe("POST /api/v1/auth/login", () => {
  beforeAll(async () => {
    await request(app).post("/api/v1/auth/register").send({
      email: "testuser@example.com",
      password: "Test@1234",
    });
  });

  it("should log in a user successfully and return a token", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "testuser@example.com",
      password: "Test@1234",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Login successful");
    expect(res.body.data).toHaveProperty("token");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should return 401 for invalid credentials", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "testuser@example.com",
      password: "WrongPassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid email or password");
  });

  it("should return 400 if password is missing during registration", async () => {
    // Missing password
    const res1 = await request(app).post("/api/v1/auth/register").send({
      email: "testuser@example.com",
    });

    expect(res1.statusCode).toBe(400);
    expect(res1.body).toHaveProperty("message", '"Password" is required');
  });

  it("should return 400 if email is missing during registration", async () => {
    // Missing password
    const res1 = await request(app).post("/api/v1/auth/register").send({
      password: "testuser@example.com",
    });

    expect(res1.statusCode).toBe(400);
    expect(res1.body).toHaveProperty("message", '"Email" is required');
  });
});

describe("POST /api/v1/auth/logout", () => {
  it("should log out a user and clear the token cookie", async () => {
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "testuser@example.com",
      password: "Test@1234",
    });
    const token = loginRes.body.data.token;
    const res = await request(app)
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Logged out successfully");
  });
});
