import type { Request, Response } from "express";

import { issueService } from "./issue.service";
import { sendResponse } from "../../utils/send.response";

const createIssue = async (req: Request, res: Response) => {
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
};

// const getAllIssues = async (req: Request, res: Response) => {
//   try {
//     const result = await issueService.getAllIssuesFromBD();

//     return res.status(200).json({
//       success: true,
//       data: result,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: (error as Error).message,
//     });
//   }
// };

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const result = await issueService.getAllIssuesFromBD(req.query);

    return res.status(200).json({
      success: true,
      data: result, // ✅ array
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

// get single issue

const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const result = await issueService.getSingleIssueFromDB(id);

    return res.status(200).json({
      success: true,
      data: result, // ✅ object
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const issuesController = { createIssue, getAllIssues, getSingleIssue };
