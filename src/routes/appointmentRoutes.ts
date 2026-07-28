import { Router } from "express";
import { createAppointment, getMyAppointments } from "../controllers/appointmentController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.post(
    "/",
    authenticate,
    authorize("patient"),
    createAppointment
);

router.get(
    "/me",
    authenticate,
    authorize("patient"),
    getMyAppointments
)

const appointmentRoutes = router;

export default appointmentRoutes;