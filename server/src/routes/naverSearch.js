// const express = require("express");
// const router = express.Router();
// const axios = require("axios");

// const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID?.trim();
// const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET?.trim();

// if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
//   console.error(
//     "Naver API credentials are missing or invalid in environment variables"
//   );
//   console.error("NAVER_CLIENT_ID:", NAVER_CLIENT_ID ? "Present" : "Missing");
//   console.error(
//     "NAVER_CLIENT_SECRET:",
//     NAVER_CLIENT_SECRET ? "Present" : "Missing"
//   );
// }

// router.get("/", async (req, res) => {
//   const query = req.query.query;
//   if (!query) return res.status(400).json({ error: "Missing query" });

//   if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
//     console.error("Naver API credentials are missing");
//     return res
//       .status(500)
//       .json({ error: "Naver API credentials not configured" });
//   }

//   try {
//     console.log("Making request to Naver API with query:", query);
//     console.log("Using credentials:", {
//       clientId: NAVER_CLIENT_ID,
//       clientSecret: NAVER_CLIENT_SECRET,
//     });

//     const naverRes = await axios.get(
//       "https://openapi.naver.com/v1/search/local.json",
//       {
//         params: {
//           query,
//           display: 10,
//           start: 1,
//         },
//         headers: {
//           "X-Naver-Client-Id": NAVER_CLIENT_ID,
//           "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
//         },
//       }
//     );

//     console.log("Naver API response:", naverRes.data);

//     if (!naverRes.data || !naverRes.data.items) {
//       console.error("Invalid response format from Naver API:", naverRes.data);
//       return res.status(500).json({ error: "Invalid response from Naver API" });
//     }

//     const places = naverRes.data.items.map((item) => ({
//       id: item.id || String(Math.random()),
//       name: item.title?.replace(/<[^>]*>/g, "") || "", // Remove HTML tags
//       address: item.address || "",
//       roadAddress: item.roadAddress || "",
//       category: item.category || "",
//       description: item.description?.replace(/<[^>]*>/g, "") || "", // Remove HTML tags
//     }));

//     res.json({ places });
//   } catch (err) {
//     console.error("Naver API error details:", {
//       message: err.message,
//       response: err.response?.data,
//       status: err.response?.status,
//       headers: err.response?.headers,
//       config: {
//         url: err.config?.url,
//         method: err.config?.method,
//         headers: err.config?.headers,
//       },
//     });

//     if (err.response?.status === 401) {
//       return res.status(401).json({
//         error: "Invalid Naver API credentials",
//         details: err.response?.data,
//       });
//     } else if (err.response?.status === 429) {
//       return res.status(429).json({ error: "Naver API rate limit exceeded" });
//     }

//     res.status(500).json({
//       error: "Naver API call failed",
//       details: err.response?.data || err.message,
//     });
//   }
// });

// module.exports = router;
