const axios = require("axios");

async function generateItinerary(startDate, endDate, spots) {
  try {
    const response = await axios.post(
      `${process.env.ML_SERVER_URL}/generateItinerary`,
      {
        startDate,
        endDate,
        spots,
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Flask 서버 경로 생성 실패:", error.message);
    return "기타";
  }
}

module.exports = { generateItinerary };
