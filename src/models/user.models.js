import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';


const userSchema= new Schema({

  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true , lowercase: true,trim: true },
  fullname: { type: String, required: true },
  avatar: { type: String ,required:true},
  coverImage: { type: String },
  password: { type: String, required: true },
  refreshToken: { type: String },
  watchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],

},{ timestamps: true });

  

userSchema.pre("save",async function (next) {
  if(!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password,10)
  

  next()

})
  
userSchema.methods.isPasswordCorrect= async function (password) {

 return await  bcrypt.compare(password,this.password)
 
}

userSchema.methods.generateacesstoken=async function () {
  //short lived acess token

  return jwt.sign({
    _id: this._id,
    email:this.email,
    username:this.username,
    fullName:this.fullname,
  },process.env.ACESS_TOKEN_SECRET,{expiresIn :process.env.ACESS_TOKEN_TIME}

)
  
}

userSchema.methods.generaterefreshtoken=async function () {
  //long lived acess token

  return jwt.sign({
    _id: this._id,
    
  },process.env.REFRESH_TOKEN_SECRET,{expiresIn :process.env.REFRESH_TOKEN_TIME}

)
  
}
userSchema.plugin(mongooseAggregatePaginate)


export const User= mongoose.model("User",userSchema)