import { chatRequestSchema } from "../schemas/chat.js";

export function createChatController({ assistant }) {
  return async function postChat(request, response, next) {
    const parsed = chatRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return next(parsed.error);
    }

    try {
      const result = await assistant.reply(parsed.data);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
