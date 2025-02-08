import {asyncHandler} from '../utils/asyncHandler.js';
import {Video} from '../models/video.models.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { getVideoDurationInSeconds } from "get-video-duration";
import {ApiResponse} from '../utils/ApiResponse.js';



const uploadVideo = asyncHandler(async (req, res) => {

      // Check if user is logged in
    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized request. Please login");
    }

    //get the title and description from the request body
    const {title,description} = req.body;

    //check if the title and description is provided
    if(!title || !description){
        throw new ApiError(400, 'Please provide title and description');
    }

    //get the video file from the request
    const videoFilePath = req.files?.videoFile[0]?.path;

   //check if the video file is provided
    if(!videoFilePath){
        throw new ApiError(400, 'Please provide video file');
    }

    //get the thumbnail from the request
    const thumbnailFilePath = req.files?.thumbnail[0]?.path;

    //check if the thumbnail is provided
    if(!thumbnailFilePath){
        throw new ApiError(400, 'Please provide thumbnail');
    }

    //get the duration of the video
    const duration = await getVideoDurationInSeconds(videoFilePath);
    
    //upload on cloudinary
    const videoFile = await uploadOnCloudinary(videoFilePath);
    const thumbnail = await uploadOnCloudinary(thumbnailFilePath);
    
   

    try {

        //create a new video
        const newVideo = await Video.create({
           videoFile : {
            url: videoFile.url,
            public_id: videoFile.public_id
            },
            thumbnail :{
            url: thumbnail.url, 
            public_id: thumbnail.public_id
            },
           owner : req.user._id,
           title,
           description,
           duration,
        });

        //check if video is created
        if(!newVideo){
            throw new ApiError(500, 'Failed to upload video');
        }

        //return the response
        return res.status(201).json(new ApiResponse(201, 'Video uploaded successfully', newVideo));

    } catch (error) {

        //delete from cloudinary
        await clearCloudinary(videoFile.public_id,'video');
        await clearCloudinary(thumbnail.public_id,'video');

        //throw error message.
        throw new ApiError(500, 'Failed to upload video Error: '+error.message);     
    }
});

export {uploadVideo};
