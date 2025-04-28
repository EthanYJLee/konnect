const express = require("express");
const cors = require("cors");
const app = express();

// 허용된 도메인 리스트
const whitelist = ["http://localhost:3000"];

// 기본 설정
app.set("port", process.env.PORT || 3030);
app.set("host", process.env.HOST || "0.0.0.0");

// CORS 미들웨어 설정
app.use(
  cors({
    origin: (origin, callback) => {
      console.log("접속된 주소: " + origin); // 접속한 origin을 출력
      if (whitelist.indexOf(origin) === -1) {
        // 허용되지 않은 도메인일 경우
        callback(new Error("허가되지 않은 주소입니다."), false);
      } else {
        // 허용된 도메인일 경우
        callback(null, true);
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// 모든 라우트에 대해 CORS 헤더 설정
app.use((req, res, next) => {
  let ip = req.headers.origin;
  if (whitelist.indexOf(ip) === -1) {
    res.status(403).send("허가되지 않은 주소입니다.");
  } else {
    res.header("Access-Control-Allow-Origin", ip);
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  }
});

// 루트 접속 시 접속된 아이피 출력
app.get("/api", function (req, res) {
  res.send(
    "접속된 아이피: " + req.ip + ", 접속된 포트: " + req.socket.localPort
  );
});

// 서버 동작 중인 표시
app.listen(app.get("port"), app.get("host"), () =>
  console.log(
    "Server is running on : " + app.get("host") + ":" + app.get("port")
  )
);
