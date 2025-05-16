// 대화 기록 관련
const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Thread = require("../models/thread");
const mongoose = require("mongoose");
const PairMessage = require("../models/pairMessage");
const fs = require("fs").promises;
const path = require("path");
const { classifyCategory } = require("../utils/classifyCategory");

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

// 카테고리 변경
router.post("/updateCategory", authenticateToken, async (req, res) => {
  const { id, cat } = req.body;
  console.log(id, cat);
  try {
    const pairMessage = await PairMessage.findById(id);
    if (!pairMessage) {
      return res.status(404).json({ message: "Message not found" });
    }
    pairMessage.category = cat;
    await pairMessage.save();
    res.json({ message: "카테고리 업데이트 완료", updated: pairMessage });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "DB update failed" });
  }
});

// 대화 기록 순서 변경
router.post("/updateOrder", async (req, res) => {
  const { orderedPairs } = req.body; // [{ _id: "...", pairOrder: 0 }, ...]
  // console.log(orderedPairs);

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

// 대화 기록 조회
router.get("/fetchHistory", authenticateToken, async (req, res, next) => {
  const pairMessageList = await PairMessage.find({ userId: req.userId });
  res.json(pairMessageList);
});

// 대화 기록 저장
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

      const fullText = `${userMessage.content} ${aiMessage.content}`;
      const bestCategory = await classifyCategory(fullText);
      console.log(bestCategory);

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
        category: bestCategory,
      });

      await pairMessage.save();
    }

    res.status(201).json({ message: "Message pairs saved successfully" });
  } catch (err) {
    console.error("Error saving pairs:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------

// async function extractCategory(messages) {
//   const filePath = path.join(__dirname, "../data/category_samples.json");
//   const fileContent = await fs.readFile(filePath, "utf-8");
//   const categories = JSON.parse(fileContent);

//   const escapeRegExp = (string) =>
//     string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

//   const text = messages.toLowerCase();
//   const counts = {};

//   for (const cat in categories) {
//     counts[cat] = 0;
//     for (const lang in categories[cat]) {
//       for (const kw of categories[cat][lang]) {
//         const regex = new RegExp(escapeRegExp(kw.toLowerCase()), "g");
//         const matches = text.match(regex);
//         if (matches) counts[cat] += matches.length;
//       }
//     }
//   }

//   const maxCount = Math.max(...Object.values(counts));
//   console.log(maxCount);
//   if (maxCount === 0) return "기타";

//   const priority = [
//     "여행",
//     "교통",
//     "음식",
//     "통신",
//     "병원",
//     "숙소",
//     "쇼핑",
//     "문화",
//     "언어",
//     "생활정보",
//   ];
//   for (const cat of priority) {
//     if (counts[cat] === maxCount) return cat;
//   }
//   return "기타";
// }

// function escapeRegExp(string) {
//   return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }

// ---------------------------------------------------------------------------

module.exports = router;
