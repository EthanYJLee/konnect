// // 장소 검색 관련
// const express = require("express");
// const router = express.Router();
// const axios = require("axios");
// const NodeCache = require("node-cache");

// const cache = new NodeCache({ stdTTL: 60 * 60 }); // 1시간 캐시

// const GOOGLE_TRANSLATE_KEY = process.env.GOOGLE_TRANSLATE_KEY;
// // const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
// const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY_TEST;

// // async function translateToKorean(text) {
// //   const res = await axios.post(
// //     `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_KEY}`,
// //     {
// //       q: text,
// //       target: "ko",
// //     }
// //   );
// //   return res.data.data.translations[0].translatedText;
// // }

// async function searchKakaoPlaces(query) {
//   const res = await axios.get(
//     "https://dapi.kakao.com/v2/local/search/keyword.json",
//     {
//       params: { query },
//       headers: {
//         Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
//       },
//     }
//   );
//   console.log(res);
//   return res.data.documents;
// }

// router.post("/", async (req, res) => {
//   const { query } = req.body;
//   if (!query) return res.status(400).json({ error: "Missing query" });

//   const cached = cache.get(query);
//   if (cached) return res.json({ result: cached });

//   try {
//     // const translated = await translateToKorean(query);
//     const kakaoResults = await searchKakaoPlaces(query);
//     console.log(kakaoResults);
//     cache.set(query, kakaoResults);
//     return res.json({ result: kakaoResults });
//   } catch (err) {
//     console.error("검색 오류:", err.message);
//     return res.status(500).json({ error: "Search failed" });
//   }
// });

// module.exports = router;
