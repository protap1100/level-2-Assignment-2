import type { Request, Response } from "express";
import { userService } from "./user.service.js";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.createUserInfoDB(req.body);

    res.status(201).json({
      success: true,
      message: "User Created Successfully!",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};

export const userController = {
  createUser,
};