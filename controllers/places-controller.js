const HttpError = require("../models/http-error");
const { v4: uuid } = require("uuid");

let SEED_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world!",
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: "20 W 34th St, New York, NY 10001",
    creator: "u1",
  },
];

exports.getPlaceById = (req, res) => {
  const placeId = req.params.pid;
  const place = SEED_PLACES.find((p) => p.id === placeId);

  if (!place) {
    throw new HttpError(`Place with id "${placeId}" does not exist.`, 404);
  } else {
    res.json({ place });
  }
};

exports.getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = SEED_PLACES.filter((p) => p.creator === userId);

  if (!places) {
    next(new HttpError(`No places found for user with id "${userId}".`, 404));
  } else {
    res.json({ places });
  }
};

exports.createPlace = (req, res, next) => {
  const { title, description, coordinates, address, creator } = req.body;
  const newPlace = {
    id: uuid(),
    title,
    description,
    coordinates,
    address,
    creator,
  };
  SEED_PLACES.push(newPlace);
  res.json(newPlace);
};

exports.updatePlace = (req, res, next) => {
  const { title, description } = req.body;
  const placeId = req.params.pid;
  const placeIndex = SEED_PLACES.findIndex((p) => p.id === placeId);

  if (placeIndex < 0) {
    next(new HttpError(`No places found for place with id "${placeId}".`, 404));
  } else {
    const updatedPlace = { ...SEED_PLACES[placeIndex], title, description };
    SEED_PLACES[placeIndex] = updatedPlace;

    res.json({
      message: `Updated place with id ${placeId}`,
      update: SEED_PLACES[placeIndex],
    });
  }
};

exports.deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  SEED_PLACES = SEED_PLACES.filter((p) => p.id !== placeId);
  res.status(200).json({ message: "Deleted place." });
};
