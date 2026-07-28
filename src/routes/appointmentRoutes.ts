import { Router } from "express";
import { createAppointment } from "../controllers/appointmentController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.post(
    "/",
    authenticate,
    authorize("patient"),
    createAppointment
);

const appointmentRoutes = router;

export default appointmentRoutes;