import { Router } from "express";
import { createAdmin, getAdmins, loginAdmin, updateAdmin } from "../controllers/adminController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.post(
    "/",
    createAdmin
);

router.post(
    "/login",
    loginAdmin
)

router.get(
    '/',
    authenticate,
    authorize("admin"),
    getAdmins
)

router.put(
    '/',
    authenticate,
    authorize("admin"),
    updateAdmin
)

const adminRoutes = router;

export default adminRoutes;