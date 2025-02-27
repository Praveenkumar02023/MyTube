import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { createAndPostTweet, deleteTweet,editTweet} from "../controllers/tweet.controller.js";

const router = Router();

//routes
router.route('/create-and-post-tweet').post(verifyJWT,createAndPostTweet);
router.route('/delete-tweet').post(verifyJWT,deleteTweet);  
router.route('/edit-tweet').post(verifyJWT,editTweet);

export default router;