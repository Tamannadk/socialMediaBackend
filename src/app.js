import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import {Server} from "socket.io"
import { createServer } from "http";
import userRouter from "./routes/user.routes.js"
import postRouter from "./routes/post.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import followRouter from "./routes/follow.routes.js"
import bookmarkRouter from "./routes/bookmark.routes.js"

const app=express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
      origin: "*", // Adjust the origin as needed
      methods: ["GET", "POST"],
    //   credentials: true,
    },
  });
app.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
        credentials:true
    }
))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
let users = [];
io.on('connection', (socket) => {
    users = users.filter((user) => user.socketId !== socket.id);
    console.log('A user connected');

    socket.on('disconnect', () => {
        users = users.filter((user) => user.socketId !== socket.id);
      console.log('User disconnected');
    });

   //chat logic 
   socket.on("joinUser", (userId) => {
    console.log(userId)
    !users.some((user) => user.id === userId && user.socketId === socket.id) &&
      users.push({ id: userId, socketId: socket.id });
  });
      
  });
  

app.get("/",(req,res)=>{

    return res.json({msg:"IT"})
})

app.use("/api/v1/users", userRouter)
app.use("/api/v1/posts",postRouter)
app.use("/api/v1/comments",commentRouter)
app.use("/api/v1/likes",likeRouter)
app.use("/api/v1/follow",followRouter)
app.use("/api/v1/bookmarkPost",bookmarkRouter)
// initSocket(httpServer);
export {app,httpServer,io}