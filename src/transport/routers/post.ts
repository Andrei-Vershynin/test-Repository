import { Router, type NextFunction, type Request, type Response } from "express";
import type { PostHandlers } from "../handlers/post/post";

export function createPostRouter(handlers: PostHandlers, _requireAuth: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined) {
  const router = Router();

  router.get("/", handlers.getPostsHandler);
  router.get("/:id", handlers.getPostByIdHandler);
  router.post("/", handlers.createPostHandler);

  return router;
}