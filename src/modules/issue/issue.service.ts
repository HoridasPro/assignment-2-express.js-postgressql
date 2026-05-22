import { pool } from "../../db";
import type { IIssue } from "./issue.interfae";

const createIssueFromIntoDB = async (payload: IIssue) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `
      INSERT INTO issues(title, description, type, role)
      VALUES($1, $2, $3, $4)
      RETURNING *
      `,
    [title, description, type],
  );
  console.log("get the result", result);
};
export const isseueService = {
  createIssueFromIntoDB,
};
