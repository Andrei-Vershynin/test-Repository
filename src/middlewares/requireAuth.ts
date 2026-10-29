import type { NextFunction, Request, Response } from "express";
import type { TokenService } from "../services/tokens";

export const createRequireAuth =
  (tokens: TokenService) => (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      res.locals.userId = tokens.verifyAccess(token);
      next();
    } catch {
      res.status(401).json({ message: "Unauthorized" });
    }
  };