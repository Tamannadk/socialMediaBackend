import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // upload the file on Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // Check if the file exists before attempting to delete it
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // Remove local file after successful upload
    }

    return response;

  } catch (error) {
    // Check if the file exists before attempting to delete it after a failed upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // Remove local file in case of failure
    }

    console.error("Error during Cloudinary upload: ", error);
    return null;
  }
};

const uploadMultipleFiles = async (filePaths) => {
  try {
    const uploadPromises = filePaths.map((path) => uploadOnCloudinary(path));
    const responses = await Promise.all(uploadPromises);
    // console.log("responses", responses);
    return responses; // This will contain responses for all uploaded images
  } catch (error) {
    console.error("Error uploading multiple files: ", error);
    return null;
  }
};

const deleteFile = async (publicUrls) => {
  try {
    if (!publicUrls || publicUrls.length === 0) return null;

    // Extract public IDs from the URLs (assuming they have the same format)
    const getPublicId = (url) => {
      // Adjust this extraction according to your Cloudinary URL structure
      const parts = url.split('/');
      const publicIdWithExtension = parts[parts.length - 1]; // e.g. 'filename.jpg'
      const publicId = publicIdWithExtension.split('.')[0]; // Removes file extension
      return publicId;
    };

    const deletedFiles = publicUrls.map((url) => cloudinary.uploader.destroy(getPublicId(url)));
    const response = await Promise.all(deletedFiles);
    return response;
  } catch (error) {
    console.log("Error while deleting uploaded file from cloudinary: ", error.message);
    return null;
  }
};


export { uploadOnCloudinary, uploadMultipleFiles,deleteFile };
