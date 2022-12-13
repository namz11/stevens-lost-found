const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${new Date().valueOf()}_${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only jpg/jpeg & png files supported."),
      false
    );
  }
};

const imageUpload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter,
});

itemImageUpload = (req, res, next) => {
  imageUpload.single("picture")(req, res, function (error) {
    if (error) {
      if (error.code == "LIMIT_FILE_SIZE") {
        error.message = "File Size is too large. Allowed file size is 5MB";
        error.success = false;
      }
      return res.status(400).json(error);
    } else {
      next();
    }
  });
};

module.exports = { itemImageUpload };
