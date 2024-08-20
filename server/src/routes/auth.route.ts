import express from "express";
import controllers from "../controllers/auth.controller";
import protectRoute from "../middleware/protect.middleware";
const router = express.Router();

router.post("/login", controllers.login);
router.post("/logout", controllers.logout);
router.post("/signup", controllers.signup);
router.get("/me", protectRoute, controllers.getMe);
router.get("/reset");
router.get("/send");
router.get("/verify");

export default router;
