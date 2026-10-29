import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import type { UserRepository } from "./user.repository";
import type { RegisterUserDto, LoginUserDto } from "./user.dto";
import type { TokenService } from "../../../services/tokens";
// import type { TokenService } from "../../../services/tokens";

const deriveKey = (password: string, salt: string, keyLength: number) =>
  new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keyLength, (error, key) => {
      if (error) reject(error);
      else resolve(key as Buffer);
    });
  });

//  export const createUserService = (_users: UserRepository, _tokens: TokenService) => ({ ... })

const hashPassword = async (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const key = await deriveKey(password, salt, 64);
  return `$scrypt$${salt}$${key.toString("hex")}`;
};

const verifyPassword = async (password: string, storedHash: string) => {
  const [, algorithm, salt, hash] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !hash || !/^[0-9a-f]+$/i.test(hash)) return false;

  const expected = Buffer.from(hash, "hex");
  const actual = await deriveKey(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

export class HttpError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const createUserService = (repo: UserRepository, tokenService: TokenService) => ({
  async register({ email, password }: RegisterUserDto) {
    if (typeof email !== "string" || typeof password !== "string" || !email || password.length < 6) {
      throw new HttpError(400, "Email and password (min 6 chars) are required");
    }
    const existing = await repo.findByEmail(email);
    if (existing) {
      throw new HttpError(409, "Email already exists");
    }
    const hash = await hashPassword(password);
    return repo.create({ email, password: hash });
  },

  async login({ email, password }: LoginUserDto) {
    const user = typeof email === "string" ? await repo.findByEmail(email) : null;
    const ok = user && typeof password === "string" && (await verifyPassword(password, user.password));
    if (!user || !ok) {
      throw new HttpError(401, "Invalid email or password");
    }
    return tokenService.createTokens(user.id);   // { accessToken, refreshToken }
  },

  async refresh(refreshToken: string) {
    let userId: string;
    try {
      userId = tokenService.verifyRefresh(refreshToken);
    } catch {
      throw new HttpError(401, "Invalid refresh token");
    }
    const user = await repo.getById(userId);
    if (!user) {
      throw new HttpError(401, "User not found");
    }
    return tokenService.createTokens(user.id);
  },

  async me(userId: string) {
    const user = await repo.getById(userId);
    if (!user) {
      throw new HttpError(401, "User not found");
    }
    return { id: user.id, email: user.email };
  },
});

export type UserService = ReturnType<typeof createUserService>;