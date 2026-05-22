import type { Request, Response } from "express";
import { isseueService } from "./issue.service";

const createIssue = async (req: Request, res: Response) => {
  const result = await isseueService.createIssueFromIntoDB(req.body);
  
};
export const issuesController = { createIssue };
