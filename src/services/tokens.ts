import jwt from "jsonwebtoken";

export const ACCESS_TTL_SEC = 15;
export const REFRESH_TTL_SEC = 7;

export type Tokens = { accessToken: string; refreshToken: string };

export type TokenService = {
  createTokens(userId: string): Tokens;
  verifyAccess(token: string): string;   // вернёт userId или бросит ошибку
  verifyRefresh(token: string): string;
};

const verify = (token: string, secret: string): string => {
  const payload = jwt.verify(token, secret);
  if (typeof payload === "string" || !payload.sub) {
    throw new Error("Invalid token payload");
  }
  return payload.sub;
};

export const createTokenService = (accessSecret: string, refreshSecret: string): TokenService => ({
  createTokens: (userId) => ({
    accessToken: jwt.sign({}, accessSecret, { subject: userId, expiresIn: ACCESS_TTL_SEC }),
    refreshToken: jwt.sign({}, refreshSecret, { subject: userId, expiresIn: REFRESH_TTL_SEC }),
  }),
  verifyAccess: (token) => verify(token, accessSecret),
  verifyRefresh: (token) => verify(token, refreshSecret),
});