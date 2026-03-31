import mongoose from "mongoose";
import dotenv from "dotenv"

const connectDB = async () => {
    try {
        dotenv.config();
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}`)
        console.log("MongoDB connection success", connectionInstance.connection.host);
    } catch (err) {
        console.error("MongoDB connection failure > ", err)
    }
}

export default connectDB