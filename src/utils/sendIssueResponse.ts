import type { Response } from "express";
import type { issueResponse } from "../type/type";

export const sendIssueResponse = <T>(
  res: Response,
  { message, data, status, success, error }: issueResponse<T>,
) => {
  return res.status(status).json({
    success: error ? false : success,
    message,
    data: error ? undefined : data,
  });
};
