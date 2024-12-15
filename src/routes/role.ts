import { Router } from "express";
import { verifyToken } from "../middlewares/auth";
import { saveOne } from "../controllers/role";

const router = Router();

// TODO: Add middleware verification that only admins can create, update, and delete roles
router.use(verifyToken);

router.post("/", saveOne);

export default router;
