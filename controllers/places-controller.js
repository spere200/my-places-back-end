const HttpError = require('../models/http-error');
const { v4: uuid } = require('uuid');

const SEED_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world!',
    location: {
      lat: 40.7484474,
      lng: -73.9871516
    },
    address: '20 W 34th St, New York, NY 10001',
    creator: 'u1'
  }
]

const getPlaceById = (req, res) => {
  const placeId = req.params.pid;
  const place = SEED_PLACES.find(p => p.id === placeId)

  if (!place) {
    throw new HttpError(`Place with id "${placeId}" does not exist.`, 404);
  }
  else {
    res.json({ place });
  }
}

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;

  const place = SEED_PLACES.find(p => p.creator === userId);

  if (!place) {
    next(new HttpError(`No places found for user with id "${userId}".`, 404));
  }
  else {
    res.json({ place });
  }
}

const createPlace = (req, res, next) => {
  const { title, description, coordinates, address, creator } = req.body;
  const newPlace = { id: uuid(), title, description, coordinates, address, creator }
  SEED_PLACES.push(newPlace);
  res.json(newPlace)
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
