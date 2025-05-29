import jwt from "jsonwebtoken"
import {User} from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asynchandler.js"



 export const verifyJwt = asyncHandler(async(req,_,next)=>{
          const token =req.cookies.acessToken ||req.header["Authorization"]?.replace("Bearer ","")
          if (!token){
            throw new ApiError(401,"unauthorized")
          }
          console.log(token)
          try {
            const decodedToken=jwt.verify(token,process.env.ACESS_TOKEN_SECRET)
            const user= await User.findById(decodedToken?._id).select("-password -refreshtoken")
            if(!user){
              throw new ApiError(401,"unauthorized")
            }
            req.user=user

            next()
          
          } catch (error) {
            
            throw new ApiError(401,"something went wrong")
          }
          
})
