const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Thread = require("../models/thread");
const PairMessage = require("../models/pairMessage");

// JWT 인증 미들웨어
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.userId = user.id;
    next();
  });
}

router.get("/fetch", authenticateToken, async (req, res, next) => {
  const pairMessageList = await PairMessage.find({ userId: req.userId });
  res.json(pairMessageList);
});

router.post("/savePairs", authenticateToken, async (req, res, pairs) => {
  console.log(req);
  for (let i = 0; i < req.body.pairs.length; i++) {
    let pairData = req.body.pairs[i];
    const userMessage = pairData.find((m) => m.type === "user");
    const aiMessage = pairData.find((m) => m.type === "ai");
    const pairMessage = new PairMessage({
      userId: req.userId,
      threadId: req.body.threadId,
      userMessage: {
        content: userMessage.content,
        timestamp: userMessage.timestamp,
      },
      aiMessage: {
        content: aiMessage.content,
        timestamp: aiMessage.timestamp,
      },
      created: Date.now(),
    });
    await pairMessage.save();
  }
});
module.exports = router;
