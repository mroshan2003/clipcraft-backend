import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  name: String,
  imageUrl: String,
  publicId: String,
  link: String
});

export default mongoose.model("Client", clientSchema);
