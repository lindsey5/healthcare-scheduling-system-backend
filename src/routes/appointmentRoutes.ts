import { Router } from "express";
import { cancelAppointment, createAppointment, getAppointments, getAvailableTimeSlot, getCancelledAppointments, getCompletedAppointments, getMyAppointments, getPatientCompletedAppointments, getPatientPendingAppointments, getPatientUpcomingAppointments, getPendingAppointments, getTodayAppointments, getUpcomingAppointments, updateAppointmentStatus } from "../controllers/appointmentController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.post(
    "/",
    authenticate,
    authorize("patient"),
    createAppointment
);

router.get(
    "",
    authenticate,
    authorize("admin", "staff"),
    getAppointments
)

router.get(
    "/me",
    authenticate,
    authorize("patient"),
    getMyAppointments
)

router.get(
    "/available-time",
    authenticate,
    authorize("patient"),
    getAvailableTimeSlot
)

router.get(
    '/today',
    authenticate,
    authorize("staff", "admin"),
    getTodayAppointments
)

router.get(
    '/pending',
    authenticate,
    authorize("staff", "admin"),
    getPendingAppointments
)

router.get(
    '/upcoming',
    authenticate,
    authorize("staff", "admin"),
    getUpcomingAppointments
)

router.get(
    '/completed',
    authenticate,
    authorize("staff", "admin"),
    getCompletedAppointments
)

router.get(
    '/cancelled',
    authenticate,
    authorize("staff", "admin"),
    getCancelledAppointments
)

router.get(
    '/upcoming/patient',
    authenticate,
    authorize("patient"),
    getPatientUpcomingAppointments
)

router.get(
    '/pending/patient',
    authenticate,
    authorize("patient"),
    getPatientPendingAppointments
)

router.get(
    '/completed/patient',
    authenticate,
    authorize("patient"),
    getPatientCompletedAppointments
)

router.patch(
    '/cancel/:id',
    authenticate,
    authorize('patient'),
    cancelAppointment
)

router.patch(
    '/status/:id',
    authenticate,
    authorize("admin", "staff"),
    updateAppointmentStatus
)

const appointmentRoutes = router;

export default appointmentRoutes;