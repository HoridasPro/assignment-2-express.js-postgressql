// import type { NextFunction, Request, Response } from "express";
// import jwt, { type JwtPayload } from "jsonwebtoken";
// import config from "../config/env";
// import { pool } from "../db";
// import { sendResponse } from "../utils/send.response";

// const auth = () => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     // create token
//     const token = req.headers.authorization;
//     if (!token) {
//       sendResponse(res, {
//         success: false,
//         message: "Authentication required. Token missing",
//         status: 401,
//         data: {},
//       });
//     }

//     // Decode
//     const decoded = jwt.verify(
//       token as string,
//       config.secret_access as string,
//     ) as JwtPayload;
//     const userData = await pool.query(
//       `
//       SELECT * FROM users WHERE email=$1
//       `,
//       [decoded.email],
//     );

//     if (userData.rows.length === 0) {
//       sendResponse(res, {
//         success: false,
//         message: "User not found",
//         status: 404,
//         data: {},
//       });
//     }

//     req.user = decoded;

//     next();
//   };
// };
// export default auth;

import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config/env";
import { pool } from "../db";
import { sendResponse } from "../utils/send.response";

const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // create token
    const token = req.headers.authorization;

    if (!token) {
      return sendResponse(res, {
        success: false,
        message: "Authentication required. Token missing",
        status: 401,
        data: {},
      });
    }

    // Decode
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

    if (userData.rows.length === 0) {
      return sendResponse(res, {
        success: false,
        message: "User not found",
        status: 404,
        data: {},
      });
    }

    // ✅ FIXED
    req.user = userData.rows[0];

    next();
  };
};

export default auth;
