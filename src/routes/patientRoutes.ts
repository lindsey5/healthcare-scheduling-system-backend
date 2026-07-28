import { Router } from "express";
import {
    registerPatient,
    loginPatient,
    verifyPatient,
} from "../controllers/patientController";

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

const patientRoutes = router;

export default patientRoutes;