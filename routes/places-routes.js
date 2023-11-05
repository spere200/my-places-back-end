const express = require("express");
const { check } = require("express-validator");

const placeController = require("../controllers/places-controller");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/user/:uid", placeController.getPlacesByUserId);

router.get("/:pid", placeController.getPlaceById);

// middleware that makes it so that all routes below this one
// have to have authorization in the form of a token in the req
router.use(checkAuth);

router.post(
  "/",
  fileUpload.single("image"),
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
