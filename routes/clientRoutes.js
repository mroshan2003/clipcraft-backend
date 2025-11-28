import express from "express";
import multer from "multer";
import Client from "../models/Client.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// Upload client logo
router.post("/upload", adminAuth, upload.single("logo"), async (req, res) => {
  try {
    const file = req.file.path;

    const result = await cloudinary.uploader.upload(file, {
      folder: "clients"
    });

    fs.unlinkSync(file);

    const client = new Client({
      name: req.body.name,
      imageUrl: result.secure_url
    });

    await client.save();

    res.json({ message: "Client added successfully", client });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ error: "Not found" });

    res.json({ success: true, message: "Client removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all clients
router.get("/", async (req, res) => {
  const clients = await Client.find();
  res.json(clients);
});

export default router;
