const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Thread = require("../models/thread");
const mongoose = require("mongoose");
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

// routes/history.js
router.post("/updateOrder", async (req, res) => {
  const { orderedPairs } = req.body; // [{ _id: "...", pairOrder: 0 }, ...]
  console.log(orderedPairs);

  try {
    const bulkOps = orderedPairs.map(({ _id, pairOrder }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(_id) },
        update: { $set: { pairOrder: pairOrder } },
      },
    }));

    await PairMessage.bulkWrite(bulkOps);
    res.json({ success: true });
  } catch (err) {
    console.error("순서 저장 실패:", err);
    res.status(500).json({ success: false, message: "DB update failed" });
  }
});

router.get("/fetchHistory", authenticateToken, async (req, res, next) => {
  const pairMessageList = await PairMessage.find({ userId: req.userId });
  res.json(pairMessageList);
});

router.post("/savePairs", authenticateToken, async (req, res) => {
  const { pairs, threadId } = req.body;

  if (!Array.isArray(pairs) || pairs.length === 0) {
    return res.status(400).json({ message: "No message pairs provided" });
  }

  try {
    // 현재 유저의 최대 pairOrder 조회
    const latestPair = await PairMessage.findOne({ userId: req.userId })
      .sort({ pairOrder: -1 })
      .select("pairOrder")
      .lean();
    let nextOrder =
      latestPair?.pairOrder != null ? latestPair.pairOrder + 1 : 1;

    // 반복 저장
    for (let i = 0; i < pairs.length; i++) {
      const pairData = pairs[i];
      const userMessage = pairData.find((m) => m.type === "user");
      const aiMessage = pairData.find((m) => m.type === "ai");

      const pairMessage = new PairMessage({
        userId: req.userId,
        threadId: threadId,
        pairOrder: nextOrder++,
        userMessage: {
          content: userMessage.content,
          timestamp: userMessage.timestamp,
        },
        aiMessage: {
          content: aiMessage.content,
          timestamp: aiMessage.timestamp,
        },
      });

      await pairMessage.save();
    }

    res.status(201).json({ message: "Message pairs saved successfully" });
  } catch (err) {
    console.error("Error saving pairs:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
