import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  return res.json({ message: "code94labs e-com API v1.0.0" });
});

export default router;
