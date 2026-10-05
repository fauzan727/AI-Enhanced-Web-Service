import { leadRequestSchema } from "../schemas/leads.js";

export function createLeadsController({ leadService }) {
  return async function postLead(request, response, next) {
    const parsed = leadRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return next(parsed.error);
    }

    try {
      const result = await leadService.create(parsed.data);
      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
