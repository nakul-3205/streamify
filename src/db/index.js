import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb=async ()=>{
    try{
       const connectioninstance= await mongoose.connect (`${process.env.MONGODB_URL}/${DB_NAME}`)
       console.log('Mongodb Connected')

    }
    catch(error){
        console.log("database didnt connect",error)
        process.exit(1)

    }
}
export default connectDb