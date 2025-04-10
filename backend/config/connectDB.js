import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    console.log("Kết nối MongoDB thành công");
  } catch (error) {
    console.error("Lỗi kết nối ", error);
    process.exit(1);
  }
};



export default connectDB