import { Router } from "express";
import { getAudits, getMyAudits, getRecentAudit } from "../controllers/auditController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.get(
    '/',
    authenticate,
    authorize('admin'),
    getAudits
)

router.get(
    '/me',
    authenticate,
    authorize('admin', 'staff'),
    getMyAudits
)

router.get(
    '/recent',
    authenticate,
    authorize('admin'),
    getRecentAudit
)

const auditRoutes = router;

export default auditRoutes;