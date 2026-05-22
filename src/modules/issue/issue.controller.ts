import type { Request, Response } from "express";
import { sendIssueResponse } from "../../utils/sendIssueResponse";
import { issueService } from "./issue.service";

const createIssue = async (req: Request, res: Response) => {
  // JWT middleware থেকে আসবে
  const reporter_id = req.user?.id;

  if (!reporter_id) {
    return sendIssueResponse(res, {
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

  return sendIssueResponse(res, {
    success: true,
    message: "Issue created successfully",
    status: 201,
    data: result,
  });
};

export const issuesController = { createIssue };
