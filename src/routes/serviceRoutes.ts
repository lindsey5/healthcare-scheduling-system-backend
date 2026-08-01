import { Router } from "express";
import { createService, deleteService, getServices, updateService } from "../controllers/serviceController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.post(
    '/',
    authenticate,
    authorize("admin"),
    createService
)

router.get(
    '/',
    getServices
);

router.put(
    '/:id',
    authenticate,
    authorize("admin"),
    updateService
)

router.delete(
    '/:id',
    authenticate,
    authorize("admin"),
    deleteService
)

const serviceRoutes = router;

export default serviceRoutes;