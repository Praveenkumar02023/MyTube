import { Router } from "express";
import {registerUser,loginUser, logoutUser, refreshAccessToken, userWatchHistory} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();


//routes
router.route('/register').post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]),registerUser);

router.route('/login').post(loginUser);

//secure routes
router.route('/logout').post(verifyJWT,logoutUser);
router.route('/refresh-access-token').post(refreshAccessToken);
router.route('/watch-history').get(verifyJWT,userWatchHistory);

export default router;