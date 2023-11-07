if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");

exports.getUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find({}, "-password").exec();
  } catch (error) {
    return next(new HttpError("Failed to retrieve user list. Try again.", 500));
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed. Please check your data.", 422)
    );
  }

  // this can be kept the same since multer also adds a body the same way
  // application/json content type does
  const { name, email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email }).exec();
  } catch (error) {
    return next(new HttpError("Signup failed. Please try again.", 500));
  }

  if (existingUser) {
    return next(
      new HttpError(
        "That email is already in use by an existing account. Try another or recover your password.",
        500
      )
    );
  }

  // second param is number of salting rounds
  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    console.log(err);
    return next(new HttpError("Could not create user, please try again.", 500));
  }

  // since multer adds a req.file object that has a path set in the configuration,
  // the user image can now be stored with the appropriate url
  const newUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });

  try {
    await newUser.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError("Account creation failed. Try again.", 500));
  }

  let token;

  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.SECRET,
      { expiresIn: "1h" }
    );
  } catch (err) {
    console.log(err);
    return next(new HttpError("Account creation failed. Try again.", 500));
  }

  res.status(201).json({
    message: "Successfully created user.",
    user: { id: newUser.id, email: newUser.email, token },
  });
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  let user;

  try {
    user = await User.findOne({ email }).exec();
  } catch (error) {
    return next(new HttpError("Login failed. Please try again.", 401));
  }

  if (!user) {
    return next(
      new HttpError(
        "No account was found for the entered email. Sign up instead.",
        401
      )
    );
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, user.password);
  } catch (err) {
    return next(
      new HttpError(
        "CSomething went wrong while verifying your credentials. Please try again.",
        500
      )
    );
  }

  if (!isValidPassword) {
    return next(new HttpError("Invalid credentials.", 401));
  }

  let token;

  try {
    token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.SECRET,
      { expiresIn: "1h" }
    );
  } catch (err) {
    console.log(err);
    return next(new HttpError("Account creation failed. Try again.", 500));
  }

  res.status(201).json({
    message: `Successfully logged in as ${user.name}.`,
    user: { id: user.id, email: user.email, token },
  });
};
