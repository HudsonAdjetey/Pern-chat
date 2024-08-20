import express from "express";
import controllers from "../controllers/auth.controller";
const router = express.Router();

router.post("/login", controllers.login);
router.post("/logout", controllers.logout);
router.post("/signup", controllers.signup);
router.get("/reset");
router.get("/send");
router.get("/verify");

export default router;
