import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import dotenv from "dotenv"
dotenv.config({
      path:'.env'
  })

cloudinary.config({
      cloud_name:`${process.env.CLOUDINARY_CLOUDNAME}`,
      api_key:`${process.env.CLOUDINARY_API_KEY}`,
      api_secret:`${process.env.CLOUDINARY_API_SECRET}`,
}); 

const uplaodOnCloudinary = async (localFilePath)=>{
      try{
            if (!localFilePath) {
                  return "File Path is Not Found";
            } else {
                  //upload the file on cloudinary
                  const response = await cloudinary.uploader.upload(localFilePath,{
                        resource_type: "auto"
                  })
                  //file has been uploaded success
                  return response;
            }
      }catch(error){
             // remove the locally saved temporary file as the upload operation got failed.
            fs.unlinkSync(localFilePath);

      }
}

export {uplaodOnCloudinary};