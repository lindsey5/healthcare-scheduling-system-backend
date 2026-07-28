import { Router } from "express";
import { createDoctor, getDoctors } from "../controllers/doctorController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post(
    "/",
    createDoctor
);

router.get(
    '/',
    authenticate,
    getDoctors
)

const doctorRoutes = router;

export default doctorRoutes;