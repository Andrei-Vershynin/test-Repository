import { type RequestHandler, Router } from "express";

export const createAuthRouter = (
  h: ReturnType<typeof import("../handlers/auth").createAuthHandlers>,
  requireAuth: RequestHandler,
) => {
  const r = Router();
  r.post("/login", h.login);
  r.post("/refresh", h.refresh);
  r.get("/me", requireAuth, h.me);
  return r;
};