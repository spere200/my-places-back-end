const { v4: uuid } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const { getCoordsForAddress } = require("../util/location");
const Place = require("../models/place");

exports.getPlaceById = async (req, res) => {
  const placeId = req.params.pid;

  let place;

  try {
    place = await Place.findById(placeId).exec();
  } catch (error) {
    return next(new HttpError("Something went wrong.", 404));
  }

  if (!place) {
    return next(
      new HttpError(`Could not find a place with id ${placeId}.`, 404)
    );
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
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

  res.status(200).json({
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

    res.status(200).json(newPlace);
  }
};

exports.updatePlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Invalid inputs passed. Please check your data.", 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;

  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(
      new HttpError("Something went wrong while trying to update place", 500)
    );
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    return next(
      new HttpError(
        "Something went wrong while trying to save the updated place.",
        500
      )
    );
  }

  res.status(200).json({
    message: `Updated place with id ${placeId}`,
    place: place.toObject({ getters: true }),
  });
};

exports.deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;

  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(
      new HttpError("Something went wrong while finding the place.", 500)
    );
  }

  try {
    await place.deleteOne();
  } catch (error) {
    return next(
      new HttpError("Something went wrong while deleting the place.", 500)
    );
  }

  res.status(200).json({
    message: `Successfully deleted place.`,
  });
};
