import request from "supertest";
import app from "../app";
import { sequelize } from "../database";

let token: string;

beforeAll(async () => {
  await sequelize.sync({ force: true }); // Reset DB

  // Register the test user
  const user = await request(app).post("/api/v1/auth/register").send({
    email: "testuser@example.com",
    password: "Test@1234",
  });

  // Log in to get the token
  const res = await request(app).post("/api/v1/auth/login").send({
    email: "testuser@example.com",
    password: "Test@1234",
  });

  token = res.body.data.token; // Save the token for use in tests
  console.log("🚀 ~ beforeAll ~ token:", token);
});

afterAll(async () => {
  await sequelize.close();
});

describe("POST /api/v1/texts", () => {
  it("should create a text", async () => {
    const res = await request(app)
      .post("/api/v1/texts")
      .set("Authorization", `Bearer ${token}`) // Auth header
      .send({ content: "Hello world!" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.data).toHaveProperty("content", "Hello world!");
  });

  it("should return 400 if content is missing", async () => {
    const res = await request(app)
      .post("/api/v1/texts")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Content is required");
  });
});

describe("GET /api/v1/texts", () => {
  it("should retrieve all texts", async () => {
    const res = await request(app)
      .get("/api/v1/texts")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "All texts retrieved");
    expect(res.body.data).toBeInstanceOf(Array);
  });
});

describe("GET /api/v1/texts/:id", () => {
  it("should retrieve a text by ID", async () => {
    const createRes = await request(app)
      .post("/api/v1/texts")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Sample text" });

    const textId = createRes.body.data.id;

    const res = await request(app)
      .get(`/api/v1/texts/${textId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Text retrieved successfully");
    expect(res.body.data).toHaveProperty("content", "Sample text");
  });

  it("should return 404 if text is not found", async () => {
    const res = await request(app)
      .get("/api/v1/texts/999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Text not found");
  });
});

describe("PATCH /api/v1/texts/:id", () => {
  it("should update a text successfully", async () => {
    const createRes = await request(app)
      .post("/api/v1/texts")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Old content" });

    const textId = createRes.body.data.id;

    const res = await request(app)
      .patch(`/api/v1/texts/${textId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Updated content" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Text updated successfully");
    expect(res.body.data).toHaveProperty("content", "Updated content");
  });

  it("should return 400 if content is missing", async () => {
    const createRes = await request(app)
      .post("/api/v1/texts")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Old content" });

    const textId = createRes.body.data.id;

    const res = await request(app)
      .patch(`/api/v1/texts/${textId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Content is required");
  });

  it("should return 404 if text is not found", async () => {
    const res = await request(app)
      .patch("/api/v1/texts/999")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Updated content" });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Text not found");
  });
});

describe("DELETE /api/v1/texts/:id", () => {
  it("should delete a text successfully", async () => {
    const createRes = await request(app)
      .post("/api/v1/texts")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Text to delete" });

    const textId = createRes.body.data.id;

    const res = await request(app)
      .delete(`/api/v1/texts/${textId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Text deleted successfully");
  });

  it("should return 404 if text is not found", async () => {
    const res = await request(app)
      .delete("/api/v1/texts/999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Text not found");
  });
});

describe("GET /api/v1/texts/analyze", () => {
  it("should analyze text successfully", async () => {
    const res = await request(app)
      .post("/api/v1/texts/analyze")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "This is a test. It has two sentences." });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Text analyzed successfully");
    expect(res.body.data).toHaveProperty("wordCount", 7);
    // expect(res.body.data).toHaveProperty("sentenceCount", 2);
  });

  it("should return 400 if content is missing", async () => {
    const res = await request(app)
      .post("/api/v1/texts/analyze")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Content is required");
  });
});
