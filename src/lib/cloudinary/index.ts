import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
require("dotenv").config();

const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } =
  process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export const avatarUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "WhataMovie/users/avatars",
    } as { folder: string },
  }),
}).single("avatar");

export const coverUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "WhataMovie/watchlists/covers",
    } as { folder: string },
  }),
}).single("cover");
