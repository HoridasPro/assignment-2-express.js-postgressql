import { pool } from "../../db";
import type { IIssue, IIssues } from "./issue.interfae";
import asyncHandler from "./../../utils/asyncHandler";
import type { IReturnUser } from "../auth/auth.interface";

const createIssueFromIntoDB = async (payload: IIssue) => {
  const { reporter_id, title, description, type } = payload;

  const user = await pool.query(`SELECT * FROM users WHERE id=$1`, [
    reporter_id,
  ]);

  if (user.rowCount === 0) {
    throw new Error("Invalid Credentials!");
  }

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

// get all issues
const getAllIssuesFromBD = async (query: any) => {
  const { sort = "newest", type, status } = query;

  const allowedSort = ["newest", "oldest"];
  const allowedType = ["bug", "feature_request"];
  const allowedStatus = ["open", "in_progress", "resolved"];

  if (sort && !allowedSort.includes(sort)) {
    throw new Error("Invalid sort value");
  }

  if (type && !allowedType.includes(type)) {
    throw new Error("Invalid type value");
  }

  if (status && !allowedStatus.includes(status)) {
    throw new Error("Invalid status value");
  }

  let baseQuery = `SELECT * FROM issues`;

  const values: any[] = [];
  const conditions: string[] = [];

  // ✅ filter by type
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }

  // ✅ filter by status
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  // ✅ add WHERE condition
  if (conditions.length > 0) {
    baseQuery += " WHERE " + conditions.join(" AND ");
  }

  // ✅ sorting
  baseQuery +=
    sort === "oldest"
      ? " ORDER BY created_at ASC"
      : " ORDER BY created_at DESC";

  const result = await pool.query(baseQuery, values);

  const issues = result.rows;

  // ✅ attach reporter info
  const finalData = [];

  for (const issue of issues) {
    const userResult = await pool.query(
      `SELECT id, name, role FROM users WHERE id = $1`,
      [issue.reporter_id],
    );

    finalData.push({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: userResult.rows[0] || null,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    });
  }

  return finalData;
};

// get single ussue

const getSingleIssueFromDB = async (id: number) => {
  // 1. get issue
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    id,
  ]);

  if (issueResult.rowCount === 0) {
    throw new Error("Issue not found");
  }

  const issue = issueResult.rows[0];

  // 2. get reporter (NO JOIN)
  const userResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [issue.reporter_id],
  );

  const reporter = userResult.rows[0] || null;

  // 3. final response shape
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};

// Update issue

// const updateIssueFromDB = asyncHandler(
//   async (payload: IIssues, user: IReturnUser) => {
//     const { title, description, type, status, id } = payload;

//     // 1. check issue exists
//     const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
//       id,
//     ]);
//     console.log("issue result", issueResult);

//     if (issueResult.rowCount === 0) {
//       throw new Error("Issue not found");
//     }

//     const issue = issueResult.rows[0];

//     // Maintainer -> can update any issue
//     if (user.role === "maintainer") {
//       const result = await pool.query(
//         `
//       UPDATE issues
//       SET
//         title = COALESCE($1, title),
//         description = COALESCE($2, description),
//         type = COALESCE($3, type),
//         status = COALESCE($4, status),
//         updated_at = NOW()
//       WHERE id = $5
//       RETURNING *
//       `,
//         [title, description, type, status, id],
//       );

//       return result.rows[0];
//     }

//     if (
//       user.role === "contributor" &&
//       issue.reporter_id === user.id &&
//       issue.status === "open"
//     ) {
//       const result = await pool.query(
//         `
//       UPDATE issues
//       SET
//         title = COALESCE($1, title),
//         description = COALESCE($2, description),
//         type = COALESCE($3, type),
//         status = COALESCE($4, status),
//         updated_at = NOW()
//       WHERE id = $5
//       RETURNING *
//       `,
//         [title, description, type, status, id],
//       );

//       return result.rows[0];
//     }

//     throw new Error("You are not authorized to update this issue");
//   },
// );

const updateIssueFromDB = async (
  id: number,
  payload: any,
  user: any, // JWT user
) => {
  const { title, description, type } = payload;

  // 1. get issue
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    id,
  ]);

  if (issueResult.rowCount === 0) {
    throw new Error("Issue not found");
  }

  const issue = issueResult.rows[0];

  // 2. check role permission
  const isMaintainer = user.role === "maintainer";
  const isOwner = issue.reporter_id === user.id;
  const isOpen = issue.status === "open";

  if (!isMaintainer) {
    if (!isOwner) {
      throw new Error("You can only update your own issue");
    }

    if (!isOpen) {
      throw new Error("You can only update open issues");
    }
  }

  // 3. update issue
  const result = await pool.query(
    `
    UPDATE issues
    SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      type = COALESCE($3, type),
      updated_at = NOW()
    WHERE id = $4
    RETURNING *
    `,
    [title, description, type, id],
  );

  return result.rows[0];
};

export const issueService = {
  createIssueFromIntoDB,
  getAllIssuesFromBD,
  getSingleIssueFromDB,
  updateIssueFromDB,
};
