import express from "express";
import { createPromotion, getAllPromotions } from "../services/promotion.js";

import { validatePromotion } from "../middlewares/validators.js";
import { authenticateUser, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// GET all promotions
router.get("/", async (req, res) => {
  try {
    const promos = await getAllPromotions();
    res.json({ success: true, promotions: promos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create a new promotion
router.post("/", authenticateUser, isAdmin, validatePromotion, async (req, res) => {
  try {
    const promotion = await createPromotion(req.body);
    res.status(201).json({ success: true, promotion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
