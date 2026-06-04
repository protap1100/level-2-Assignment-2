import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
import type { ROLES } from "../types";

interface AuthPayload extends JwtPayload {
  id: number;
  name: string;
  role: ROLES;
}

const verifyToken = (...roles: ROLES[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access",
        });
      }

      const decoded = jwt.verify(
        token,
        config.jwt_secret as string
      ) as AuthPayload;

      const userData = await pool.query(
        `SELECT * FROM users WHERE id = $1`,
        [decoded.id]
      );

      if (userData.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const user = userData.rows[0];

      // Role check
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to access this resource",
        });
      }

      req.user = {
        id: user.id,
        name: user.name,
        role: user.role,
      };

      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  };
};

export const authMiddleware = { verifyToken};