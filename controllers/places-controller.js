const { v4: uuid } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const { getCoordsForAddress } = require("../util/location");
const Place = require("../models/place");

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

exports.getPlaceById = async (req, res) => {
  const placeId = req.params.pid;

  let place;

  try {
    place = await Place.findById(placeId).exec();
  } catch (error) {
    return next(
      new HttpError(
        "Something went wrong while connecting to the database.",
        404
      )
    );
  }

  if (!place) {
    return next(
      new HttpError(`Could not find a place with id ${placeId}.`, 404)
    );
  }

  res.json({ place: place.toObject({ getters: true }) });
};

exports.getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let places;

  try {
    places = await Place.find({ creator: userId }).exec();
  } catch (error) {
    return next(
      new HttpError(
        "Something went wrong while connecting to the database.",
        404
      )
    );
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError(`No places found for user with id "${userId}".`, 404)
    );
  }

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

exports.createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    next(new HttpError("Invalid inputs passed. Please check your data.", 422));
  } else {
    const { title, description, address, creator } = req.body;

    let coordinates;

    try {
      coordinates = await getCoordsForAddress(address);
    } catch (error) {
      return next(error);
    }

    const newPlace = new Place({
      title,
      description,
      address,
      location: coordinates,
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg",
      creator,
    });

    try {
      await newPlace.save();
    } catch (error) {
      return next(
        new HttpError("Failed to create place. Try again.\n" + error, 500)
      );
    }

    res.json(newPlace);
  }
};

exports.updatePlace = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Invalid inputs passed. Please check your data.", 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;
  const placeIndex = SEED_PLACES.findIndex((p) => p.id === placeId);

  if (placeIndex < 0) {
    return next(
      new HttpError(`No places found for place with id "${placeId}".`, 404)
    );
  }
  
  const updatedPlace = { ...SEED_PLACES[placeIndex], title, description };
  SEED_PLACES[placeIndex] = updatedPlace;

  res.json({
    message: `Updated place with id ${placeId}`,
    update: SEED_PLACES[placeIndex],
  });
};

exports.deletePlace = (req, res, next) => {
  const placeId = req.params.pid;

  if (!SEED_PLACES.find((p) => p.id !== placeId)) {
    next(new HttpError(`No places found for place with id "${placeId}".`, 404));
  } else {
    SEED_PLACES = SEED_PLACES.filter((p) => p.id !== placeId);
    res.status(200).json({ message: "Deleted place." });
  }
};
