import express from "express";
import { json, urlencoded } from "body-parser";
import cookieParser from "cookie-parser";
import passport from "passport";

import textRoutes from "./routes/textRoutes";
import authRoutes from "./routes/authRoutes";
import { connectToDatabase } from "./database";
import { logInfo } from "./utils/logger";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cookieParser());
app.use(json());
app.use(urlencoded({ extended: true }));
// app.use(authMiddleware);

// Initialize Passport
app.use(passport.initialize());

// Connect to the database
connectToDatabase();

// Routes
app.use("/api/v1/text", textRoutes);
app.use("/api/v1/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Text Analysis API!");
});

// Start the server
app.listen(PORT, () => {
  logInfo(`Server is running on http://localhost:${PORT}`);
});
