

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/utils/send.response.ts
var sendResponse = (res, { message, data, status, success, error }) => {
  return res.status(status).json({
    success: error ? false : success,
    message,
    data: error ? void 0 : data
  });
};

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";

// src/config/env.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTION_STRING,
  port: process.env.PORT,
  secret_access: process.env.ACCESS_TOKEN,
  secret_refresh: process.env.REFRESH_TOKEN
};
var env_default = config;

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: env_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
      id SERIAL UNIQUE PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(20) DEFAULT 'contributor',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )
      `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS issues(
        id SERIAL UNIQUE PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'open',
        reporter_id INT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
        )
        `);
    console.log("The table is created successfully");
  } catch (error) {
    console.log(error);
  }
};

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
var signToken = (payload) => {
  const accessToken = jwt.sign(payload, env_default.secret_access, {
    expiresIn: "1d"
  });
  const refreshToken = jwt.sign(payload, env_default.secret_refresh, {
    expiresIn: "10d"
  });
  return { accessToken, refreshToken };
};

// src/modules/auth/auth.service.ts
var signupFromIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `
      INSERT INTO users(name, email, password, role)
      VALUES($1, $2, $3, $4)
      RETURNING *
      `,
      [name, email, hashPassword, role]
    );
    if (!result.rows[0]) {
      throw new Error("User not created");
    }
    const { password: _, ...userWithoutPassword } = result.rows[0];
    return userWithoutPassword;
  } catch (error) {
    if (error.code === "23505") {
      throw new Error("Email already exists");
    }
    throw new Error(error.message || "Database error occurred");
  }
};
var loginFromIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email]
  );
  if (userData.rowCount === 0) {
    throw new Error("Invalid Credentials!");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email
  };
  const { accessToken, refreshToken } = signToken(jwtPayload);
  delete user.password;
  return {
    user,
    accessToken,
    refreshToken
  };
};
var signupLoginService = {
  signupFromIntoDB,
  loginFromIntoDB
};

// src/utils/asyncHandler.ts
var asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
var asyncHandler_default = asyncHandler;

// src/modules/auth/auth.controller.ts
var signup = asyncHandler_default(async (req, res) => {
  const result = await signupLoginService.signupFromIntoDB(req.body);
  if (!result) {
    throw new Error("User registration failed");
  }
  return sendResponse(res, {
    message: "User registered successfully",
    success: true,
    status: 201,
    data: result
  });
});
var createLogin = asyncHandler_default(async (req, res) => {
  const result = await signupLoginService.loginFromIntoDB(req.body);
  res.cookie("refreshToken", result.refreshToken);
  sendResponse(res, {
    success: true,
    message: "Login successfully",
    status: 200,
    data: {
      token: result.accessToken,
      user: result.user
    }
  });
});
var signupLoginControll = {
  signup,
  createLogin
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", signupLoginControll.signup);
router.post("/login", signupLoginControll.createLogin);
var userRoute = router;

// src/middleware/error.handle.ts
var globalErrorHandler = (err, req, res, next) => {
  console.error("ERROR:", err);
  return res.status(500).json({
    success: false,
    message: err.message,
    errors: "Internal server error"
  });
};
var error_handle_default = globalErrorHandler;

// src/modules/issue/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/issue/issue.service.ts
var createIssueFromIntoDB = async (payload) => {
  const { reporter_id, title, description, type } = payload;
  const user = await pool.query(`SELECT * FROM users WHERE id=$1`, [
    reporter_id
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
    [reporter_id, title, description, type]
  );
  return result.rows[0];
};
var getAllIssuesFromBD = async (query) => {
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
  const values = [];
  const conditions = [];
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (conditions.length > 0) {
    baseQuery += " WHERE " + conditions.join(" AND ");
  }
  baseQuery += sort === "oldest" ? " ORDER BY created_at ASC" : " ORDER BY created_at DESC";
  const result = await pool.query(baseQuery, values);
  const issues = result.rows;
  const finalData = [];
  for (const issue of issues) {
    const userResult = await pool.query(
      `SELECT id, name, role FROM users WHERE id = $1`,
      [issue.reporter_id]
    );
    finalData.push({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: userResult.rows[0] || null,
      created_at: issue.created_at,
      updated_at: issue.updated_at
    });
  }
  return finalData;
};
var getSingleIssueFromDB = async (id) => {
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    id
  ]);
  if (issueResult.rowCount === 0) {
    throw new Error("Issue not found");
  }
  const issue = issueResult.rows[0];
  const userResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [issue.reporter_id]
  );
  const reporter = userResult.rows[0] || null;
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
};
var updateIssueFromDB = async (id, payload, user) => {
  const { title, description, type } = payload;
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    id
  ]);
  if (issueResult.rowCount === 0) {
    throw new Error("Issue not found");
  }
  const issue = issueResult.rows[0];
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
    [title, description, type, id]
  );
  return result.rows[0];
};
var deleteDataFromDB = async (id, user) => {
  if (user.role !== "maintainer") {
    throw new Error("Only maintainers can delete issues");
  }
  const issue = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id]);
  if (issue.rowCount === 0) {
    throw new Error("Issue not found");
  }
  await pool.query(`DELETE FROM issues WHERE id = $1`, [id]);
  return issue;
};
var issueService = {
  createIssueFromIntoDB,
  getAllIssuesFromBD,
  getSingleIssueFromDB,
  updateIssueFromDB,
  deleteDataFromDB
};

// src/modules/issue/issue.controller.ts
var createIssue = asyncHandler_default(async (req, res) => {
  const reporter_id = req.user?.id;
  if (!reporter_id) {
    return sendResponse(res, {
      success: false,
      message: "Unauthorized user",
      status: 401,
      data: {}
    });
  }
  const result = await issueService.createIssueFromIntoDB({
    ...req.body,
    reporter_id
  });
  return sendResponse(res, {
    success: true,
    message: "Issue created successfully",
    status: 201,
    data: result
  });
});
var getAllIssues = asyncHandler_default(async (req, res) => {
  try {
    const result = await issueService.getAllIssuesFromBD(req.query);
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
var getSingleIssue = asyncHandler_default(async (req, res) => {
  const id = Number(req.params.id);
  const result = await issueService.getSingleIssueFromDB(id);
  res.status(200).json({
    success: true,
    data: result
  });
});
var updateIssue = asyncHandler_default(async (req, res) => {
  const id = Number(req.params.id);
  const user = req.user;
  const result = await issueService.updateIssueFromDB(id, req.body, user);
  if (!result) {
    throw new Error("Issue not found or update failed");
  }
  return sendResponse(res, {
    success: true,
    message: "Issue updated successfully",
    status: 200,
    data: result
  });
});
var deleteIssueData = asyncHandler_default(
  async (req, res) => {
    const id = Number(req.params.id);
    const result = await issueService.deleteDataFromDB(id, req.user);
    if (!result) {
      throw new Error("Issue not found or already deleted");
    }
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully"
    });
  }
);
var issuesController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssueData
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = () => {
  return async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      return sendResponse(res, {
        success: false,
        message: "Unauthorized access",
        status: 401,
        data: {}
      });
    }
    const decoded = jwt2.verify(
      token,
      env_default.secret_access
    );
    const userData = await pool.query(
      `
      SELECT * FROM users WHERE email=$1
      `,
      [decoded.email]
    );
    if (userData.rows.length === 0) {
      return sendResponse(res, {
        success: false,
        message: "User not found",
        status: 404,
        data: {}
      });
    }
    req.user = userData.rows[0];
    next();
  };
};
var auth_default = auth;

// src/modules/issue/issue.route.ts
var router2 = Router2();
router2.post("/", auth_default(), issuesController.createIssue);
router2.get("/", issuesController.getAllIssues);
router2.get("/:id", issuesController.getSingleIssue);
router2.put("/:id", auth_default(), issuesController.updateIssue);
router2.delete("/:id", auth_default(), issuesController.deleteIssueData);
var issuesRoute = router2;

// src/middleware/logger.ts
import fs from "fs";
var logger = (req, res, next) => {
  console.log("METHOD - URL -Time:", req.method, req.url, Date.now());
  const log = `
Method => ${req.method} - Time => ${Date.now()} - URL => ${req.url}
`;
  fs.appendFile("logger.txt", log, (err) => {
    console.log(err);
  });
  next();
};
console.log(logger);
var logger_default = logger;

// src/app.ts
var app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use(logger_default);
app.use("/api/auth", userRoute);
app.use("/api/issues", issuesRoute);
app.use(error_handle_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(env_default.port, () => {
    console.log(`Example app listening on port ${env_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map