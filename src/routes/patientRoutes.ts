import { Router } from "express";
import { loginPatient, registerPatient, verifyPatient } from "../controllers/patientController";

const router = Router();

router.post(
    '/',
    registerPatient
)

router.post(
    '/verify',
    verifyPatient
)

router.post(
    '/login',
    loginPatient
)

const patientRoutes = router;

export default patientRoutes;