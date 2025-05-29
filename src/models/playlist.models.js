// models/Playlist.js
import mongoose, { Schema } from "mongoose";

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);
