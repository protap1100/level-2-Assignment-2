import type { Request, Response } from "express";
import { userService } from "./user.service.js";
import sendResponse from "../../utilities/sendReponse.js";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.createUserInfoDB(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User retrived successfully",
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

export const userController = {
  createUser,
};