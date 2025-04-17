import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    index: true,
  },
});

// categorySchema.index({ _id: -1 });
const Category = mongoose.model("Category", categorySchema);
export default Category;