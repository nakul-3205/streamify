// models/Video.js
import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';



const videoSchema = new mongoose.Schema({
  videoFile: { type: String, required: true },
  thumbnail: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true },
  views: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

videoSchema.plugin(mongooseAggregatePaginate)

module.exports = mongoose.model('Video', videoSchema);
