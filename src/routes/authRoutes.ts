import { Router } from "express";
import { refreshAccessToken } from "../controllers/authController";

const router = Router();

router.post(
    "/refreshToken",
    refreshAccessToken
);

const authRoutes = router;

export default authRoutes;