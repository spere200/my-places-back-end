require("dotenv").config();
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  // some browsers send an OPTIONS request as a safety measure to ensure that
  // the request being sent is trusted, this skips it since OPTIONS requests
  // won't have a token attached
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
    console.log(err);
    return next(
      new HttpError(
        "Something went wrong while verifying your stored credentials. Try logging in again.",
        401
      )
    );
  }
};
