// models/Comment.js
import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

commentSchema.plugin(mongooseAggregatePaginate)

module.exports = mongoose.model('Comment', commentSchema);
