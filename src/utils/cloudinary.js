import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({
  path: "./src/.env"
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async function(localfilePath) {
  try {
    if (!localfilePath) return null;
    const response = await cloudinary.uploader.upload(localfilePath, {
      resource_type: 'auto'
    });
    console.log("File uploaded on Cloudinary. File URL:", response.url);

    // Attempt to delete the local file
    try {
      fs.unlinkSync(localfilePath);
      console.log("File deleted from local storage:", localfilePath);
    } catch (unlinkError) {
      console.error("Error deleting file from local storage:", unlinkError);
    }

    return response;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);

    // Attempt to delete the local file in case of an error
    try {
      fs.unlinkSync(localfilePath);
      console.log("File deleted from local storage after error:", localfilePath);
    } catch (unlinkError) {
      console.error("Error deleting file from local storage after error:", unlinkError);
    }

    return null;
  }
};

const clearCloudinary = async function(publicIds, resourceType) {
  try {
    console.log("Attempting to delete files from Cloudinary with public IDs:", publicIds);
    const result = await cloudinary.api.delete_resources(publicIds, {
      type: 'upload',
      resource_type: resourceType
    });
    console.log("Files deleted from Cloudinary. Result:", result);
    return result;
  } catch (error) {
    console.error("Error deleting files from Cloudinary:", error);
    throw error;
  }
};

export { uploadOnCloudinary, clearCloudinary };