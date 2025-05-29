import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const errorhandler=(err,res,next,req)=>{
    let error=err

    if(!(error instanceof ApiError)){
        const statuscode=error.statuscode||error instanceof mongoose
        mongoose.Error? 400:500
    }
    const message =error.message ||'something went wrong'
    error=new ApiError(statuscode,message,error?.error ||[], error.stack)

    const response={
        ...error,
        message: error.message,
         


    }
    return res.status(error.statuscode).json(response)
}

export {errorhandler}