import { createServer } from "node:http";
import { createApp } from "./app.js";
import { config } from "./config/env.js";

const server = createServer(createApp());

server.listen(config.port, () => {
  console.log(`Interactive Chat Assistant listening on port ${config.port}`);
});

server.on("error", (error) => {
  console.error(`HTTP server failed to start: ${error.code ?? "unknown error"}`);
  process.exitCode = 1;
});
