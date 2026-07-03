// src/middleware/upload.middleware.js
"use strict";

const multer = require("multer");
const path = require("path");
const AppError = require("../utils/AppError");

// ─── Storage: Memory (for Cloudinary upload) ──────────────────────────────────
const memoryStorage = multer.memoryStorage();

// ─── Storage: Disk (for local dev) ───────────────────────────────────────────
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// ─── File Filters ─────────────────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Only JPEG, PNG, and WebP images are allowed.", 400), false);
  }
};

const videoFilter = (req, file, cb) => {
  const allowed = ["video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Only MP4, MPEG, MOV, and AVI videos are allowed.", 400), false);
  }
};

const mediaFilter = (req, file, cb) => {
  const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const videoTypes = ["video/mp4", "video/mpeg", "video/quicktime"];
  if ([...imageTypes, ...videoTypes].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Unsupported file type.", 400), false);
  }
};

// ─── Upload Instances ─────────────────────────────────────────────────────────

// Avatar upload (single image, max 2MB)
const uploadAvatar = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("avatar");

// Movie poster/backdrop upload (max 5MB each)
const uploadMovieImages = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: "poster", maxCount: 1 },
  { name: "backdrop", maxCount: 1 },
]);

// Movie video upload (max 2GB)
const uploadVideo = multer({
  storage: diskStorage,
  fileFilter: videoFilter,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 },
}).single("video");

// ─── Error Wrapper ─────────────────────────────────────────────────────────────
const handleUpload = (uploader) => (req, res, next) => {
  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new AppError("File is too large. Please upload a smaller file.", 400));
      }
      return next(new AppError(`Upload error: ${err.message}`, 400));
    } else if (err) {
      return next(err);
    }
    next();
  });
};

module.exports = {
  uploadAvatar: handleUpload(uploadAvatar),
  uploadMovieImages: handleUpload(uploadMovieImages),
  uploadVideo: handleUpload(uploadVideo),
};
