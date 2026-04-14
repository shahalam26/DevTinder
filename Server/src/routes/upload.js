const express = require("express");
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "devtinder" },
      (error, result) => {
        if (error) return res.status(500).json({ error });

        res.json({ url: result.secure_url });
      }
    );

    uploadStream.end(file.buffer);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
