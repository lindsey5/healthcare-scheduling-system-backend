import { Router } from "express";
import {
    registerPatient,
    loginPatient,
    verifyPatient,
    getPatients,
    getTotalPatients,
    resendVerificationCode,
    updatePatientOwn,
    patientChangePassword,
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

router.post(
    "/resend-verification-code", 
    resendVerificationCode
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

router.put(
    '/me',
    authenticate,
    authorize('patient'),
    updatePatientOwn
)

router.put(
    '/change-password',
    authenticate,
    authorize('patient'),
    patientChangePassword
)

const patientRoutes = router;

export default patientRoutes;