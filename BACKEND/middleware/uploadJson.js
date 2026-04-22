const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (path.extname(file.originalname).toLowerCase() !== ".json") {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only JSON files allowed"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;