import type { UserRepository } from "../domain/post/user/user.repository";
import type { TokenService, Tokens } from "./tokens";


export class UnauthorizedError extends Error {}

export type AuthService = {
  login(email: string, password: string): Promise<Tokens>;
  refresh(refreshToken: string): Promise<Tokens>;
  me(userId: string): Promise<{ id: string; email: string }>;
};

export const createAuthService = (
  users: UserRepository,
  tokens: TokenService,
): AuthService => ({
  async login(email, _password) {
    const user = await users.findByEmail(email);
    if (!user /* || !passwordOk */) throw new UnauthorizedError("Invalid credentials");
    return tokens.createTokens(user.id);
  },

  async refresh(refreshToken) {
    let userId: string;
    try {
      userId = tokens.verifyRefresh(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid refresh token");
    }
    const user = await users.getById(userId);
    if (!user) throw new UnauthorizedError("User not found");
    return tokens.createTokens(user.id);
  },

  async me(userId) {
    const user = await users.getById(userId);
    if (!user) throw new UnauthorizedError("User not found");
    return { id: user.id, email: user.email };
  },
});