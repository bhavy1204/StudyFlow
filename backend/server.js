import dotenv from 'dotenv';
dotenv.config({ path: "./env" })

import connectDB from './src/db/index.js';
import { app } from "./app.js"

connectDB()
    .then(() => {
        app.on("error", (err) => {
            console.error("Express Error => ", err)
        })
        app.listen(process.env.PORT, () => {
            console.log("Server up and running at port ", process.env.PORT)
        })
    }).catch((err)=>{
        console.error("Connection Error => ",err)
    })
