import { APIError } from "../utils/APIError";
import { asyncHandler } from "../utils/AsyncHandler.js"
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"


export const verifyJwt = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = req.cookies?.accessToken || (authHeader && authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null)

    if(!token){
        throw new APIError(401, "Token missing")
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    } catch (error) {
        throw new APIError(401, "Invalid or expired token")
    }

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if(!user){
        throw new APIError(404, "No such user exists")
    }

    req.user = user;
    next();
})









