const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../Utils/Cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
  }),
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;
