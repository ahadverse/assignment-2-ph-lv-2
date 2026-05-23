import pgPool from "../../config/database";
import { User, PublicUser, SignupBody } from "../../types";

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pgPool.query<User>(
    "SELECT * FROM users WHERE email = $1",
    [email],
  );
  return result?.rows?.[0] || null;
};

export const createUser = async (
  data: Omit<SignupBody, "password"> & { hashedPassword: string },
): Promise<PublicUser> => {
  const { name, email, hashedPassword, role = "contributor" } = data;
  const result = await pgPool.query<PublicUser>(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashedPassword, role],
  );
  return result?.rows?.[0] || null;
};
