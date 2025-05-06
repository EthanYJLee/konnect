const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

// JWT 인증 미들웨어
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    console.log(err);
    if (err) return res.sendStatus(403);
    req.userId = user.id;
    next();
  });
}

router.post("/ask", authenticateToken, async (req, res) => {
  const { messages, threadId } = req.body;
  //
  //   const pastMsg = await openai.beta.threads.messages.list(threadId);
  //   console.log(pastMsg);
  //
  const userMessages = messages?.filter((msg) => msg.type === "user").slice(-1);

  if (!userMessages || userMessages.length === 0) {
    return res.status(400).json({ error: "전달할 사용자 메시지가 없습니다." });
  }

  const userMessageContent = userMessages[0].content;

  try {
    const user = await User.findById(req.userId);
    let thread_id = threadId || user.threadId;

    // 1. Thread가 없으면 새로 생성 후 저장
    if (!thread_id) {
      const thread = await openai.beta.threads.create();
      thread_id = thread.id;
      user.threadId = thread_id;
      await user.save();
    }

    // 2. 사용자 메시지 추가
    await openai.beta.threads.messages.create(thread_id, {
      role: "user",
      content: userMessageContent,
    });

    // 3. Run 실행
    const run = await openai.beta.threads.runs.create(thread_id, {
      assistant_id: ASSISTANT_ID,
    });

    // 4. Run 완료 대기
    let runStatus;
    do {
      runStatus = await openai.beta.threads.runs.retrieve(thread_id, run.id);
      if (runStatus.status === "completed") break;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } while (
      ["queued", "in_progress", "cancelling"].includes(runStatus.status)
    );

    if (runStatus.status !== "completed") {
      return res.status(500).json({ error: "Run failed or cancelled" });
    }

    // 5. Assistant 응답 추출
    const threadMessages = await openai.beta.threads.messages.list(thread_id);
    const assistantMessage = threadMessages.data.find(
      (msg) => msg.role === "assistant"
    );

    res.json({
      reply: assistantMessage?.content?.[0]?.text?.value || "(응답 없음)",
      threadId: thread_id,
    });
  } catch (err) {
    console.error("Assistant API error:", err);
    res.status(500).json({ error: "Assistant API 처리 실패" });
  }
});

module.exports = router;
