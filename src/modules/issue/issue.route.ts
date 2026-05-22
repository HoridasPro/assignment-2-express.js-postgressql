import { Router } from "express";
import { issuesController } from "./issue.controller";
import auth from "../../middleware/auth";

const router = Router();
router.post("/", auth(), issuesController.createIssue);
router.get("/", issuesController.getAllIssues);
router.get("/:id", issuesController.getSingleIssue);
export const issuesRoute = router;
