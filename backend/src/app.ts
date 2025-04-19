import "express-async-errors";
import express from "express";
import { json, urlencoded } from "body-parser";
import cookieParser from "cookie-parser";
import passport from "passport";

import { connectToDatabase } from "./database";
import { logInfo } from "./utils/logger";
import { isAuth } from "./middlewares/authMiddleware";
import { errorHandler } from "./middlewares/errorHandler";

import textRoutes from "./routes/textRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * --------------------------
 * Middleware
 * --------------------------
 */
app.use(cookieParser());
app.use(json());
app.use(urlencoded({ extended: true }));

// Initialize Passport.js
app.use(passport.initialize());

/**
 * --------------------------
 * Database Connection
 * --------------------------
 */
connectToDatabase();

/**
 * --------------------------
 * Routes
 * --------------------------
 */
app.get("/", (_req, res) => {
  res.send("Welcome to the Text Analysis API!");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/text", isAuth, textRoutes); // Protected route

/**
 * --------------------------
 * Global Error Handler
 * --------------------------
 */
app.use(errorHandler);

/**
 * --------------------------
 * Start Server
 * --------------------------
 */
app.listen(PORT, () => {
  logInfo(`Server is running on http://localhost:${PORT}`);
});
