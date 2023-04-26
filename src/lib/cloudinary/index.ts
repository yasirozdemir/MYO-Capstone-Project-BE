import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

export const avatarUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "capstone/users/avatars", // CHANGE FOLDER NAME LATER
    } as { folder: string },
  }),
}).single("avatar");

export const coverUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "capstone/albums/covers", // CHANGE FOLDER NAME LATER
    } as { folder: string },
  }),
}).single("cover");
