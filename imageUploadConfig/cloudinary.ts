import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
// console.log(process.env.CLOUD_NAME);
// console.log(process.env.API_KEY);
// console.log(process.env.API_SECRET);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadToCloudinary = async (path: string, folder: string) => {
  return cloudinary.uploader
    .upload(path, { folder })
    .then((data: UploadApiResponse) => {
      return { url: data.url, public_id: data.public_id };
    })
    .catch((error) => {
      console.log(error);
    });
};

const removeFromCloudinary = async (public_id) => {
  await cloudinary.uploader.destroy(public_id, (error, result) => {
    if (error) {
      console.log(error);
    }
    console.log(result);
  });
};

const uploadVideoToCloudinary = async (path: string, folder: string) => {
  return cloudinary.uploader
    .upload(path, { resource_type: "video", folder })
    .then((data: UploadApiResponse) => {
      return { url: data.url, public_id: data.public_id };
    })
    .catch((error) => {
      throw error
      console.log("error while uplaoding video to cloudinary", error);
    });
};

const removeVideoFromCloudinary = async (public_id) => {
  await cloudinary.uploader.destroy(
    public_id,
    { resource_type: "video" },
    (error, result) => {
      if (error) {
        console.log(error);
      }
      console.log(result);
    }
  );
};

export {
  uploadToCloudinary,
  removeFromCloudinary,
  removeVideoFromCloudinary,
  uploadVideoToCloudinary,
};
