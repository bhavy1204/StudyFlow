import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {    
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    startedAt: {
        type: Date
    },  
    dailyTargetMinutes: {
        type: Number,
        required: true, 
    },
    isComplete: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Playlist = mongoose.model("Playlist", playlistSchema);