const express = require("express");
const axios = require("axios");
const router = express.Router();
const { generateItinerary } = require("../utils/generateItinerary");
require("dotenv").config();

router.post("/generate", async (req, res) => {
  const {
    startDate,
    endDate,
    departureCity,
    arrivalCity,
    spots,
    categories,
    language,
  } = req.body;
  console.log(spots);
  console.log(startDate);
  console.log(endDate);
  console.log(departureCity);
  console.log(arrivalCity);
  console.log(categories);
  console.log(language);
  const itinerary = await generateItinerary(
    startDate,
    endDate,
    departureCity,
    arrivalCity,
    spots,
    categories,
    language,
  );
  console.log(itinerary);
  res.json({ itinerary });
});

module.exports = router;
