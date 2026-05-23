import type { NextFunction, Request, Response } from "express";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("ERROR:", err);

  return res.status(500).json({
    success: false,
    message: err.message,
    errors: "Internal server error",
  });
};

export default globalErrorHandler;
