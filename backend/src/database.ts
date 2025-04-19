// src/database.ts
import { Sequelize } from "sequelize";

// Initialize a Sequelize instance with PostgreSQL database connection
console.log(process.env);
export const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  password: process.env.DB_PASSWORD,
  username: process.env.DB_USER,
  database: process.env.DB_NAME,
  dialect: "postgres",
});

export const connectToDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    await sequelize.authenticate();
    console.log(
      "Connection to the database has been established successfully."
    );
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export default sequelize;
