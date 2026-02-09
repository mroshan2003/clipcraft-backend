import express from "express";
import multer from "multer";
import Client from "../models/Client.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { updateClientsJson } from "../utils/updateClientsJson.js";

const router = express.Router();
let cache = null;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "clients" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};



// ✅ UPLOAD CLIENT
router.post("/upload", adminAuth, upload.single("logo"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, error: "No file uploaded" });

    const result = await uploadToCloudinary(req.file.buffer);

    const client = await Client.create({
      name: req.body.name,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      link: req.body.link
    });

    cache = null;                 // 🔥 clear API cache
    await updateClientsJson();    // 🔥 update static file

    res.json({ success: true, client });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});



// ✅ DELETE CLIENT
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client)
      return res.status(404).json({ success: false });

    await cloudinary.uploader.destroy(client.publicId);
    await client.deleteOne();

    cache = null;                 // 🔥 clear API cache
    await updateClientsJson();    // 🔥 update static file

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});



// ✅ FETCH CLIENTS (ADMIN / API USE ONLY)
router.get("/", async (req, res) => {
  if (cache) return res.json(cache);

  const clients = await Client.find().lean();
  cache = clients;

  setTimeout(() => (cache = null), 60000);
  res.json(clients);
});



// ✅ VERIFY ADMIN
router.post("/verify", (req, res) => {
  if (req.body.password === process.env.ADMIN_PASSWORD)
    return res.json({ success: true });

  res.status(401).json({ success: false });
});

export default router;
