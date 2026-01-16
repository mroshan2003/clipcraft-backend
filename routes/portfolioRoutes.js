import express from "express";
import multer from "multer";
import Portfolio from "../models/Portfolio.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Upload portfolio image
router.post("/upload", adminAuth, upload.single("image"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const result = await cloudinary.uploader.upload(filePath, {
      folder: "portfolio",
      resource_type: "video",   // 🔥 REQUIRED FOR VIDEOS
    });


    fs.unlinkSync(filePath);

    const item = new Portfolio({
      title: req.body.title,
      category: req.body.category,
      imageUrl: result.secure_url,
    });

    await item.save();

    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all portfolio items
router.get("/", async (req, res) => {
  const items = await Portfolio.find();
  res.json(items);
});

// Delete portfolio image
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    await Portfolio.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Portfolio item deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/update-title/:id", adminAuth, async (req, res) => {
  const { title } = req.body;

  try {
    const item = await Portfolio.findByIdAndUpdate(
      req.params.id,
      { title },
      { new: true }
    );
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


export default router;
