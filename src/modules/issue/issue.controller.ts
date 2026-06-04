import type { Request, Response } from "express";
import { issueService } from "./issue.service";

const createIssue = async (req: Request, res: Response) => {
  const result = await issueService.createIssue(req.body, req.user!.id);

  res.status(201).json({
    success: true,
    message: "Issue created successfully",
    data: result,
  });
};

const getAllIssues = async (req: Request, res: Response) => {
  const result = await issueService.getAllIssues(req.query);

  res.status(200).json({
    success: true,
    message: "Issues retrived successfully",
    data: result,
  });
};

const getSingleIssue = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const result = await issueService.getSingleIssue(id);

  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Issue not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Issue retrived successfully",
    data: result,
  });
};

const updateIssue = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const result = await issueService.updateIssue(id, req.body, req.user!);

  if (result?.error === "FORBIDDEN") {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to update this issue",
    });
  }

  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Issue not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Issue updated successfully",
    data: result,
  });
};

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
};
