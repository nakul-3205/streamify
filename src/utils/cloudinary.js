import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import dotenv  from 'dotenv';
dotenv.config()
// Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET

    })

    const uploadoncloudinary=async(localFilePath)=>{
        try {
            if(!localFilePath) return null

            const respone=await cloudinary.uploader.upload(localFilePath,{
                resource_type:"auto"
                
            })
            console.log('file uploaded on cloudinary'+ respone.url)

            fs.unlinkSync(localFilePath)
            return respone
            
        } catch (error) {
            console.log("cloudinary error",error)
            fs.unlinkSync(localFilePath)
            return null
            
        }

    }
    const deletefromcloudinary= async (publicid)=>{
        try {
          const result= await  cloudinary.uploader.destroy(publicid)
          console.log("deleted from cloudinary")
            
        } catch (error) {
            console.log("error deleting from cloudinary",error);
            return null
        }
    }

    export {uploadoncloudinary,deletefromcloudinary}