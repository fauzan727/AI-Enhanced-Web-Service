import { randomUUID } from "node:crypto";

export function createLeadService() {
  return {
    async create(_lead) {
      return { id: randomUUID() };
    },
  };
}
