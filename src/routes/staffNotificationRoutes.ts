import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import {
    getStaffNotifications,
    readStaffNotification,
    readAllStaffNotifications,
} from "../controllers/staffNotificationController";

const router = Router();

router.get(
    "/",
    authenticate,
    authorize("staff"),
    getStaffNotifications
);

router.patch(
    "/read",
    authenticate,
    authorize("staff"),
    readAllStaffNotifications
);

router.patch(
    "/read/:id",
    authenticate,
    authorize("staff"),
    readStaffNotification
);

const staffNotificationRoutes = router;

export default staffNotificationRoutes;