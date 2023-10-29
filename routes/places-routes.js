const express = require('express');
const placeController = require('../controllers/places-controller');

const router = express.Router();

router.get('/user/:uid', placeController.getPlacesByUserId);
router.get('/:pid', placeController.getPlaceById);
router.post('/', placeController.createPlace);
router.patch('/:pid', placeController.updatePlace);
router.delete('/:pid', placeController.deletePlace);

module.exports = router;
