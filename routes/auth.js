import express from "express";
import { generatePrefixedId } from "../utils/IdGenerator.js";
import { createUser, findUserByUsername } from "../services/user.js";
import { comparePasswords, hashPassword, signToken } from "../utils/bcryptAndTokens.js";
import { validateAuthBody } from "../middlewares/validators.js";
import { authenticateUser } from "../middlewares/auth.js";

const router = express.Router();

// REGISTER
// POST /api/auth/register
router.post("/register", validateAuthBody, async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Användarnamnet är redan taget" });
    }

    const hashedPassword = await hashPassword(password)
    const userId = generatePrefixedId("user");

    const newUser = await createUser({
      userId,
      username,
      password : hashedPassword,
      role,
    });

    res.status(201).json({
      message: "Användare skapad",
      userId: newUser.userId,
      role : newUser.role,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Fel vid registrering", error: err.message });
  }
});

// LOGIN (eller fortsätt som gäst)
// POST /api/auth/login
router.post("/login", validateAuthBody, async (req, res) => {
  const { username, password, continueAsGuest } = req.body;

  if (continueAsGuest) {
    const guestId = generatePrefixedId("guest");

    return res.json({
      message: "Fortsätter som gäst",
      guestId: guestId,
    });
  }

  try {
    const user = await findUserByUsername(username)
    const correctPassword = await comparePasswords(password, user.password)

    if (user && correctPassword) {
      const token = signToken({userId : user.userId});

      res.json({
        message: "Inloggning lyckades",
        user: {
        userId: user.userId,
        username: user.username,
        role: user.role,
      },
        token : `Bearer ${token}`
      });
    } else {
      return res
        .status(401)
        .json({ message: "Felaktigt användarnamn eller lösenord" });
    }
  } catch (err) {
    res.status(500).json({ message: "Fel vid inloggning", error: err.message });
  }
});

// LOGOUT
// GET /api/auth/logout
router.get("/logout", authenticateUser, (req, res) => {
  res.json({ message: "Utloggning lyckades!" });
});

export default router;
