import { Router } from "express";
import { createService, getAvailableTimeSlot, getServices } from "../controllers/serviceController";

const router = Router();

router.post(
    '/',
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