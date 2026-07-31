import { Router } from "express";
import { createAdmin, loginAdmin } from "../controllers/adminController";

const router = Router();

router.post(
    "/",
    createAdmin
);

router.post(
    "/login",
    loginAdmin
)

const adminRoutes = router;

export default adminRoutes;