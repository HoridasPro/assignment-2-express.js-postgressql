import { Router } from "express";
import { issuesController } from "./issue.controller";
import auth from "../../middleware/auth";

const router = Router();
router.post("/", auth(), issuesController.createIssue);
// router.get("/", auth(), issuesController.createIssue);
export const issuesRoute = router;
