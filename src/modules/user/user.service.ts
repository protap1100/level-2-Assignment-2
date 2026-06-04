import bcrypt from "bcryptjs";
import type { IUser } from "./user.interface.js";
import { pool } from "../../db/index.js";

const createUserInfoDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at, updated_at
    `,
    [
      name,
      email,
      hashedPassword,
      role ?? "contributor",
    ]
  );
  return result.rows[0];
};
export const userService = {
  createUserInfoDB,
};