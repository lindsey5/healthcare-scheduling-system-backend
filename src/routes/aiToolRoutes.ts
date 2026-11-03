import { Router } from "express";
import { getAiServiceAvailability } from "../controllers/aiAvailabilityController";

const router = Router();

router.post("/available-slots", getAiServiceAvailability);

export default router;
