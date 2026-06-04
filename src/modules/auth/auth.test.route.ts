import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.get("/test", authMiddleware.verifyToken("maintainer"), (req, res) => {
  res.json({
    success: true,
    message: "You are authenticated",
    user: (req as any).user,
  });
});

export const authTestRoute = router;
