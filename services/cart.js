import Cart from "../models/cart.js";
import Product from "../models/product.js";

import { generatePrefixedId } from "../utils/IdGenerator.js";

export async function getCart(cartId) {
  if (!cartId) throw new Error("Missing cartId");
  
  try {
    const cart = await Cart.findOne({ cartId });
    if (!cart) {
      throw new Error(`Cart with id ${cartId} not found.`);
    }
    return cart;
  } catch (error) {
    console.log("Something went wrong!");
    console.log(error.message);
    throw error;
  }
}

export async function updateCart(userId, product) {
  try {
    const cartId = userId.replace(/^(user|guest)-/, 'cart-');

    let cart = await Cart.findOne({ cartId });

    if (!cart) {
      cart = new Cart({
        cartId,
        userId,
        items: []
      });
    }

    const index = cart.items.findIndex(item => item.prodId === product.prodId);

    if (product.qty === 0) {
      if (index !== -1) {
        cart.items.splice(index, 1);
      }
    } else {
      if (index !== -1) {
        cart.items[index].qty = product.qty;
      } else {
        cart.items.push({
          prodId: product.prodId,
          name: product.name,
          price: product.price,
          qty: product.qty
        });
      }
    }

    await cart.save();
    return cart;
  } catch (err) {
    throw new Error("Kunde inte uppdatera varukorgen: " + err.message);
  }
}

export async function getAllCarts() {
  try {
    return await Cart.find();
  } catch (error) {
    console.error("Failed to fetch carts:", error);
    throw error;
  }
}