import bcrypt from "bcryptjs";
import type { IUser } from "./auth.interface";
import { pool } from "../../db";
import { signToken } from "../../utils/jwt";

// Signup
const signupFromIntoDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;

  const hashPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users(name, email, password, role)
    VALUES($1, $2, $3, $4)
    RETURNING *
    `,
    [name, email, hashPassword, role],
  );

  const { password: _, ...userWithoutPassword } = result.rows[0];

  return userWithoutPassword;
};

// Login
const loginFromIntoDB = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;

  // find user
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email],
  );

  if (userData.rowCount === 0) {
    throw new Error("Invalid Credentials!");
  }

  const user = userData.rows[0];

  // match password
  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }

  // jwt payload
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
  };

  // access token
  const { accessToken, refreshToken } = signToken(jwtPayload);

  // remove password
  delete user.password;

  return {
    user,
    accessToken,
    refreshToken,
  };
};
export const signupLoginService = {
  signupFromIntoDB,
  loginFromIntoDB,
};
