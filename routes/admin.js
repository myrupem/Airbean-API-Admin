import express from "express";
import { generatePrefixedId } from "../utils/IdGenerator.js";
import { createProduct } from "../services/products.js";

const router = express.Router();

//Add new product
router.post("/", async (req, res) => {
    const { title, desc, price } = req.body;

    if (!title || !desc || !price) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newProduct = await createProduct({
        prodId : generatePrefixedId('prod'), 
        title,
        desc,
        price,
        createdAt: new Date()
    })
    res.status(201).json({
      message: "Produkt skapad",
      newProduct
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding product", error: error.message });
  }
});

export default router;