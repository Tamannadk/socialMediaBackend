import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app, httpServer,io } from "./app.js"

dotenv.config(
    {
        path:"../.env"
    }
)

connectDB()
.then(()=>{
    httpServer.listen(process.env.PORT || 8000,()=>{
        console.log(`⚙️  Server is running at port : ${process.env.PORT}`)
    })

   
})
.catch((error)=>{
    console.log("MONGO db connection failed !!! ", error);
})