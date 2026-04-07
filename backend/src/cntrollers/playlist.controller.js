import { youtube } from "../utils/youtubeClient.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { APIResponse } from "../utils/APIResponse.js";
import { APIError } from "../utils/APIError.js";


function parseDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

    const hours = match[1] ? parseInt(match[1].replace("H", "")) : 0;
    const minutes = match[2] ? parseInt(match[2].replace("M", "")) : 0;
    const seconds = match[3] ? parseInt(match[3].replace("S", "")) : 0;

    return hours * 3600 + minutes * 60 + seconds;
}

import { youtube } from "../utils/youtubeClient.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { APIResponse } from "../utils/APIResponse.js";
import { APIError } from "../utils/APIError.js";

function parseDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

    const hours = match[1] ? parseInt(match[1].replace("H", "")) : 0;
    const minutes = match[2] ? parseInt(match[2].replace("M", "")) : 0;
    const seconds = match[3] ? parseInt(match[3].replace("S", "")) : 0;

    return hours * 3600 + minutes * 60 + seconds;
}

const importPlaylist = asyncHandler(async (req, res) => {

    const { playlistUrl, title, description } = req.body;
    const user = req.user;

    if (!playlistUrl) {
        throw new APIError(400, "Playlist URL required");
    }

    const url = new URL(playlistUrl);
    const playlistId = url.searchParams.get("list");

    if (!playlistId) {
        throw new APIError(400, "Invalid playlist URL");
    }

    const playlistData = await youtube.playlists.list({
        part: ["snippet", "contentDetails"],
        id: playlistId
    });

    if (!playlistData.data.items.length) {
        throw new APIError(404, "Playlist not found");
    }

    const ytPlaylist = playlistData.data.items[0];

    const newPlaylist = await Playlist.create({
        userId: user._id,
        title: title || ytPlaylist.snippet.title,
        description: description || ytPlaylist.snippet.description
    });

    let nextPageToken = null;
    let order = 0;

    do {

        const response = await youtube.playlistItems.list({
            part: ["snippet", "contentDetails"],
            playlistId,
            maxResults: 50,
            pageToken: nextPageToken
        });

        const validItems = response.data.items.filter(
            item => item.snippet.title !== "Deleted video"
        );

        const videoIds = validItems
            .map(item => item.contentDetails.videoId)
            .join(",");

        //duration..
        const videoDetails = await youtube.videos.list({
            part: ["contentDetails"],
            id: videoIds
        });

        const durationMap = {};

        videoDetails.data.items.forEach(video => {
            durationMap[video.id] = parseDuration(video.contentDetails.duration);
        });

        const videos = validItems.map(item => ({
            playlistId: newPlaylist._id,
            youtubeVideoId: item.contentDetails.videoId,
            title: item.snippet.title,
            duration: durationMap[item.contentDetails.videoId] || 0,
            order: order++
        }));

        if (videos.length) {
            await Video.insertMany(videos);
        }

        nextPageToken = response.data.nextPageToken;

    } while (nextPageToken);

    return res.status(201).json(
        new APIResponse(201, newPlaylist, "Playlist imported successfully")
    );

});

export { importPlaylist };

const getUserPlaylists = asyncHandler(async (req, res) => {

    const userId = req.user?._id;

    if (!userId) {
        throw new APIError(400, null, "UserId required")
    }

    const playlists = await Playlist.find({ userId })
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new APIResponse(200, playlists, "Playlists fetched")
    );

});

const getPlaylistById = asyncHandler(async (req, res) => {

    const { playlistId } = req.params;

    if (!playlistId) {
        throw new APIError(400, null, "PlaylistId required")
    }

    const playlist = await Playlist.findOne({
        _id: playlistId,
        userId: req.user?._id
    });

    if (!playlist) {
        throw new APIError(404, "Playlist not found");
    }

    const videos = await Video.find({ playlistId })
        .sort({ order: 1 });

    return res.status(200).json(
        new APIResponse(200, { playlist, videos }, "Playlist fetched")
    );

});

const updatePlaylist = asyncHandler(async (req, res) => {

    const { playlistId } = req.params;
    const { title, description, dueDate } = req.body;

    if (!playlistId) {
        throw new APIError(400, null, "Playlist ID required")
    }

    const playlist = await Playlist.findOneAndUpdate(
        { _id: playlistId, userId: req.user?._id },
        { title, description, dueDate },
        { new: true }
    );

    if (!playlist) {
        throw new APIError(404, "Playlist not found");
    }

    return res.status(200).json(
        new APIResponse(200, playlist, "Playlist updated")
    );

});


const deletePlaylist = asyncHandler(async (req, res) => {

    const { playlistId } = req.params;

    const playlist = await Playlist.findOneAndDelete({
        _id: playlistId,
        userId: req.user._id
    });

    if (!playlist) {
        throw new APIError(404, "Playlist not found");
    }

    await Video.deleteMany({ playlistId });

    return res.status(200).json(
        new APIResponse(200, null, "Playlist deleted")
    );

});


export {
    importPlaylist,
    getPlaylistById,
    getUserPlaylists,
    updatePlaylist,
    deletePlaylist
}
