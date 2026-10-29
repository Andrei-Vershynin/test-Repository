import { Router } from "express";
import type { RequestHandler } from "express";

type UserHandler = {
  register: RequestHandler;
  login: RequestHandler;
  refresh: RequestHandler;
  me: RequestHandler;
};

export function createUserRouter(handler: UserHandler, requireAuth: RequestHandler) {
  const router = Router();
  router.post("/register", handler.register);
  router.post("/login", handler.login);
  router.post("/refresh", handler.refresh);
  router.get("/me", requireAuth, handler.me);
  return router;
}