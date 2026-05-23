import config from "../config/env";
import type { IReturnUser } from "../modules/auth/auth.interface";
import jwt from "jsonwebtoken";

export const signToken = (payload: IReturnUser) => {
  const accessToken = jwt.sign(payload, config.secret_access as string, {
    expiresIn: "1d",
  });
  const refreshToken = jwt.sign(payload, config.secret_refresh as string, {
    expiresIn: "10d",
  });
  return { accessToken, refreshToken };
};
