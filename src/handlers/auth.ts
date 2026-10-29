import type { Request, Response } from "express";
import { type AuthService, UnauthorizedError } from "../services/auth";
import { ACCESS_TTL_SEC, REFRESH_TTL_SEC, type Tokens } from "../services/tokens";

const base = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

const setAuthCookies = (res: Response, t: Tokens) => {
  res.cookie("accessToken", t.accessToken, { ...base, path: "/", maxAge: ACCESS_TTL_SEC * 1000 });
  res.cookie("refreshToken", t.refreshToken, { ...base, path: "/auth", maxAge: REFRESH_TTL_SEC * 1000 });
};

export const createAuthHandlers = (auth: AuthService) => ({
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      setAuthCookies(res, await auth.login(email, password));
      res.status(200).json({ ok: true });
    } catch (e) {
      if (e instanceof UnauthorizedError) return res.status(401).json({ message: e.message });
      res.status(500).json({ message: "Internal error" });
    }
  },

  refresh: async (req: Request, res: Response) => {
    try {
      const token = req.cookies?.refreshToken;
      if (!token) return res.status(401).json({ message: "No refresh token" });
      setAuthCookies(res, await auth.refresh(token));
      res.status(200).json({ ok: true });
    } catch (e) {
      if (e instanceof UnauthorizedError) return res.status(401).json({ message: e.message });
      res.status(500).json({ message: "Internal error" });
    }
  },

  me: async (_req: Request, res: Response) => {
    try {
      res.status(200).json(await auth.me(res.locals.userId));
    } catch (e) {
      if (e instanceof UnauthorizedError) return res.status(401).json({ message: e.message });
      res.status(500).json({ message: "Internal error" });
    }
  },
});