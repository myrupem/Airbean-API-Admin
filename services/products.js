import Product from "../models/product.js";

export const getAllProducts = async () => {
  return await Product.find({});
};

export const createProduct = async (productData) => {
  return await Product.create(productData);
};

export const getProductByProdId = async (prodId) => {
  return await Product.findOne({ prodId })
};

export const updateProduct = async (prodId, updatedFields) => {
   return await Product.findOneAndUpdate(
    { prodId },
    { $set: updatedFields },
    { new: true }
  );
}
