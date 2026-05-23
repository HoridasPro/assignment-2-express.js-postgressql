import bcrypt from "bcryptjs";
import type { IReturnUser, IUser } from "./auth.interface";
import { pool } from "../../db";
import { signToken } from "../../utils/jwt";

// Signup
const signupFromIntoDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;

  try {
    const hashPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users(name, email, password, role)
      VALUES($1, $2, $3, $4)
      RETURNING *
      `,
      [name, email, hashPassword, role],
    );

    if (!result.rows[0]) {
      throw new Error("User not created");
    }

    const { password: _, ...userWithoutPassword } = result.rows[0];

    return userWithoutPassword;
  } catch (error: any) {
    if (error.code === "23505") {
      throw new Error("Email already exists");
    }

    throw new Error(error.message || "Database error occurred");
  }
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
  const jwtPayload: IReturnUser = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
  };
  const { accessToken, refreshToken } = signToken(jwtPayload);
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
