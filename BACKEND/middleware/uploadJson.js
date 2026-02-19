const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (path.extname(file.originalname) !== ".json") {
    return cb(new Error("Only JSON files allowed"), false);
  }
  cb(null, true);
};

module.exports = multer({ storage, fileFilter });
