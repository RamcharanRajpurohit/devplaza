import express from "express";
import { showProfile } from "../controllers/showProfile";

const router = express.Router();

router.get("/:username",showProfile);

export default router;