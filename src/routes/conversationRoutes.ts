import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import { getPatientConversation, getStaffConversation } from "../controllers/conversationController";

const router = Router();

router.get(
    "/patient",
    authenticate,
    authorize("patient"),
    getPatientConversation
);

router.get(
    "/staff",
    authenticate,
    authorize("staff"),
    getStaffConversation
)

const conversationRoutes = router;

export default conversationRoutes;