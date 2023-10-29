const express = require("express");
const placeController = require("../controllers/places-controller");
const { check } = require("express-validator");

const router = express.Router();

router.get("/user/:uid", placeController.getPlacesByUserId);

router.get("/:pid", placeController.getPlaceById);

router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placeController.createPlace
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placeController.updatePlace
);

router.delete("/:pid", placeController.deletePlace);

module.exports = router;
