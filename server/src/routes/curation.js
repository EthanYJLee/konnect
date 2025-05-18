const express = require("express");
const axios = require("axios");
const router = express.Router();
const { generateItinerary } = require("../utils/generateItinerary");
require("dotenv").config();

router.post("/generate", async (req, res) => {
  const { spots, startDate, endDate, categories } = req.body;
  console.log(spots);
  console.log(startDate);
  console.log(endDate);
  console.log(categories);
  const itinerary = await generateItinerary(
    startDate,
    endDate,
    spots,
    categories
  );
  console.log(itinerary);
  res.json({ itinerary });
});

module.exports = router;
