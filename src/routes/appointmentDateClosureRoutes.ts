import { Router } from "express";
import {
    createAppointmentDateClosure,
    deleteAppointmentDateClosure,
    getAppointmentDateClosures,
} from "../controllers/appointmentDateClosureController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.get(
    "/",
    authenticate,
    authorize("admin", "staff", "patient"),
    getAppointmentDateClosures
);

router.post(
    "/",
    authenticate,
    authorize("admin"),
    createAppointmentDateClosure
);

router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    deleteAppointmentDateClosure
);

export default router;
