const express = require("express");
const { check } = require("express-validator");

const userController = require("../controllers/users-controller");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/", userController.getUsers);

router.post(
  "/signup",
  // "image" is the name of the field in the request body that will contain the image
  fileUpload.single("image"),
  [
    check("name").isLength({ min: 3 }),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 4 }),
  ],
  userController.signup
);
router.post("/login", userController.login);

module.exports = router;
