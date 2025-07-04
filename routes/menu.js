import express from "express";
import Product from "../models/product.js";
import { getAllProducts, createProduct, getProductByProdId, updateProduct } from "../services/products.js";
import { generatePrefixedId } from "../utils/IdGenerator.js";
import { authenticateUser, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving menu", error: error.message });
  }
});

//Add new product
router.post("/", authenticateUser, isAdmin, async (req, res) => {
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


//Uppdatera produkt
router.put( '/:prodId', authenticateUser, isAdmin, async(req, res) => {
    const { prodId } = req.params;
    const { title, desc, price } = req.body;

    if (!title || !desc || !price) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const product = await getProductByProdId(prodId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Uppdatera produkt
    const updatedProduct = await updateProduct(prodId, {
      title,
      desc,
      price,
      modifiedAt: new Date()
    });

    res.status(200).json({
      message: "Produkt uppdaterad",
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  };
});

router.delete('/:prodId', authenticateUser, isAdmin, async (req, res) => {
  const { prodId } = req.params; 

  try {
    const product = await Product.findOneAndDelete({ prodId });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message
    });
  }
})

export default router;