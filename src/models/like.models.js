// models/Like.js
import mongoose, { Schema } from "mongoose";

const likeSchema = new mongoose.Schema({
  comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
  tweet: { type: mongoose.Schema.Types.ObjectId, ref: 'Tweet' },
  likedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Like', likeSchema);
