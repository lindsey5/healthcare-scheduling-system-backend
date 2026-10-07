import { Router } from "express";
import { createService, deleteService, getAvailableServices, getServices, updateService } from "../controllers/serviceController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.post(
    '/',
    authenticate,
    authorize("admin", "staff"),
    createService
)

router.get(
    '/',
    getServices
);

router.get(
    "/available",
    getAvailableServices
);

router.put(
    '/:id',
    authenticate,
    authorize("admin", "staff"),
    updateService
)

router.delete(
    '/:id',
    authenticate,
    authorize("admin", "staff"),
    deleteService
)

const serviceRoutes = router;

export default serviceRoutes;