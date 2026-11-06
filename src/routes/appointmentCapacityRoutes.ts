import { Router } from "express";
import {
    getAppointmentCapacities,
    updateAppointmentCapacity,
} from "../controllers/appointmentCapacityController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authenticate, authorize("admin"), getAppointmentCapacities);
router.put(
    "/:dayOfWeek",
    authenticate,
    authorize("admin"),
    updateAppointmentCapacity
);

export default router;
