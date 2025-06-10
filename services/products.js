import Product from "../models/product.js";

export const getAllProducts = async () => {
  return await Product.find({});
};

export const createProduct = async (productData) => {
  return await Product.create(productData);
};
