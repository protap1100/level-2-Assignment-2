import type { Request, Response } from "express";
import { authServices } from "./auth.service";

const signup = async (req: Request, res: Response) => {
  try {
    const result = await authServices.registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const result = await authServices.loginUser(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const authController = {
  signup,
  login,
};
