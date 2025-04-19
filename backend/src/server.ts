// src/server.ts
import dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

import app from "./app";
import { connectToDatabase } from "./database";
import { logInfo } from "./utils";

const PORT = process.env.PORT || 3000;

(async () => {
  await connectToDatabase();

  app.listen(PORT, () => {
    logInfo(`Server is running on http://localhost:${PORT}`);
  });
})();
