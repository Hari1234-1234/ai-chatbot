const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// Configure where uploaded files will be stored.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },

  filename: (req, file, cb) => {
    // Generate a unique filename.
    const uniqueName = crypto.randomUUID();

    // Get the original file extension.
    const extension = path.extname(file.originalname).toLowerCase();

    cb(null, `${uniqueName}${extension}`);
  },
});

// Allow only PDF and DOCX files.
const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  const allowedExtensions = [".pdf", ".docx"];

  const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (
    allowedExtensions.includes(extension) &&
    allowedMimeTypes.includes(file.mimetype)
  ) {
    return cb(null, true);
  }

  cb(new Error("Only PDF and DOCX files are allowed"));
};

// Configure Multer.
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1,
  },
});

module.exports = upload;
