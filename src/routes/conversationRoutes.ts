import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import { endConversation, getConversations, getMessages, getPatientConversation, getUnreadMessages, getStaffConversation, handleReadAll } from "../controllers/conversationController";

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
    authorize('admin', 'staff'),
    getConversations
)

router.get(
    '/unread',
    authenticate,
    authorize('patient'),
    getUnreadMessages
)

router.get(
    '/messages/:id',
    authenticate,
    authorize('admin'),
    getMessages
)

router.post(
    '/read',
    authenticate,
    authorize('patient'),
    handleReadAll
)

router.post(
    '/end/:id',
    authenticate,
    authorize('staff'),
    endConversation
)

const conversationRoutes = router;

export default conversationRoutes;