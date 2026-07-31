import { Router } from "express";
import { createDoctor, getDoctors } from "../controllers/doctorController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.post(
    "/",
    authenticate,
    authorize("admin"),
    createDoctor
);

router.get(
    '/',
    authenticate,
    getDoctors
)

const doctorRoutes = router;

export default doctorRoutes;