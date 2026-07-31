import { Router } from "express";
import { createService, getAvailableTimeSlot, getServices } from "../controllers/serviceController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.post(
    '/',
    authenticate,
    authorize("admin"),
    createService
)

router.get(
    '/',
    getServices
)

router.get(
    '/:id/available-time',
    getAvailableTimeSlot
)

const serviceRoutes = router;

export default serviceRoutes;