import type { Request, Response } from "express";
import { sendResponse } from "../../utils/send.response";
import { signupLoginService } from "./auth.service";

// signup
const signup = async (req: Request, res: Response) => {
  const result = await signupLoginService.signupFromIntoDB(req.body);

  sendResponse(res, {
    message: "User registered successfully",
    success: true,
    status: 201,
    data: result,
  });
};

// login
const createLogin = async (req: Request, res: Response) => {
  const result = await signupLoginService.loginFromIntoDB(req.body);
  res.cookie("refreshToken", result.refreshToken);

  sendResponse(res, {
    success: true,
    message: "Login successfully",
    status: 200,
    data: {
      token: result.accessToken,
      user: result.user,
    },
  });
};

export const signupLoginControll = {
  signup,
  createLogin,
};
