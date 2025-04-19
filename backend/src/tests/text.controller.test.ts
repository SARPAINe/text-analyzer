import request from "supertest";
import app from "../app";
import { sequelize } from "../database";

let token: string;
let otherToken: string; // Token for another user
let textId: number;

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

  // Create User B
  await request(app).post("/api/v1/auth/register").send({
    username: "userb",
    email: "userb@example.com",
    password: "userbpass",
  });

  // Login User B
  const loginRes = await request(app).post("/api/v1/auth/login").send({
    email: "userb@example.com",
    password: "userbpass",
  });

  token = res.body.data.token; // Save the token for use in tests
  otherToken = loginRes.body.data.token;

  const textRes = await request(app)
    .post("/api/v1/texts")
    .set("Authorization", `Bearer ${token}`)
    .send({ content: "Hello world! This is a test. It has two sentences." });

  textId = textRes.body.data.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe("Authentication test", () => {
  it("should return 401 if user is not authenticated", async () => {
    const res = await request(app)
      .post("/api/v1/texts")
      .send({ content: "Some content" }); // No token sent

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Unauthorized");
  });
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
  it("should retrieve a text by ID with full report if user is creator", async () => {
    const createRes = await request(app)
      .post("/api/v1/texts")
      .set("Authorization", `Bearer ${token}`) // User A
      .send({ content: "Sample text" });

    const textId = createRes.body.data.id;

    const res = await request(app)
      .get(`/api/v1/texts/${textId}`)
      .set("Authorization", `Bearer ${token}`); // same user

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Text retrieved successfully");

    const { report, text } = res.body.data;

    expect(text).toHaveProperty("content", "Sample text");
    expect(report).toHaveProperty("wordCount"); // assuming `analyzeText` returns word count
  });

  it("should retrieve a text by ID without report if user is not the creator", async () => {
    const createRes = await request(app)
      .post("/api/v1/texts")
      .set("Authorization", `Bearer ${token}`) // user A
      .send({ content: "Private text" });

    const textId = createRes.body.data.id;

    const res = await request(app)
      .get(`/api/v1/texts/${textId}`)
      .set("Authorization", `Bearer ${otherToken}`); // user B

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Text retrieved successfully");

    const data = res.body.data;

    expect(data).toHaveProperty("content", "Private text");
    expect(data).not.toHaveProperty("report"); // should not include analysis
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

describe("Text Analysis Routes", () => {
  it("should return word count", async () => {
    const res = await request(app)
      .get(`/api/v1/texts/word-count/${textId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Word count retrieved");
    expect(res.body.data.wordCount).toBe(10);
  });

  it("should return 404 if text is not found for word count", async () => {
    const res = await request(app)
      .get(`/api/v1/texts/word-count/999`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Text not found");
  });

  it("should return character count", async () => {
    const res = await request(app)
      .get(`/api/v1/texts/character-count/${textId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Character count retrieved");
    expect(typeof res.body.data.characterCount).toBe("number");
  });

  it("should return 404 if text is not found for character count", async () => {
    const res = await request(app)
      .get(`/api/v1/texts/character-count/999`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Text not found");
  });

  it("should return sentence count", async () => {
    const res = await request(app)
      .get(`/api/v1/texts/sentence-count/${textId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Sentence count retrieved");
    expect(res.body.data.sentenceCount).toBe(2);
  });

  it("should return 404 if text is not found for sentence count", async () => {
    const res = await request(app)
      .get(`/api/v1/texts/sentence-count/999`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Text not found");
  });

  it("should return paragraph count", async () => {
    const res = await request(app)
      .get(`/api/v1/texts/paragraph-count/${textId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Paragraph count retrieved");
    expect(res.body.data.paragraphCount).toBe(1);
  });

  it("should return 404 if text is not found for paragraph count", async () => {
    const res = await request(app)
      .get(`/api/v1/texts/paragraph-count/999`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Text not found");
  });

  it("should return longest word", async () => {
    const res = await request(app)
      .get(`/api/v1/texts/longest-word/${textId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Longest word retrieved");
    expect(typeof res.body.data.longestWord).toBe("string");
  });

  it("should return 404 if text is not found for longest word", async () => {
    const res = await request(app)
      .get(`/api/v1/texts/longest-word/999`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Text not found");
  });
});
