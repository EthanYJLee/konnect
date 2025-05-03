const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/user");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.get("/checkEmailExists", async (req, res) => {
  const { email } = req.query;
  console.log(email);
  const existingUser = await User.findOne({ email });
  console.log(existingUser);
  res.json({ exists: !!existingUser });
});

// Local Signup
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ message: "Email already in use" });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashed, social: "N" });
  await user.save();
  res.status(201).json({ message: "User created" });
});

// Local Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.social === "Y")
    return res.status(400).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ token });
});

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.redirect(`http://localhost:3000/oauth-success?token=${token}`); // 프론트로 리다이렉트
  }
);

// 프론트에서 credential 받은 후 처리
router.post("/google/token", async (req, res) => {
  const { credential } = req.body;
  console.log("Received credential:", credential);

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    let user = await User.findOne({ googleId });

    const now = new Date();

    if (!user) {
      // 최초 가입: createdAt, lastLogin 모두 저장
      user = await User.create({
        googleId,
        email,
        username: name,
        social: "Y",
        createdAt: now,
        lastLogin: now,
      });
    } else {
      // 기존 유저: lastLogin만 업데이트
      user.lastLogin = now;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    console.error("Google token verify failed:", err);
    res.status(401).json({ message: "Invalid Google token" });
  }
});

module.exports = router;
