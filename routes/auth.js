import express from "express";
import User from "../models/user.js";
import { generatePrefixedId } from "../utils/IdGenerator.js";
import { createUser, findUserByUsername } from "../services/user.js";
import bcrypt from 'bcrypt'

import { validateAuthBody } from "../middlewares/validators.js";

const router = express.Router();

// REGISTER
// POST /api/auth/register
router.post("/register", validateAuthBody, async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Användarnamnet är redan taget" });
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const userId = generatePrefixedId("user");
    const newUser = await createUser({
      userId,
      username,
      password : hashedPassword,
      role: "user",
    });

    res.status(201).json({
      message: "Användare skapad",
      userId: newUser.userId,
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
    global.user = {
      userId: guestId,
      username: "Gäst",
      role: "guest",
    };

    return res.json({
      message: "Fortsätter som gäst",
      user: global.user,
    });
  }

  try {
    const user = await User.findOne({ username });
    const isSame = await bcrypt.compare(password, user.password)
    if (user && isSame) {
      global.user = {
      userId: user.userId,
      username: user.username,
      role: user.role,
    };

    res.json({
      message: "Inloggning lyckades",
      user: global.user,
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
router.get("/logout", (req, res) => {
  global.user = null;
  res.json({ message: "Utloggning lyckades!" });
});

export default router;
