import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (filePath) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  if (!filePath) return null;

  try {
    const uploadResult = await cloudinary.uploader.upload(filePath);
    return uploadResult.secure_url;
  } catch (error) {
    console.log("Cloudinary upload error:", error);
    throw error;
  } finally {
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.log("File cleanup error:", error);
      }
    }
  }
};

export default uploadOnCloudinary;
