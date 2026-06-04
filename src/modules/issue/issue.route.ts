import { Router } from "express";
import auth from "../../middleware/auth.middleware";
import { issueController } from "./issue.controller";

const router = Router();

router.post("/", auth(), issueController.createIssue);
router.get("/", issueController.getAllIssues);
router.get("/:id", issueController.getSingleIssue);
router.patch("/:id", auth(), issueController.updateIssue);
router.delete("/:id", auth("maintainer"), issueController.deleteIssue);

export const issueRoute = router;