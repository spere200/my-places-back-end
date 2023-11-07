const fs = require("fs");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const { getCoordsForAddress } = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");

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

  let user;

  try {
    user = await User.findById(userId).populate("places").exec();
  } catch (error) {
    return next(
      new HttpError("Something went wrong while trying to retrieve data.", 404)
    );
  }

  if (!user) {
    return next(new HttpError("User does not exist.", 404));
  }

  res
    .status(200)
    .json({ places: user.places.map((p) => p.toObject({ getters: true })) });
};

exports.createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    next(new HttpError("Invalid inputs passed. Please check your data.", 422));
  } else {
    const { title, description, address } = req.body;

    let coordinates;

    try {
      coordinates = await getCoordsForAddress(address);
    } catch (error) {
      next(
        new HttpError(
          "Could not generate coordinates. Verify address and try again.",
          500
        )
      );
    }

    const newPlace = new Place({
      title,
      description,
      address,
      location: coordinates,
      image: req.file.path,
      creator: req.userData.id,
    });

    let user;

    try {
      user = await User.findById(req.userData.id);
    } catch (error) {
      return next(
        new HttpError(
          "Could not create place. Something went wrong while retreiving user information.\n" +
            error,
          500
        )
      );
    }

    if (!user) {
      return next(
        new HttpError("Could not find a user for the provided user ID.", 500)
      );
    }

    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await newPlace.save({ session: sess });
      user.places.push(newPlace);
      await user.save({ session: sess });
      await sess.commitTransaction();
    } catch (error) {
      console.log(error);
      return next(new HttpError("Failed to create place. Try again.", 500));
    }

    res.status(200).json({ place: newPlace.toObject({ getters: true }) });
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

  // place.creator has to be converted to a string since it's currently a mongoose ObjectId,
  // and since it hasn't been populated it's just an ObjectId("id")
  if (place.creator.toString() !== req.userData.id) {
    return next(
      new HttpError(
        "Permission denied. This place can only be edited by its creator.",
        401
      )
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
    place = await Place.findById(placeId).populate("creator");
  } catch (error) {
    return next(
      new HttpError("Something went wrong while finding the place.", 500)
    );
  }

  if (!place) {
    return next(new HttpError("No place was found for the given ID.", 500));
  }

  // since in this request the creator field is populated, it now returns the
  // actual creator object, not just it's ObjectId, so now to get the id
  // you have to reference the actual _id field in the creator document,
  // which can just be invoked with id since that's a getter in the model
  if (place.creator.id.toString() !== req.userData.id) {
    return next(
      new HttpError(
        "Permission denied. This place can only be deleted by its creator.",
        401
      )
    );
  }

  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    return next(
      new HttpError("Something went wrong while deleting the place.", 500)
    );
  }

  fs.unlink(imagePath, (err) => {
    if (err) {
      console.log("Failed to remove image from back-end storage.");
      console.log(err);
    }
  });

  res.status(200).json({
    message: `Successfully deleted place.`,
  });
};
