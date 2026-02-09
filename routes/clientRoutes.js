import express from "express";
import multer from "multer";
import Client from "../models/Client.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const router = express.Router();
let cache = null;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "clients" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};


// Upload client logo
router.post("/upload", adminAuth, upload.single("logo"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, error: "No file uploaded" });

    const result = await uploadToCloudinary(req.file.buffer);

    const client = new Client({
      name: req.body.name,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      link: req.body.link
    });

    await client.save();

    res.json({
      success: true,
      message: "Client added successfully",
      client
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// Delete client
router.delete("/:id", adminAuth, async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) return res.status(404).json({ success: false });

  await cloudinary.uploader.destroy(client.publicId);
  await client.deleteOne();

  res.json({ success: true });
});


// Fetch all clients
router.get("/", async (req, res) => {
  if (cache) return res.json(cache);

  const clients = await Client.find().lean();
  cache = clients;

  setTimeout(() => (cache = null), 60000); // 1 min cache
  res.json(clients);
});

// Verify admin password
router.post("/verify", (req, res) => {
  const pass = req.body.password;
  if (pass === process.env.ADMIN_PASSWORD) {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, error: "Invalid password" });
});

export default router;
