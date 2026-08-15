import { Router } from "express";
import {
    createStaff,
    deleteStaff,
    getStaffs,
    loginStaff,
    staffChangePassword,
    updateStaff,
    updateStaffProfile,
} from "../controllers/staffController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.post(
    "/",
    createStaff
);

router.post(
    "/login",
    loginStaff
);

router.get(
    "/",
    authenticate,
    authorize("admin"),
    getStaffs
);

router.put(
    '/me',
    authenticate,
    authorize("staff"),
    updateStaffProfile
)

router.put(
    '/change-password',
    authenticate,
    authorize("staff"),
    staffChangePassword
)

router.put(
    "/:id",
    authenticate,
    authorize("admin"),
    updateStaff
);

router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    deleteStaff
);

const staffRoutes = router;

export default staffRoutes;