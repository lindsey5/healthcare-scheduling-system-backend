import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import { getAdminNotifications, readAdminNotification, readAllAdminNotifications } from "../controllers/adminNotificationController";

const router = Router();

router.get(
    '/',
    authenticate,
    authorize("admin"),
    getAdminNotifications
)

router.patch(
    '/read',
    authenticate,
    authorize("admin"),
    readAllAdminNotifications
)

router.patch(
    '/read/:id',
    authenticate,
    authorize("admin"),
    readAdminNotification
)

const adminNotificationRoutes = router;

export default adminNotificationRoutes