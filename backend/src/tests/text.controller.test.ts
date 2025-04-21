import request from "supertest";
import app from "../app";
import { sequelize } from "../database";
import { cache } from "../utils";
import { title } from "process";

let token: string;
let otherToken: string; // Token for another user
let textId: number;

beforeAll(async () => {
  await sequelize.sync({ force: true }); // Reset DB

  // Register and login User A
  const userA = await request(app).post("/api/v1/auth/register").send({
    email: "usera@example.com",
    password: "Password123!",
  });
  const loginA = await request(app).post("/api/v1/auth/login").send({
    email: "usera@example.com",
    password: "Password123!",
  });
  token = loginA.body.data.token;

  // Register and login User B
  const userB = await request(app).post("/api/v1/auth/register").send({
    email: "userb@example.com",
    password: "Password123!",
  });
  const loginB = await request(app).post("/api/v1/auth/login").send({
    email: "userb@example.com",
    password: "Password123!",
  });
  otherToken = loginB.body.data.token;

  // Create a text for testing
  const textRes = await request(app)
    .post("/api/v1/texts")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Test Title", content: "This is a test content." });
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
  it("should create a text successfully", async () => {
    const res = await request(app)
      .post("/api/v1/texts")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "New Title", content: "New content" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "Text created successfully");
    expect(res.body.data).toHaveProperty("title", "New Title");
    expect(res.body.data).toHaveProperty("content", "New content");
  });

  it("should return 400 if title is missing", async () => {
    const res = await request(app)
      .post("/api/v1/texts")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", '"Title" is required');
  });

  it("should return 400 if content is missing", async () => {
    const res = await request(app)
      .post("/api/v1/texts")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Sample Title" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", '"Content" is required');
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

  it("should retrieve all texts and cache the result", async () => {
    cache.flushAll(); // Clear cache before test

    // First request (cache miss)
    const res1 = await request(app)
      .get("/api/v1/texts")
      .set("Authorization", `Bearer ${token}`);
    expect(res1.statusCode).toBe(200);

    // Check cache
    const cachedData = cache.get("texts:all");
    expect(cachedData).toBeDefined();

    // Second request (cache hit)
    const res2 = await request(app)
      .get("/api/v1/texts")
      .set("Authorization", `Bearer ${token}`);
    expect(res2.body.message).toBe("All texts retrieved (cached)");
  });
});

describe("GET /api/v1/texts/:id", () => {
  it("should retrieve a text by ID with full report if user is creator", async () => {
    const createRes = await request(app)
      .post("/api/v1/texts")
      .set("Authorization", `Bearer ${token}`) // User A
      .send({ title: "sample title", content: "Sample text" });

    const textId = createRes.body.data.id;

    const res = await request(app)
      .get(`/api/v1/texts/${textId}`)
      .set("Authorization", `Bearer ${token}`); // same user

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Text retrieved successfully");

    const { report, text } = res.body.data;

    expect(text).toHaveProperty("content", "Sample text");
    expect(text).toHaveProperty("title", "sample title");
    expect(report).toHaveProperty("wordCount"); // assuming `analyzeText` returns word count
  });

  it("should retrieve a text by ID without report if user is not the creator", async () => {
    const createRes = await request(app)
      .post("/api/v1/texts")
      .set("Authorization", `Bearer ${token}`) // user A
      .send({ title: "Private title", content: "Private text" });

    const textId = createRes.body.data.id;

    const res = await request(app)
      .get(`/api/v1/texts/${textId}`)
      .set("Authorization", `Bearer ${otherToken}`); // user B

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Text retrieved successfully");

    const data = res.body.data;

    expect(data).toHaveProperty("content", "Private text");
    expect(data).toHaveProperty("title", "Private title");
    expect(data).not.toHaveProperty("report"); // should not include analysis
  });

  it("should return 404 if text is not found", async () => {
    const res = await request(app)
      .get("/api/v1/texts/999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Text not found");
  });
  it("should retrieve a text by ID and cache the result", async () => {
    // Clear the cache before the test
    cache.flushAll();

    const res1 = await request(app)
      .get(`/api/v1/texts/${textId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res1.statusCode).toBe(200);
    expect(res1.body).toHaveProperty("message", "Text retrieved successfully");

    // Check that the result is cached
    const cacheKey = `text:${textId}:owner`;
    const cachedData = cache.get(cacheKey) as
      | { text: { content: string } }
      | undefined;
    expect(cachedData).toBeDefined();
    expect(cachedData?.text.content).toEqual(res1.body.data.text.content);

    // Second request (cache hit)
    const res2 = await request(app)
      .get(`/api/v1/texts/${textId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res2.statusCode).toBe(200);
    expect(res2.body).toHaveProperty(
      "message",
      "Text retrieved successfully (cached)"
    );
    expect(res2.body.data.text.content).toEqual(cachedData?.text?.content);
  });
  it("should retrieve a text by ID and cache the result for non-creator", async () => {
    // Clear the cache before the test
    cache.flushAll();
    const res1 = await request(app)
      .get(`/api/v1/texts/${textId}`)
      .set("Authorization", `Bearer ${otherToken}`);
    expect(res1.statusCode).toBe(200);
    expect(res1.body).toHaveProperty("message", "Text retrieved successfully");
    // Check that the result is cached
    const cacheKey = `text:${textId}:viewer`;
    const cachedData = cache.get(cacheKey) as { content: string } | undefined;
    expect(cachedData).toBeDefined();
    expect(cachedData?.content).toEqual(res1.body.data.content);
    // Second request (cache hit)
    const res2 = await request(app)
      .get(`/api/v1/texts/${textId}`)
      .set("Authorization", `Bearer ${otherToken}`);
    expect(res2.statusCode).toBe(200);
    expect(res2.body).toHaveProperty(
      "message",
      "Text retrieved successfully (cached)"
    );
    expect(res2.body.data.content).toEqual(cachedData?.content);
  });
});

describe("PATCH /api/v1/texts/:id", () => {
  it("should update a text successfully", async () => {
    const res = await request(app)
      .patch(`/api/v1/texts/${textId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Title", content: "Updated content" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Text updated successfully");
    expect(res.body.data).toHaveProperty("title", "Updated Title");
  });

  it("should return 400 if content is missing", async () => {
    const res = await request(app)
      .patch(`/api/v1/texts/${textId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", '"Content" is required');
  });

  it("should return 404 if text is not found", async () => {
    const res = await request(app)
      .patch("/api/v1/texts/999")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Updated content" });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Text not found");
  });

  it("should invalidate the cache when a text is updated", async () => {
    // Ensure the text is cached
    await request(app)
      .get(`/api/v1/texts/${textId}`)
      .set("Authorization", `Bearer ${token}`);
    const cacheKey = `text:${textId}:owner`;
    expect(cache.get(cacheKey)).toBeDefined();

    // Update the text
    const res = await request(app)
      .patch(`/api/v1/texts/${textId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Updated content" });

    console.log("🚀 ~ it ~ res:", res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Text updated successfully");

    // Check that the cache is invalidated
    expect(cache.get(cacheKey)).toBeUndefined();
  });
});

describe("DELETE /api/v1/texts/:id", () => {
  it("should delete a text successfully", async () => {
    const createRes = await request(app)
      .post("/api/v1/texts")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Delete candidate", content: "Text to delete" });

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

  it("should invalidate the cache when a text is deleted", async () => {
    // Ensure the text is cached
    await request(app)
      .get(`/api/v1/texts/${textId}`)
      .set("Authorization", `Bearer ${token}`);
    const cacheKey = `text:${textId}:owner`;
    expect(cache.get(cacheKey)).toBeDefined();

    // Delete the text
    const res = await request(app)
      .delete(`/api/v1/texts/${textId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Text deleted successfully");

    // Check that the cache is invalidated
    expect(cache.get(cacheKey)).toBeUndefined();
  });
});

describe("Text Analysis Routes", () => {
  beforeAll(async () => {
    // Create a text for analysis tests with an added title field
    const createRes = await request(app)
      .post("/api/v1/texts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Title", // Add the title field here
        content: "Hello world! This is a test. It has two sentences.",
      });
    textId = createRes.body.data.id;
  });

  it("should return word count", async () => {
    const text = await request(app)
      .get(`/api/v1/texts/${textId}`)
      .set("Authorization", `Bearer ${token}`);
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

  it("should cache the word count result", async () => {
    // Clear the cache before the test
    cache.flushAll();

    // First request (cache miss)
    const res1 = await request(app)
      .get(`/api/v1/texts/word-count/${textId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res1.statusCode).toBe(200);
    expect(res1.body.message).toBe("Word count retrieved");

    // Check that the result is cached
    const cacheKey = `text:${textId}:wordCount`;
    const cachedData = cache.get(cacheKey) as { wordCount: number } | undefined;
    expect(cachedData).toBeDefined();
    expect(cachedData?.wordCount).toEqual(res1.body.data.wordCount);

    // Second request (cache hit)
    const res2 = await request(app)
      .get(`/api/v1/texts/word-count/${textId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res2.statusCode).toBe(200);
    expect(res2.body.message).toBe("Word count retrieved (cached)");
    expect(res2.body.data).toEqual(cachedData);
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

  it("should cache the character count result", async () => {
    // Clear the cache before the test
    cache.flushAll();
    // First request (cache miss)
    const res1 = await request(app)
      .get(`/api/v1/texts/character-count/${textId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res1.statusCode).toBe(200);
    expect(res1.body.message).toBe("Character count retrieved");
    // Check that the result is cached
    const cacheKey = `text:${textId}:characterCount`;
    const cachedData = cache.get(cacheKey) as
      | { characterCount: number }
      | undefined;
    expect(cachedData).toBeDefined();
    expect(cachedData?.characterCount).toEqual(res1.body.data.characterCount);
    // Second request (cache hit)
    const res2 = await request(app)
      .get(`/api/v1/texts/character-count/${textId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res2.statusCode).toBe(200);
    expect(res2.body.message).toBe("Character count retrieved (cached)");
    expect(res2.body.data).toEqual(cachedData);
  });

  it("should return sentence count", async () => {
    const text = await request(app)
      .get(`/api/v1/texts/${textId}`)
      .set("Authorization", `Bearer ${token}`);
    const res = await request(app)
      .get(`/api/v1/texts/sentence-count/${textId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Sentence count retrieved");
    expect(res.body.data.sentenceCount).toBe(2);
  });

  it("should cache the sentence count result", async () => {
    // Clear the cache before the test
    cache.flushAll();

    // First request (cache miss)
    const res1 = await request(app)
      .get(`/api/v1/texts/sentence-count/${textId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res1.statusCode).toBe(200);
    expect(res1.body.message).toBe("Sentence count retrieved");

    // Check that the result is cached
    const cacheKey = `text:${textId}:sentenceCount`;
    const cachedData = cache.get(cacheKey) as
      | { sentenceCount: number }
      | undefined;
    expect(cachedData).toBeDefined();
    expect(cachedData?.sentenceCount).toEqual(res1.body.data.sentenceCount);

    // Second request (cache hit)
    const res2 = await request(app)
      .get(`/api/v1/texts/sentence-count/${textId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res2.statusCode).toBe(200);
    expect(res2.body.message).toBe("Sentence count retrieved (cached)");
    expect(res2.body.data).toEqual(cachedData);
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

  it("should cache the paragraph count result", async () => {
    // Clear the cache before the test
    cache.flushAll();

    // First request (cache miss)
    const res1 = await request(app)
      .get(`/api/v1/texts/paragraph-count/${textId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res1.statusCode).toBe(200);
    expect(res1.body.message).toBe("Paragraph count retrieved");

    // Check that the result is cached
    const cacheKey = `text:${textId}:paragraphCount`;
    const cachedData = cache.get(cacheKey) as
      | { paragraphCount: number }
      | undefined;
    expect(cachedData).toBeDefined();
    expect(cachedData?.paragraphCount).toEqual(res1.body.data.paragraphCount);

    // Second request (cache hit)
    const res2 = await request(app)
      .get(`/api/v1/texts/paragraph-count/${textId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res2.statusCode).toBe(200);
    expect(res2.body.message).toBe("Paragraph count retrieved (cached)");
    expect(res2.body.data).toEqual(cachedData);
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

  it("should cache the longest word result", async () => {
    // Clear the cache before the test
    cache.flushAll();

    // First request (cache miss)
    const res1 = await request(app)
      .get(`/api/v1/texts/longest-word/${textId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res1.statusCode).toBe(200);
    expect(res1.body.message).toBe("Longest word retrieved");

    // Check that the result is cached
    const cacheKey = `text:${textId}:longestWord`;
    const cachedData = cache.get(cacheKey) as
      | { longestWord: number }
      | undefined;
    expect(cachedData).toBeDefined();
    expect(cachedData?.longestWord).toEqual(res1.body.data.longestWord);

    // Second request (cache hit)
    const res2 = await request(app)
      .get(`/api/v1/texts/longest-word/${textId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res2.statusCode).toBe(200);
    expect(res2.body.message).toBe("Longest word retrieved (cached)");
    expect(res2.body.data).toEqual(cachedData);
  });
});
