import { APIResponse } from "../utils/APIResponse.js"
import { APIError } from "../utils/APIError.js"
import { asyncHandler } from "../utils/AsyncHandler.js"
import { googleClient } from "../utils/googleClient.js"
import { User } from "../models/user.model.js"
import { Playlist } from "../models/playlist.model.js"
import { generateAccessAndRefreshToken } from "../utils/auth.js"
import { generateFromEmail } from "unique-username-generator"
import jwt from "jsonwebtoken"


const googleLogin = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        throw new APIError(400, "Google token is required");
    }

    const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, email_verified, sub} = payload;

    if (!email_verified) {
        throw new APIError(401, "Google email not verified");
    }

    let user = await User.findOne({ googleId: sub });

    if (user?.isDeleted) {
        throw new APIError(403,null, "Account scheduled for deletion");
    }

    if (!user) {
        let username = generateFromEmail(email, { randomDigits: 3 });

        while (await User.findOne({ username })) {
            username = generateFromEmail(email, { randomDigits: 4 });
        }

        user = await User.create({
            username,
            email,
            isOAuth: true,
            authProvider: "google",
            googleId: sub,
        });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = user.toObject();
    delete loggedInUser.password;
    delete loggedInUser.refreshToken;

    return res
        .status(200)
        .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
        })
        .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json(
            new APIResponse(200, { user: loggedInUser }, "User logged in via Google")
        );
});

const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            refreshToken: null
        }
    })

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new APIResponse(200, {}, "user logged out successfully")
        )
})

const refreshToken = asyncHandler(async (req, res) => {
    const incomingToken = req.cookies?.refreshToken || req.body.refreshToken

    if (!incomingToken) {
        throw new APIError(400, null, "Incoming token required")
    }

    let decodedToken;

    try {
        decodedToken = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET)
    } catch {
        throw new APIError(401, "invalid/expired token")
    }

    const user = await User.findById(decodedToken?._id).select("-password")

    if (!user) {
        throw new APIError(400, null, "No such user exists")
    }

    if (user.refreshToken !== incomingToken) {
        throw new APIError(401, null, "Invalid or expired token")
    }

    const accessTokenExpiry = 20 * 60 * 1000
    const refreshTokenExpiry = 7 * 24 * 60 * 60 * 1000

    const accessOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: accessTokenExpiry
    }

    const refreshOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: refreshTokenExpiry
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    return res.status(200)
        .cookie("accessToken", accessToken, accessOptions)
        .cookie("refreshToken", refreshToken, refreshOptions)
        .json(
            new APIResponse(200, { accessToken, refreshToken, message: "Access token refreshed" })
        )



})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user?._id;

    if (!user) {
        throw new APIError(400, null, "User not defined")
    }

    return res.status(200).json(
        new APIResponse(200, req.user, "User fetched successfully")
    )

})

const getUserStats = asyncHandler(async (req, res) => {
    const user = req.user

    if (!user) {
        throw new APIError(400, null, "user does not exists")
    }

    const playlists = await Playlist.countDocuments({ userId: user._id });

    // playlistsCreated
    // videosWatched
    // minutesWatched
    // currentStreak
    // longestStreak
    // notesCreated

    const userStats = {
        playlists: playlists,
        user: user
    }

    res.status(200).json(
        new APIResponse(200, userStats, "user stats fetched successfully")
    )


})

const deleteAccount = asyncHandler(async (req, res) => {
    const user = req.user

    if (!user) {
        throw new APIError(401, null, "User does not exists")
    }

    const deletedUser = await User.findByIdAndUpdate(user._id, {
        $set: {
            refreshToken: null,
            isDeleted: true,
            expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        }
    },
        { new: true });

    if (!deletedUser) {
        throw new APIError(500, "Some error while deleting user")
    }

    return res.status(200)
        .json(
            new APIResponse(200, null, "User Deleted succesfully")
        )
})

export {
    googleLogin,
    logout,
    refreshToken,
    getCurrentUser,
    deleteAccount,
    getUserStats
}

