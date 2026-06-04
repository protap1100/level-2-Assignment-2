import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../../db";
import type { ILogin, IRegister } from "./auth.interface";
import config from "../../config";

const registerUser = async (payload: IRegister) => {
  const { name, email, password, role } = payload;

  const hash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at, updated_at
    `,
    [name, email, hash, role ?? "contributor"],
  );

  return result.rows[0];
};

const loginUser = async (payload: ILogin) => {
  const { email, password } = payload;

  const userResult = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);

  if (userResult.rows.length === 0) {
    throw new Error("User not found");
  }

  const user = userResult.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }
  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      role: user.role,
    },
    config.jwt_secret as string,
    { expiresIn: "7d" },
  );
  delete user.password;
  return {
    token,
    user,
  };
};

export const authServices = {
  registerUser,
  loginUser,
};
