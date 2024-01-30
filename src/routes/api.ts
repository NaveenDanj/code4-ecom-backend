import express from "express";
import authController from '../controllers/auth.controller'
const router = express.Router();

router.get("/", (req, res) => {
  return res.json({ message: "code94labs e-com API v1.0.0" });
});

router.use("/auth", authController);

export default router;
