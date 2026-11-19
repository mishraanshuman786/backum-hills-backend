
import app from "./app";
import { env } from "./config/env";
import { pool } from "./db";

const server = app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${env.PORT}`);
});

const shutdown = async () => {
  console.log("Shutting down server...");

  server.close(async (error) => {
    if (error) {
      console.error("Error closing server:", error);
      process.exit(1);
    }

    try {
      await pool.end();
      console.log("Database connections closed.");
      process.exit(0);
    } catch (error) {
      console.error("Error closing database pool:", error);
      process.exit(1);
    }
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
