import { Router } from "express";
import auth from "../../middleware/auth.middleware";

const router = Router();

router.get("/test", auth("maintainer"), (req, res) => {
  res.json({
    success: true,
    message: "You are authenticated",
    user: (req as any).user,
  });
});

export const authTestRoute = router;
