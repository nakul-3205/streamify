// models/Tweet.js
import mongoose, { Schema } from "mongoose";

const tweetSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Tweet', tweetSchema);
