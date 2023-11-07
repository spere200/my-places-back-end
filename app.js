if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const fs = require("fs");
const path = require("path");
// require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const userRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

// this is static serving, which means any request which starts with the string
// in the first parameter is handled by the static middleware returned by
// express static, which given a valid filesystem path, returns any file
// in that path by name
app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use("/api/places", placesRoutes);
app.use("/api/users", userRoutes);

// only reached if no match was found in the routes middleware
app.use((req, res, next) => {
  next(new HttpError("Could not find this route.", 404));
});

app.use((error, req, res, next) => {
  // if we hit this middleware there was an error somewhere along the way, so we can use
  // this to rollback the image upload if something went wrong

  // the file field is added by multer, and if it's set that means the invalid request
  // involved an image
  if (req.file) {
    // default API, unlink removes a file given it's path and calls a callback once
    // finished that automatically has an error set in case something went wrong
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.log("Failed to remove image from back-end storage.");
        console.log(err);
      }
    });
  }

  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.MERN_USER}:${process.env.MERN_PASSWORD}@cluster0.qke1ugj.mongodb.net/${process.env.MERN_DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => app.listen(process.env.PORT || 5000))
  .catch((error) => console.log(error));
