import express from "express";
import { showProfile } from "../controllers/showProfile";

const router = express.Router();

router.post("/user",showProfile);

export default router;