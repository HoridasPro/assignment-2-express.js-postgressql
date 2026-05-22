import { pool } from "../../db";
import type { IIssue } from "./issue.interfae";

const createIssueFromIntoDB = async (payload: IIssue) => {
  const { reporter_id, title, description, type } = payload;

  // user check
  const user = await pool.query(`SELECT * FROM users WHERE id=$1`, [
    reporter_id,
  ]);
  console.log("get user --------", user);

  if (user.rowCount === 0) {
    throw new Error("Invalid Credentials!");
  }

  // insert issue
  const result = await pool.query(
    `
      INSERT INTO issues(reporter_id, title, description, type)
      VALUES($1, $2, $3, $4)
      RETURNING *
    `,
    [reporter_id, title, description, type],
  );

  return result.rows[0];
};

export const issueService = {
  createIssueFromIntoDB,
};
