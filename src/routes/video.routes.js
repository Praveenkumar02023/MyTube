import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { deleteVideo, publishVideo, uploadVideo ,getVideoById,addToWatchHistory } from "../controllers/video.controllers.js";


const router = Router();

//routes
router.route('/upload-video').post(upload.fields([
    {
        name:"videoFile",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
]),verifyJWT,uploadVideo);

router.route('/publish-video').post(verifyJWT,publishVideo);
router.route('/delete-video').post(verifyJWT,deleteVideo);
router.route('/get-video-by-id').post(getVideoById);
router.route('/add-to-watch-history').post(verifyJWT,addToWatchHistory);


export default router;
