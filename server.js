import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import clientRoutes from "./routes/clientRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use("/api/clients", clientRoutes);
app.use("/api/portfolio", portfolioRoutes);


app.listen(5000, () => console.log("Server running on port 5000"));
