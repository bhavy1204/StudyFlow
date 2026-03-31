import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"

const app = express();

dotenv.config();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '5mb' }));

app.use(express.urlencoded({ extended: true}));

app.use(cookieParser());


app.use(express.static("public"));

app.use((err,req,res,next)=>{
    console.error(err);
    res.status(err.status || 500).json(
        {
            message:err.message || "Internal server error"
        }
    )
})

export {app}



