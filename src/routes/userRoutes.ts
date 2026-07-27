import { Router } from "express";
import { registerUser, loginUser, verifyUser } from "../controllers/userController";
const router = Router();

router.post(
    '/register',
    registerUser
)

router.post(
    '/verify',
    verifyUser
)

router.post(
    '/login',
    loginUser
)

const patientRoutes = router;

export default patientRoutes;