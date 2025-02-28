import { Router } from "express";
import { likeComment,likeVideo,likeTweet } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

//routes
router.route('/like-video').post(verifyJWT,likeVideo);
router.route('/like-comment').post(verifyJWT,likeComment);
router.route('/like-tweet').post(verifyJWT,likeTweet);  

export default router;