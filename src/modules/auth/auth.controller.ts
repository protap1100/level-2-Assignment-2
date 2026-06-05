import type { Request, Response } from "express";
import { authServices } from "./auth.service";
import sendResponse from "../../utilities/sendReponse";

const signup = async (req: Request, res: Response) => {
  try {
    const result = await authServices.registerUser(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const result = await authServices.loginUser(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const authController = {
  signup,
  login,
};
