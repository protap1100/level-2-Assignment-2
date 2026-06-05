import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import sendResponse from "../../utilities/sendReponse";

const createIssue = async (req: Request, res: Response) => {
  try {
    const result = await issueService.createIssue(req.body, req.user!.id);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Failed to create issue",
      data: null,
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const result = await issueService.getAllIssues(req.query);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Failed to fetch issues",
      data: null,
    });
  }
};

const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const result = await issueService.getSingleIssue(id);

    if (!result) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        data: null,
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Failed to get issue",
      data: null,
    });
  }
};

const updateIssue = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const result = await issueService.updateIssue(id, req.body, req.user!);

    if (result?.error === "FORBIDDEN") {
      return sendResponse(res, {
        statusCode: 403,
        success: false,
        message: "You do not have permission to update this issue",
        data: null,
      });
    }

    if (!result) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        data: null,
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result,
    });
  } catch (error: any) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Failed to update issue",
      data: null,
    });
  }
};

const deleteIssue = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const result = await issueService.deleteIssue(id);

    if (!result) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        data: null,
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
      data: null,
    });
  } catch (error: any) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Failed to delete issue",
      data: null,
    });
  }
};

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
