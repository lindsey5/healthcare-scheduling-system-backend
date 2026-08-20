import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import { getConversations, getMessages, getPatientConversation, getStaffConversation } from "../controllers/conversationController";

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

router.get(
    '/',
    authenticate,
    authorize('admin'),
    getConversations
)

router.get(
    '/messages/:id',
    authenticate,
    authorize('admin'),
    getMessages
)

const conversationRoutes = router;

export default conversationRoutes;