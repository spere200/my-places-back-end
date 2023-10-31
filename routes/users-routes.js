const express = require("express");
const userController = require("../controllers/users-controller");
const { check } = require("express-validator");

const router = express.Router();

router.get("/", userController.getUsers);

router.post(
  "/signup",
  [
    check("name").isLength({ min: 3 }),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 4 }),
  ],
  userController.signup
);
router.post("/login", userController.login);

module.exports = router;
