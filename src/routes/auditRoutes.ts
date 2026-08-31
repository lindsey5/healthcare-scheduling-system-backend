import { Router } from "express";
import { getAudits, getRecentAudit } from "../controllers/auditController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.get(
    '/',
    authenticate,
    authorize('admin'),
    getAudits
)

router.get(
    '/recent',
    authenticate,
    authorize('admin'),
    getRecentAudit
)

const auditRoutes = router;

export default auditRoutes;