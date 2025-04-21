// jest.setup.js
import path from "path";
import dotenv from "dotenv-safe";
dotenv.config({ path: path.resolve(__dirname, ".env.test") });

console.log("✅ Loaded .env.test in jest.setup.js");
