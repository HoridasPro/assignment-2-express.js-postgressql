import { pool } from "../../db";
import type { IIssue } from "./issue.interfae";

const createIssueFromIntoDB = async (payload: IIssue) => {
  const { reporter_id, title, description, type } = payload;

  // user check
  const user = await pool.query(`SELECT * FROM users WHERE id=$1`, [
    reporter_id,
  ]);

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

// const getAllIssuesFromBD = async (query: any) => {
//   const { sort = "newest", type, status } = query;

//   // ✅ validation
//   const allowedSort = ["newest", "oldest"];
//   const allowedType = ["bug", "feature_request"];
//   const allowedStatus = ["open", "in_progress", "resolved"];

//   if (sort && !allowedSort.includes(sort)) {
//     throw new Error("Invalid sort value");
//   }

//   if (type && !allowedType.includes(type)) {
//     throw new Error("Invalid type value");
//   }

//   if (status && !allowedStatus.includes(status)) {
//     throw new Error("Invalid status value");
//   }

//   let baseQuery = `SELECT * FROM issues`;

//   const values: any[] = [];
//   const conditions: string[] = [];

//   // ✅ filter by type
//   if (type) {
//     values.push(type);
//     conditions.push(`type = $${values.length}`);
//   }

//   // ✅ filter by status
//   if (status) {
//     values.push(status);
//     conditions.push(`status = $${values.length}`);
//   }

//   // ✅ add WHERE condition
//   if (conditions.length > 0) {
//     baseQuery += " WHERE " + conditions.join(" AND ");
//   }

//   // ✅ sorting
//   baseQuery +=
//     sort === "oldest"
//       ? " ORDER BY created_at ASC"
//       : " ORDER BY created_at DESC";

//   const result = await pool.query(baseQuery, values);

//   const issues = result.rows;

//   // ✅ attach reporter info
//   const finalData = [];

//   for (const issue of issues) {
//     const userResult = await pool.query(
//       `SELECT id, name, role FROM users WHERE id = $1`,
//       [issue.reporter_id],
//     );

//     finalData.push({
//       id: issue.id,
//       title: issue.title,
//       description: issue.description,
//       type: issue.type,
//       status: issue.status,
//       reporter: userResult.rows[0] || null,
//       created_at: issue.created_at,
//       updated_at: issue.updated_at,
//     });
//   }

//   return finalData;
// };
const getAllIssuesFromBD = async (query: any) => {
  const { sort = "newest", type, status } = query;

  // ✅ validation
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

export const issueService = {
  createIssueFromIntoDB,
  getAllIssuesFromBD,
  getSingleIssueFromDB,
};
