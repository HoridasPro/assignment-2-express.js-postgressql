import type { NextFunction, Request, Response } from "express";
const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("ERROR:", err.message);

  return res.status(401).json({
    success: false,
    message: err.message || "Something went wrong",
    data: {},
  });
};

export default globalErrorHandler;
