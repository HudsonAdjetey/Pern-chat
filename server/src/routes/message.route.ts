import express from "express";
import messageControllers from "../controllers/message.controller";
import protectRoute from "../middleware/protect.middleware";
const router = express.Router();

router.get("/conversations-all", protectRoute, messageControllers.getUsers);
router.post("/send/:id", protectRoute, messageControllers.sendMessage);
router.get("/:id", protectRoute, messageControllers.getMessage);

export default router;
 