import { verifyToken } from "../utils/bcryptAndTokens.js";
import { getUserByUserId } from "../services/user.js";

export function authenticateUser(req, res, next) {
    if(req.headers.authorization) {
        const token = req.headers.authorization.replace('Bearer ', '');
        const verification = verifyToken(token);
        if(verification) {
            next();
        } else {
            res.status(400).json({
            success : false, 
            message : 'Invalid token'
        })
        }
    } else {
        res.status(400).json({
            success : false, 
            message : 'No token provided'
        })
    }
};

export async function isAdmin(req, res, next) {
    try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Token krävs" });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return res.status(403).json({ message: "Ogiltig token" });
    }

    const user = await getUserByUserId(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "Användare hittades inte" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Endast admins har tillgång" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverfel", error: error.message });
  }
}

export function authorizeCartAccess(req, res, next) {
  const { cartId } = req.body;

  if (!cartId || !cartId.startsWith("cart-")) {
    return res.status(400).json({ message: "Ogiltigt cartId" });
  }

  const cartSuffix = cartId.split("cart-")[1]; // t.ex. '12345'
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return res.status(403).json({ message: "Ogiltig token" });
    }

    const userSuffix = decoded.userId.split("-")[1]; // t.ex. '12345'

    if (cartSuffix !== userSuffix) {
      return res.status(403).json({ message: "cartId matchar inte användare" });
    }

    req.userId = decoded.userId; 
    return next();
  }

  // Ingen token = gäst
  return next();
}