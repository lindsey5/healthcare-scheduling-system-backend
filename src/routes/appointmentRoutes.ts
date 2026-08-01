import { Router } from "express";
import { cancelAppointment, createAppointment, getAppointments, getAvailableTimeSlot, getMyAppointments, updateAppointmentStatus } from "../controllers/appointmentController";
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