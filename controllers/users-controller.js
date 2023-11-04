const { validationResult } = require("express-validator");

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

  // since multer adds a req.file object that has a path set in the configuration,
  // the user image can now be stored with the appropriate url
  const newUser = new User({
    name,
    email,
    image: req.file.path,
    password,
    places: [],
  });

  try {
    await newUser.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError("Account creation failed. Try again.", 500));
  }

  res.status(201).json({
    message: "Successfully created user.",
    user: newUser.toObject({ getters: true }),
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

  if (user.password !== password) {
    return next(new HttpError("Incorrect password.", 401));
  }

  res.status(201).json({
    message: `Successfully logged in as ${user.name}.`,
    user: user.toObject({ getters: true }),
  });
};
