import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import { getPatientNotifications, readAllPatientNotifications, readPatientNotification } from "../controllers/patientNotificationController";

const router = Router();

router.get(
    '/',
    authenticate,
    authorize("patient"),
    getPatientNotifications
)

router.patch(
    '/read',
    authenticate,
    authorize("patient"),
    readAllPatientNotifications
)

router.patch(
    '/read/:id',
    authenticate,
    authorize("patient"),
    readPatientNotification
)

const patientNotificationRoutes = router;

export default patientNotificationRoutes