import { Router } from "express";
import { createDoctor, getDoctors } from "../controllers/doctorController";

const router = Router();

router.post(
    "/",
    createDoctor
);

router.get(
    '/',
    getDoctors
)

const doctorRoutes = router;

export default doctorRoutes;