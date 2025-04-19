// src/app.ts
import "express-async-errors";
import express from "express";
import { json, urlencoded } from "body-parser";
import cookieParser from "cookie-parser";
import passport from "passport";

import { isAuth, errorHandler } from "./middlewares";
import { authRoutes, textRoutes } from "./routes";
import { defineAssociations } from "./models";

const app = express();

// Define associations
defineAssociations();

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
 * Routes
 * --------------------------
 */
app.get("/", (_req, res) => {
  res.send("Welcome to the Text Analysis API!");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/texts", isAuth, textRoutes);

/**
 * --------------------------
 * Global Error Handler
 * --------------------------
 */
app.use(errorHandler);

export default app;
