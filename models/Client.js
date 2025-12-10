import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  link: { type: String, default: "", required: true }
});

export default mongoose.model("Client", clientSchema);
