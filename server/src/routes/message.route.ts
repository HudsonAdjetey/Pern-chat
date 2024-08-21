import express from "express";
import messageControllers from "../controllers/message.controller";
import protectRoute from "../middleware/protect.middleware";
const router = express.Router();

router.get("/send/:id", protectRoute, messageControllers.sendMessage);

export default router;
