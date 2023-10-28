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
  res.json({ place });
});

router.get('/user/:uid', (req, res) => {
  const userId = req.params.uid;

  const place = SEED_PLACES.find(p => p.creator === userId);

  res.json({ place });
});

module.exports = router;
