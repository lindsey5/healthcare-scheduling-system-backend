import { Router } from "express";
import { createDoctor, deleteDoctor, getDoctors, updateDoctor } from "../controllers/doctorController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.post(
    "/",
    authenticate,
    authorize("admin", "staff"),
    createDoctor
);

router.get(
    '/',
    authenticate,
    getDoctors
)

router.put(
    '/:id',
    authenticate,
    authorize("admin", "staff"),
    updateDoctor
)

router.delete(
    '/:id',
    authenticate,
    authorize("admin", "staff"),
    deleteDoctor
)

const doctorRoutes = router;

export default doctorRoutes;