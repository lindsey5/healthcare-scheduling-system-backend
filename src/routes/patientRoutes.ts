import { Router } from "express";
import {
    registerPatient,
    loginPatient,
    verifyPatient,
    getPatients,
    getTotalPatients,
} from "../controllers/patientController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.post(
    "/register",
    registerPatient
);

router.post(
    "/verify",
    verifyPatient
);

router.post(
    "/login",
    loginPatient
);

router.get(
    '/',
    authenticate,
    authorize("staff", "admin"),
    getPatients
)

router.get(
    '/total',
    authenticate,
    authorize("staff", "admin"),
    getTotalPatients
)

const patientRoutes = router;

export default patientRoutes;