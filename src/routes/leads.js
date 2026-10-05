import { Router } from "express";
import { createLeadsController } from "../controllers/leads.js";

export function createLeadsRouter({ leadService }) {
  const router = Router();
  router.post("/", createLeadsController({ leadService }));
  return router;
}
