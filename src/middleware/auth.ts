import type { NextFunction, Request, Response } from "express";
import { sendIssueResponse } from "../utils/sendIssueResponse";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config/env";
import { pool } from "../db";

const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token) {
      sendIssueResponse(res, {
        success: false,
        message: "token not found",
        status: 401,
        data: {},
      });
    }

    const decoded = jwt.verify(
      token as string,
      config.secret_access as string,
    ) as JwtPayload;
    const userData = await pool.query(
      `
      SELECT * FROM users WHERE email=$1
      `,
      [decoded.email],
    );
    console.log("get user data", userData);

    if (userData.rows.length === 0) {
      sendIssueResponse(res, {
        success: false,
        message: "user not found",
        status: 404,
        data: {},
      });
    }
    req.user = decoded;

    next();
  };
};
export default auth;
