require("dotenv").config();
const axios = require("axios");
const HttpError = require("../models/http-error");

exports.getCoordsForAddress = async (address) => {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(
      address
    )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );

  const data = response.data;

  if (!data || data.status === "ZERO_RESULTS") {
    const error = HttpError(
      "Could not find location for the specified address.",
      422
    );

    throw error;
  }

  const coordinates = data.results[0].geometry.location;

  return coordinates;
}
