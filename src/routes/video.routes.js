import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { uploadVideo } from "../controllers/video.controllers.js";

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


export default router;
