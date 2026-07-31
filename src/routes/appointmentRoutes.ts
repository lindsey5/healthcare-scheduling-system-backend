import { Router } from "express";
import { createAppointment, getAppointments, getAvailableTimeSlot, getMyAppointments } from "../controllers/appointmentController";
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

const appointmentRoutes = router;

export default appointmentRoutes;