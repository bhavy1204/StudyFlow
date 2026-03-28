import mongoose from "mongoose"

const videoSchema = new mongoose.Schema({
    playlistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Playlist",
        required: true
    },
    youtubeVideoId: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    order: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    watchedDuration: {
        type: Number,
        default: 0
    },
    completed: {
        type: Boolean,
        default: false
    }

}, {timestamps:true})

export const Video = mongoose.model("Video", videoSchema);