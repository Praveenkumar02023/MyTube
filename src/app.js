import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials : true
    }
))


//common middlewares
app.use(express.json({limit : "16kb"}));
app.use(express.urlencoded({extended:true , limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());


//import router
import healthCheckRouter from "./routes/healthCheck.routes.js";
import UserRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import likeRouter from "./routes/like.routes.js";

//use router
app.use("/api/v1/healthCheck",healthCheckRouter);
app.use("/api/v1/users",UserRouter);
app.use("/api/v1/videos/",videoRouter);
app.use("/api/v1/tweets",tweetRouter);
app.use("/api/v1/like",likeRouter);

export { app };