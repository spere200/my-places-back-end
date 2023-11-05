require("dotenv").config();
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    // token will be of the form Authorization: "Bearer TOKEN"
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return next(new HttpError("You do not have permission to do that.", 401));
    }

    const decodedToken = jwt.verify(token, process.env.SECRET);
    req.userData = { id: decodedToken.userId };
    next();
  } catch (err) {
    return next(new HttpError("You do not have permission to do that.", 401));
  }
};
