import { Router, type RequestHandler } from "express";
import type { PostHandlers } from "../transport/handlers/post/post";

export const createPostsRouter = (handlers: PostHandlers, requireAuth: RequestHandler) => {
  const r = Router();
  r.get("/", handlers.getAll);
  r.get("/:id", handlers.getById);
  r.post("/", requireAuth, handlers.create as unknown as RequestHandler);
  return r;
};