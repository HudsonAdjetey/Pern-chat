import express from "express";
const router = express.Router();

router.get("/login", (req, res) => {
  res.send("Hello from server");
});

export default router;
