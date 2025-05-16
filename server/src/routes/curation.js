const express = require("express");
const axios = require("axios");
const router = express.Router();
const { generateItinerary } = require("../utils/generateItinerary");
require("dotenv").config();

router.post("/generate", async (req, res) => {
  const { spots, startDate, endDate } = req.body;
  console.log(spots);
  console.log(startDate);
  console.log(endDate);
  const itinerary = await generateItinerary(startDate, endDate, spots);
  console.log(itinerary);
  res.json({ itinerary });
});

module.exports = router;
