import app from "./app";
import { env } from "./config/env";
import { pool } from "./db";

const server=app.listen(env.PORT,()=>{
    console.log(`Server running on port http://localhost:${env.PORT}/api/v1`);
});

const shutdown = async () => {
  console.log("Shutting down server...");

  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);