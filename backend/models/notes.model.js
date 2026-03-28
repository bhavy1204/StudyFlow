import mongoose from "mongoose"

const notesSchema = new mongoose.Schema({
    creator:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    videoId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Video",
        required:true
    },
    playlistId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Playlist",
        required: true
    },
    content:{
        type:String,
        required:true
    }
},{timestamps:true})

export const Note = mongoose.model("Note", notesSchema);