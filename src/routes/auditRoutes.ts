import { Router } from "express";
import { getAudits } from "../controllers/auditController";

const router = Router();

router.get(
    '/',
    getAudits
)

const auditRoutes = router;

export default auditRoutes;