import { Router } from "express";
import { createChatController } from "../controllers/chat.js";

export function createChatRouter({ assistant }) {
  const router = Router();
  router.post("/", createChatController({ assistant }));
  return router;
}
