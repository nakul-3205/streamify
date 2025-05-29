import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.models.js"
import {uploadoncloudinary,deletefromcloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { verifyJwt } from "../middlewares/auth.middleware.js";


const registerUser = asyncHandler (async(req,res)=>{

    const {fullname,email,username,password}=req.body

    if(
        [fullname,email,username,password].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required")
        
    }

    
    const existinguser= await User.findOne({
        $or:[{username},{email}]
    })
    if (existinguser){
        throw new ApiError(409,"user with this email or username already exists")
    }
    console.warn(req.files)
    const avatarlocalpath=req.files?.avatar[0]?.path 
    const coverlocalpath=req.files?.coverimage?.[0]?.path

    if(!avatarlocalpath){
        throw new ApiError(400,"Avatar file is missing")
    }
//      const avatar = await uploadoncloudinary(avatarlocalpath)
// let coverimage={url:""}
//      if(coverlocalpath){
//               coverimage=await uploadoncloudinary(coverlocalpath)

//      }
let avatar
try {
    avatar=await uploadoncloudinary(avatarlocalpath)
    console.log("uploaded avatar");
} catch (error) {
    console.log("error uploading avatar at line 43",error)
    throw new ApiError(500,"failed to upload avatar")
    

}

let coverimage
if(coverlocalpath){
    try {
    coverimage=await uploadoncloudinary(coverlocalpath)
    console.log("uploaded avatar");
} catch (error) {
    console.log("error uploading cover image at line 56",error)
    throw new ApiError(500,"failed to upload avatar")
    

}
}



     try {
        const user=await User.create({
           fullname,
           username ,
           email,
           password,
           avatar: avatar.url,
           coverimage: coverimage?.url||"",
   
           
           
        })
   
        const createduser= await User.findById(user._id).select(
           "-password -refreshtoken"
        )
   
        if(!createduser){
           throw new ApiError(500,"something went wrong while registering the user")
           
        }
        return res.status(201).json(new ApiResponse(
           200,createduser,"user registered sucessfully"
        )
   
        )
     } catch (error) {
        console.log("user creation failed",error)
        if(avatar){
            await deletefromcloudinary(avatar.public_id)
        }
        if(coverimage){
            await deletefromcloudinary(coverimage.public_id)
        }
        throw new ApiError(500,"something went wrong and images were deleted")
     }


})
const generateacessandrefreshtoken=async(userid)=>{
  try {
    const user= await User.findById(userid)
    if(!user){
      throw new ApiError(400,"user doesnot exist")
      }
     const acesstoken=user.generateacesstoken()
     const refreshtoken=user.generaterefreshtoken()
     user.refreshtoken=refreshtoken
     await user.save({validateBeforeSave: false})
     return {acesstoken,refreshtoken}
  } catch (error) {
    throw new ApiError(500,"error creating new user")
  }
}
const loginUser=asyncHandler(async(req,res)=>{
    //getting data from body
    const {email,username,password}= req.body
    //validating
    if(!email){
        throw new ApiError(400,"email is required")
    }
    if(!username){
        throw new ApiError(400,"username is required")
    }if(!password){
        throw new ApiError(400,"password is required")
    }
    const user= await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(400,"user not found")
    }
    console.log("Input password:", req.body.password);
console.log("Hashed password in DB:", user.password);

    //validating the password
    const isPasswordvalid=await user.isPasswordCorrect(password)
    if(!isPasswordvalid){
        throw new ApiError(400,"Invalid password")
    }

    const {acesstoken,refreshtoken}=await generateacessandrefreshtoken(user._id)

    const loggedinuser= await User.findById(user._id).select("-password -refreshtoken")

    const option={
        httpOnly:true,
        secure:process.env.NODE_ENV==='production'

    }

    return res
    .status(200)
    .cookie('acesstoken',acesstoken,option)
    .cookie('refreshtoken',refreshtoken,option)
    .json(new ApiResponse(200,{user:loggedinuser,acesstoken,refreshtoken},'user logged in sucessfully'))
})
const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshtoken: undefined,
            }
        },
        {
            new :true,

        }


    )
    const option={
        httpOnly:true,
        secure:process.env.NODE_ENV==='production'

    }
    return res
     .status(200)
     .clearCookie("acesstoken",option)
     .clearCookie("refreshtoken",option)
     .json(new ApiResponse(200,{},"user logged out sucessfully"))
})

const refreshacesstoken= asyncHandler(async(req,res)=>{
    const incomingrefreshtoken=req.cookies.refreshtoken ||req.body.refreshtoken

    if(!incomingrefreshtoken) { 
        throw new ApiError(401,"Refresh Token is required")
    }

        try {
           const decodedToken= jwt.verify(
                incomingrefreshtoken,
                process.env.REFRESH_TOKEN_SECRET,
            )
            const user= await User.findById(decodedToken?._id)
            if(!user){
                throw new ApiError(401,"Invalid refresh token")
            }
            if(incomingrefreshtoken !== user?.refreshtoken){
                throw new ApiError(401,"Invalid refresh token")
            }
            const option={
        httpOnly:true,
        secure:process.env.NODE_ENV==='production'

    }
            const {acesstoken,refreshtoken:newrefreshtoken}= await generateacessandrefreshtoken(user._id)
            return res
            .status(200)
            .cookie("acesstoken",acesstoken,option)
            .cookie("refreshtoken",newrefreshtoken,option)
            .json(new ApiResponse(200,
                {acesstoken,refreshtoken:newrefreshtoken},
                "Acess token refreshed sucessfully"))





        } catch (error) {
            throw new ApiError(500,"something went wrong while refreshing token")
        }

})

const changecurrentpassword=asyncHandler(async(req,res)=>{
    const {oldpassword,newpassword}=req.body

   const user= await User.findById(req.user?._id)
    const validpassword=await user.isPasswordCorrect(oldpassword)
    if(!validpassword){
        throw new ApiError(405,"invalid password")
    }
    user.password=newpassword
    await user.save({validateBeforeSave:false})
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Sucessfull"))

})

const getcurrentuser=asyncHandler(async(req,res)=>{
    return res.status(200).json( new ApiResponse(200,req.user,"current user details"))

})

const updateaccountdetail=asyncHandler(async(req,res)=>{
    const {fullname,email}=req.body
    if(!fullname || !email){
        throw new ApiError(400,"Email and  fullname are required")

    }
    const user=await User.findByIdAndUpdate(
        req.user._id,
        {
        $set:{
            fullname,
            email:email,
        }}
        ,{new:true}
    ).select("-password -refreshtoken")
        return res.status(200).json( new ApiResponse(200,user,"Account details updated"))


})


const updateavatarimage=asyncHandler(async(req,res)=>{
    const avatarlocalpath=req.file?.path
    if(!avatarlocalpath){
        throw new ApiError(404,"not found")
    }
    const avatar=await uploadoncloudinary(avatarlocalpath)
    if(!avatar.url){
        throw new ApiError(500,"something went wrong")
    }
    await User.findByIdAndUpdate(
        req.user?._id
        ,{
            $set:{
                avatar:avatar.url
            }
        },{new:true}
    ).select("-password -refreshtoken")
         return res.status(200).json( new ApiResponse(200,"Account details updated"))


})

const updatecoverimage=asyncHandler(async(req,res)=>{
    const coverlocalpath=req.file?.path
    if(!coverlocalpath){
        throw new ApiError(404,"not found")
    }
    const cover=await uploadoncloudinary(coverlocalpath)
    if(!cover.url){
        throw new ApiError(500,"something went wrong")
    }
     
    await User.findByIdAndUpdate(
        req.user?._id
        ,{
            $set:{
                coverimage:cover.url
            }
        },{new:true}
    ).select("-password -refreshtoken")
         return res.status(200).json( new ApiResponse(200,"Account details updated"))

    


})

const getchannelprofile=asyncHandler(async(req,res)=>{
    const {username}=req.params
    if(!username){
        throw new ApiError(400,"username not found")

    }
    const channelinfo= await User.aggregate([
        {
            $match:{
                username:username

            }

        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribed to"
            }
        },
        {
            $addFields:{
                subscriberscount:{
                    $size:"$subscirbers"
                },
                channelssubscribedtocount:{
                    $size:"$subscribedto"

                },
                isSubscribed:{
                    $cond:{
                         if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                         then:true,
                         else:false
                    }
                }
            }
        },
        {
            //project only necessary data
            $project:{
                fullname:1,
                username:1,
                avatar:1,
                subscriberscount:1,
                channelssubscribedtocount:1,
                isSubscribed:1,
                coverimage:1,
                email:1,
            }
            
        }
    ])
if(!channelinfo?.length){
    throw new ApiError(404,"Channel not found")
}
return res
        .status(200)
        .json(new ApiResponse(200,channelinfo[0],"channel found"))
console.log(channelinfo[0])

})


const getwatchhistory=asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId (res.user?._id)} },
        {
            $lookup: {
                from: "videos", 
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline:[{
                    from: "users", 
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline:[
                {
                    $project:{
                        fullname:1,
                        username:1,
                        avatar:1,
                    }
                }
                ]
                },
                {
                    $addFields:{
                        owner:{
                            $first:"owner",

                        }
                        
                    }
                }
            
            
            
            ],

                
            }
        },
        // {
        //     $project: {
        //         _id: 0,
        //         watchHistory: "$watchHistoryDetails"
        //     }
        // }
    ]);

    if (!result.length) {
        throw new ApiError(404, "User or watch history not found");
    }

    return res.status(200).json(
        new ApiResponse(200, result[0].watchHistory, "Watch history fetched successfully")
    );

    
})



export {
        registerUser,
        loginUser,
        refreshacesstoken,
        logoutUser,
        updatecoverimage,
        updateavatarimage,
        updateaccountdetail,
        getcurrentuser,
        changecurrentpassword,
        getchannelprofile,
        getwatchhistory
    }