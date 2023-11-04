const multer = require("multer");
const { v1: uuid } = require("uuid");

// By convention in node, the first argument to a callback is usually used
// to indicate an error. If it's something other than null, the operation
// was unsuccessful for some reason -- probably something that the callee
// cannot recover from but that the caller can recover from. Any other arguments
// after the first are used as return values from the operation
// (success messages, retrieval, etc.), this is why null is passed for both cb()

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

// creates an object that has several pre-configured middleware
const fileUpload = multer({
  //in bytes,
  limits: 500000,

  // one of the default multer storage types
  // https://www.npmjs.com/package/multer#diskstorage
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/images");
    },

    filename: (req, file, cb) => {
      // get the file extension using a map of mimetypes provided by multer
      const ext = MIME_TYPE_MAP[file.mimetype];

      // creates an image with the name provided in the second parameter
      cb(null, uuid() + "." + ext);
    },
  }),

  // optional item, a callback function that takes req, file, and cb and decides whether
  // the file is accepted or not using the cb
  fileFilter: (req, file, cb) => {
    // returns true if file.mimetype exists in MIME_TYPE_MAP, false otherwise
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type.");

    // second parameter is bool, if it's valid accept the file, otherwise deny it,
    // although logic is a bit redundant since if the mime-type is invalid the error is
    // set and the file will be denied anyways
    cb(error, isValid);
  },
});

module.exports = fileUpload;
