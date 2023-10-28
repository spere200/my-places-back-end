const express = require('express');

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

const router = express.Router();

router.get('/:pid', (req, res) => {
  const placeId = req.params.pid;
  const place = SEED_PLACES.find(p => p.id === placeId)

  if (!place) {
    const error = new Error(`Place with id "${placeId}" does not exist.`);
    error.code = 404;
    throw error;
  }
  else {
    res.json({ place });
  }
});

router.get('/user/:uid', (req, res, next) => {
  const userId = req.params.uid;

  const place = SEED_PLACES.find(p => p.creator === userId);

  if (!place) {
    const error = new Error(`No places found for user with id "${userId}".`);
    error.code = 404;
    next(error);
  }
  else {
    res.json({ place });
  }
});

module.exports = router;
