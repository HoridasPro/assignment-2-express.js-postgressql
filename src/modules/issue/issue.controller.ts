import type { Request, Response } from "express";

import { issueService } from "./issue.service";
import { sendResponse } from "../../utils/send.response";
import asyncHandler from "../../utils/asyncHandler";

const createIssue = asyncHandler(async (req: Request, res: Response) => {
  // JWT middleware থেকে আসবে
  const reporter_id = req.user?.id;

  if (!reporter_id) {
    return sendResponse(res, {
      success: false,
      message: "Unauthorized user",
      status: 401,
      data: {},
    });
  }

  const result = await issueService.createIssueFromIntoDB({
    ...req.body,
    reporter_id,
  });

  return sendResponse(res, {
    success: true,
    message: "Issue created successfully",
    status: 201,
    data: result,
  });
});

//  get all issues
const getAllIssues = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await issueService.getAllIssuesFromBD(req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
});

// get single issue

const getSingleIssue = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const result = await issueService.getSingleIssueFromDB(id);

  res.status(200).json({
    success: true,
    data: result,
  });
});

// Update issue

const updateIssue = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const user = req.user;

  const result = await issueService.updateIssueFromDB(id, req.body, user);
  if (!result) {
    throw new Error("Issue not found or update failed");
  }
  return sendResponse(res, {
    success: true,
    message: "Issue updated successfully",
    status: 200,
    data: result,
  });
});

// delete issue

export const deleteIssueData = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const result = await issueService.deleteDataFromDB(id, req.user);
    if (!result) {
      throw new Error("Issue not found or already deleted");
    }
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  },
);

export const issuesController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssueData,
};
