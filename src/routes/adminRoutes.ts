import { Router } from "express";
import { adminChangePassword, createAdmin, deleteAdmin, getAdmins, loginAdmin, updateAdmin, updateAdminProfile } from "../controllers/adminController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.post(
    "/",
    authenticate,
    authorize("admin"),
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
    '/me',
    authenticate,
    authorize("admin"),
    updateAdminProfile
)

router.put(
    '/change-password',
    authenticate,
    authorize("admin"),
    adminChangePassword
)

router.put(
    '/:id',
    authenticate,
    authorize("admin"),
    updateAdmin
)

router.delete(
    '/:id',
    authenticate,
    authorize("admin"),
    deleteAdmin
)

const adminRoutes = router;

export default adminRoutes;