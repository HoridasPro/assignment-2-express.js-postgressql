import express from "express";
import { userRoute as authRoute } from "./modules/auth/auth.route";
import globalErrorHandler from "./middleware/error.handle";

import { issuesRoute } from "./modules/issue/issue.route";
import logger from "./middleware/logger";
const app = express();

// Middle ware
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use(logger);

// Signup and login
app.use("/api/auth", authRoute);

// create all issue
app.use("/api/issues", issuesRoute);
app.use(globalErrorHandler);
export default app;
