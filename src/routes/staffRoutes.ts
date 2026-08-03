import { Router } from "express";
import {
    createStaff,
    deleteStaff,
    getStaffs,
    loginStaff,
    updateStaff,
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