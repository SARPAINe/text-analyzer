import "express-async-errors"; // Import this first to handle async errors globally
import express from "express";
import { json, urlencoded } from "body-parser";
import cookieParser from "cookie-parser";
import passport from "passport";
import { rateLimit } from "express-rate-limit";
import cors from "cors";

import { isAuth, errorHandler } from "./middlewares";
import { authRoutes, textRoutes } from "./routes";
import { defineAssociations } from "./models";

// Initialize Express app
const app = express();

// Define model associations
defineAssociations();

/**
 * --------------------------
 * Middleware Configuration
 * --------------------------
 */

// Configure CORS to allow requests from http://localhost:5001
app.use(
  cors({
    origin: "http://localhost:5001",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true, // Allow cookies to be sent with requests
  })
);

app.use(cookieParser());
app.use(json());
app.use(urlencoded({ extended: true }));

// Rate Limiting Configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) => {
    res
      .status(429)
      .json({ message: "Too many requests, please try again later." });
  },
});

// Apply the rate limiting middleware globally
app.use(limiter);

// Initialize Passport.js for authentication
app.use(passport.initialize());

/**
 * --------------------------
 * Routes
 * --------------------------
 */

// Basic route for root path
app.get("/", (_req, res) => {
  res.send("Welcome to the Text Analysis API!");
});

// Authentication routes
app.use("/api/v1/auth", authRoutes);

// Text-related routes with authentication middleware
app.use("/api/v1/texts", isAuth, textRoutes);

/**
 * --------------------------
 * Global Error Handler
 * --------------------------
 */
app.use(errorHandler);

export default app;
