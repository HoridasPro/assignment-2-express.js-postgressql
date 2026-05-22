import type { Response } from "express";
import type { ApiResponse } from "../type/type";

export const sendResponse = <T>(
  res: Response,
  { message, data, status, success, error }: ApiResponse<T>,
) => {
  return res.status(status).json({
    success: error ? false : success,
    message,
    data: error ? undefined : data,
  });
};
