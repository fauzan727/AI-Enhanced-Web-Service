import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(1000),
}).strict();

export const chatRequestSchema = z.array(messageSchema).min(1).max(12).superRefine(
  (messages, context) => {
    if (messages[0]?.role !== "user") {
      context.addIssue({
        code: "custom",
        path: [0, "role"],
        message: "The first message must have role 'user'",
      });
    }

    if (messages.at(-1)?.role !== "user") {
      context.addIssue({
        code: "custom",
        path: [messages.length - 1, "role"],
        message: "The last message must have role 'user'",
      });
    }

    for (let index = 1; index < messages.length; index += 1) {
      if (messages[index].role === messages[index - 1].role) {
        context.addIssue({
          code: "custom",
          path: [index, "role"],
          message: "Message roles must alternate sequentially",
        });
      }
    }
  },
);

const leadNeedSchema = z.enum([
  "Video Production",
  "Branding",
  "UI/UX Design",
  "Web Development",
  "Social Media Management",
  "Other",
]);

const nullableString = z.string().trim().max(1000).nullable();

export const chatModelResponseSchema = z.object({
  reply: z.string().trim().min(1).max(4000),
  lead: z.object({
    name: nullableString,
    email: z.string().trim().email().max(254).nullable(),
    whatsapp: nullableString,
    need: leadNeedSchema.nullable(),
    context: nullableString,
    consent: z.boolean(),
  }).strict().nullable(),
}).strict();

export const chatLeadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  whatsapp: z.string().trim().min(7).max(20).optional(),
  need: leadNeedSchema,
  context: z.string().trim().min(1).max(2000),
  consent: z.literal(true),
}).strict();
