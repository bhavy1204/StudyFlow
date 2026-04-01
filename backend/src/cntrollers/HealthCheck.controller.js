import { APIError } from "../utils/APIError";
import { APIResponse } from "../utils/APIResponse";
import { asyncHandler } from "../utils/AsyncHandler";
import mongoose from "mongoose";


const healthCheck = asyncHandler((req,res)=>{
    const healthData = {
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        memoryUsage: process.memoryUsage(),
        database: {
            status: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
        }
    }
    return res.status(200).json(
        new APIResponse(200, healthData, "Health Check Controller working")
    )
})

export {healthCheck}
