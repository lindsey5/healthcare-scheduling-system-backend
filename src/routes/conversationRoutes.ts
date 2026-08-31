import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import { endConversation, getConversations, getConversationById, getPatientConversation, getUnreadMessages, getStaffConversationById, handleReadAll, getStaffConversations, readAllMessagesById, getStaffUnreadMessagesById } from "../controllers/conversationController";

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
    getStaffConversations
)

router.get(
    "/staff/:id",
    authenticate,
    authorize("staff"),
    getStaffConversationById
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
    authorize('patient', 'staff'),
    getUnreadMessages
)

router.get(
    '/unread/:id',
    authenticate,
    authorize('staff'),
    getStaffUnreadMessagesById
)

router.get(
    '/:id',
    authenticate,
    authorize('admin'),
    getConversationById
)

router.post(
    '/read',
    authenticate,
    authorize('patient'),
    handleReadAll
)

router.post(
    "/read/:id",
    authenticate,
    authorize("staff"),
    readAllMessagesById
)

router.post(
    '/end/:id',
    authenticate,
    authorize('staff'),
    endConversation
)

const conversationRoutes = router;

export default conversationRoutes;