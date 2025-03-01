import { Router } from "express";
import * as commentController from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();

//routes

router.route('/video-comment').post(verifyJWT,commentController.videoComment);
router.route('/tweet-comment').post(verifyJWT,commentController.tweetComment);
router.route('/reply-comment').post(verifyJWT,commentController.replyComment);

export default router;