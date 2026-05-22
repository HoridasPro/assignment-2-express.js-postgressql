import express from "express";
import { userRoute as authRoute } from "./modules/auth/auth.route";
import globalErrorHandler from "./middleware/error.handle";

import { issuesRoute } from "./modules/issue/issue.route";
const app = express();

// Middle ware
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(globalErrorHandler);

// Signup and login
app.use("/api/auth", authRoute);

// Get all data
app.use("/api/issues", issuesRoute);
export default app;
