import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: proces.env.CLOUDINARY_API_KEY,
  api_secret: proces.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;