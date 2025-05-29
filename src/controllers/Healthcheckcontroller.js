import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

const healthcheck = asyncHandler (async(req,res)=>{
   return res.status(200).json(new ApiResponse (200,"OK","Health Check Passed"))

})
export {healthcheck}