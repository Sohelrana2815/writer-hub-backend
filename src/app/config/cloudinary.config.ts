// Multer will convert file object

import { v2 as cloudinary } from "cloudinary";
import { envVars } from "./env.js";

// req.body, Body object and file object

// body all input fields and the actual image

// file is the image

// Form data has both text data and image data

// So multer will convert file object to req.file
// and body to req.body

// req.body and req.file
cloudinary.config({
  cloud_name: envVars.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY_API_SECRET,
});

export const cloudinaryUpload = cloudinary;
