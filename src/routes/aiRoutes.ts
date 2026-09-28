import { Router } from "express";
import { chatAI } from "../controllers/aiController";

const router = Router();

router.post('/chat', chatAI);

const aiRoutes = router;

export default aiRoutes