const cloudinary = require("cloudinary").v2;
import dotenv from 'dotenv';
dotenv.config();
// console.log(process.env.CLOUD_NAME);
// console.log(process.env.API_KEY);
// console.log(process.env.API_SECRET);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const  uploadToCloudinary = (path, folder) => {
  return cloudinary.uploader
    .upload(path, { folder })
    .then((data) => {
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
        }
    );
}
export { uploadToCloudinary, removeFromCloudinary };
