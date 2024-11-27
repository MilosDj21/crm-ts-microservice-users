import { Router } from "express";

import { saveOne } from "../controllers/user";
import { verifyToken } from "../middlewares/auth";
import multerConf from "../middlewares/multerConf";

const router = Router();

router.use(verifyToken);

router.post("/", [multerConf], saveOne);

export default router;
