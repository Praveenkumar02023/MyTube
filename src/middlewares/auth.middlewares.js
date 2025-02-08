import {User} from '../models/user.models.js';
import {ApiError} from '../utils/ApiError.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(
    {
        path:"./src/.env"
    }
);

export const verifyJWT = asyncHandler(async (req,_,next)=>{

    //get the access token from the request
    const incomingAccessToken = req.cookies.accessToken || req.header('Authorization')?.replace('Bearer ','');


    //check if the access token is present
    if(!incomingAccessToken){
        return next(new ApiError(401,'Access Denied'));
    }

    try {
        //decode the access token
        const decodedToken = jwt.verify(incomingAccessToken,process.env.USER_ACCESS_TOKEN);

        //get the user from access token
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");

        if(!user){
            return next(new ApiError(401,'Invalid Access Token'));
        }


        //attach the user to the request object
        req.user = user;


        //move forward to the next middleware
        next();

        
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token"); 
    }
});