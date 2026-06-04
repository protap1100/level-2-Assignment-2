import type { Request, Response } from "express";
import { issueService } from "./issue.service";

const createIssue = async (req: Request, res: Response) => {
  const result = await issueService.createIssue(
    req.body,
    req.user!.id
  );

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

export const issueController = {
  createIssue,
  getAllIssues
};