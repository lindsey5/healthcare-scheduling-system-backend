import { Router } from "express";
import { createDoctor, deleteDoctor, getDoctors, updateDoctor } from "../controllers/doctorController";
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

router.put(
    '/:id',
    authenticate,
    authorize("admin"),
    updateDoctor
)

router.delete(
    '/:id',
    authenticate,
    authorize("admin"),
    deleteDoctor
)

const doctorRoutes = router;

export default doctorRoutes;