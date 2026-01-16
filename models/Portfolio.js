import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  category: {
    type: String,
    enum: ["shoot_edit", "edit_only"],
    required: true,
  }

});

export default mongoose.model("Portfolio", portfolioSchema);
