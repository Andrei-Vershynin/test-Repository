import type { db } from "../../../prisma/db";

type Db = typeof db;

type UserRecord = { id: string; email: string; password: string };
type UserDb = {
  user: {
    findUnique: (args: {
      where: { id: string } | { email: string };
    }) => Promise<UserRecord | null>;
    create: (args: {
      data: { email: string; password: string };
      select: { id: true; email: true };
    }) => Promise<Pick<UserRecord, "id" | "email">>;
  };
};

export const createUserRepository = (database: Db) => {
  const userDatabase = database as unknown as UserDb;

  return {
    findByEmail: (email: string) =>
      userDatabase.user.findUnique({ where: { email } }),

    getById: (id: string) =>
      userDatabase.user.findUnique({ where: { id } }),

    create: (data: { email: string; password: string }) =>
      userDatabase.user.create({
        data,
        select: { id: true, email: true },
      }),
  };
};

export type UserRepository = ReturnType<typeof createUserRepository>;