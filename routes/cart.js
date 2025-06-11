import { updateCart } from '../services/cart.js';
import { validateCartInput, validateCartInUrl } from '../middlewares/validators.js';
import { Router } from 'express';
import { getCart } from '../services/cart.js';
import { getAllCarts } from '../services/cart.js';
import { verifyToken } from '../utils/bcryptAndTokens.js'
import { getProductByProdId } from '../services/products.js';
import { generatePrefixedId } from '../utils/IdGenerator.js';
import { authenticateUser, isAdmin } from '../middlewares/auth.js';
import { getUserByUserId } from '../services/user.js';

const router = Router();

// GET all carts
router.get('/', authenticateUser, isAdmin, async (req, res, next) => {
  try {
    const carts = await getAllCarts();
    res.json({ success: true, carts });
  } catch (error) {
    next({
      status: 500,
      message: "Could not fetch carts"
    });
  }
});

// GET cart by cartId
router.get('/:cartId', validateCartInUrl, async (req, res, next) => {
    const { cartId } = req.params;
    const cart = await getCart(cartId);

    if (!cart) {
        next({
        status: 404,
        message: 'No cart found!'
        });
    } else {
        res.json({
        success: true,
        cart: cart
        });
    }
});

// PUT cart
router.put('/', validateCartInput, async (req, res) => {
  //Kolla om du är inloggad
  if(req.headers.authorization) {
    const token = req.headers.authorization.replace('Bearer ', '');
    
    if (!token) {
      return res.status(403).json({ message: 'Ingen token hittad' });
    }

    const decodedToken = verifyToken(token);
      if (!decodedToken) {
        return res.status(403).json({ message: 'Ogiltig token' });
      }

    const user = await getUserByUserId(decodedToken.userId);
     if (!user) {
      return res.status(404).json({ message: 'Användare hittades inte' });
    }

    const { prodId, qty } = req.body
    const product = await getProductByProdId(prodId)

    const result = await updateCart(user.userId, {
      prodId : product.prodId,
      name : product.name,
      price : product.price,
      qty : qty
    });
    res.json({
      success : true,
      cart : result
    });
  } else {
    //Om du är guest!!
    let { prodId, qty, guestId } = req.body;
    guestId = guestId || `${generatePrefixedId("guest")}`;

    const product = await getProductByProdId(prodId);
    if (!product) {
      return res.status(404).json({ message: "Produkt hittades inte" });
    }

    const result = await updateCart(guestId, {
      prodId: product.prodId,
      name: product.name,
      price: product.price,
      qty: qty
    });

    res.json({
      success : true,
      cart : result,
      guestId : guestId
    });
  }
});


export default router;