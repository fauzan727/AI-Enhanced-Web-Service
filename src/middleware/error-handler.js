import { ZodError } from "zod";

export function errorHandler(error, _request, response, _next) {
  if (response.headersSent) {
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      error: "Validation failed",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (error?.type === "entity.too.large") {
    response.status(413).json({ error: "Request body too large" });
    return;
  }

  if (error instanceof SyntaxError && Object.hasOwn(error, "body")) {
    response.status(400).json({ error: "Invalid JSON request body" });
    return;
  }

  response.status(500).json({ error: "Internal Server Error" });
}
