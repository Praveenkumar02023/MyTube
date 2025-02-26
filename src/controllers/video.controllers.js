import { asyncHandler } from '../utils/asyncHandler.js';
import { Video } from '../models/video.models.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadOnCloudinary, clearCloudinary } from '../utils/cloudinary.js';
import { getVideoDurationInSeconds } from "get-video-duration";
import { ApiResponse } from '../utils/ApiResponse.js';
import { get } from 'mongoose';
import { User } from '../models/user.models.js';

const publishVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.body;
    console.log("Received Request Body:", req.body);


    if (!videoId) {
        throw new ApiError(400, 'Please provide video ID');
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    if (video.isPublished) {
        throw new ApiError(400, 'Video already published');
    }

    if (video.owner.toString() !== req.user.id.toString()) {
        throw new ApiError(403, 'Unauthorized request');
    }

    video.isPublished = true;
    await video.save();  // ✅ Fix: Save the change

    return res.status(200).json(new ApiResponse(200, 'Video published successfully', video));
});

const uploadVideo = asyncHandler(async (req, res) => {
    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized request. Please login");
    }

    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, 'Please provide title and description');
    }

    const videoFilePath = req.files?.videoFile[0]?.path;
    if (!videoFilePath) {
        throw new ApiError(400, 'Please provide a video file');
    }

    const thumbnailFilePath = req.files?.thumbnail[0]?.path;
    if (!thumbnailFilePath) {
        throw new ApiError(400, 'Please provide a thumbnail');
    }

    try {
        const duration = await getVideoDurationInSeconds(videoFilePath);

        // Upload files to Cloudinary
        const videoFile = await uploadOnCloudinary(videoFilePath);
        const thumbnail = await uploadOnCloudinary(thumbnailFilePath);

        const newVideo = await Video.create({
            videoFile: {
                url: videoFile.url,
                public_id: videoFile.public_id
            },
            thumbnail: {
                url: thumbnail.url,
                public_id: thumbnail.public_id
            },
            owner: req.user._id,
            title,
            description,
            duration,
        });

        if (!newVideo) {
            throw new ApiError(500, 'Failed to upload video');
        }

        return res.status(201).json(new ApiResponse(201, 'Video uploaded successfully', newVideo));
    } catch (error) {
        console.error("Upload Error:", error);

        // Clean up failed uploads
        if (videoFile?.public_id) await clearCloudinary(videoFile.public_id, 'video');
        if (thumbnail?.public_id) await clearCloudinary(thumbnail.public_id, 'image');

        throw new ApiError(500, `Failed to upload video: ${error.message}`);
    }
});

const deleteVideo = asyncHandler(async (req, res) => {

    //get the video id from the request body
    //check if the video exists
    //check if the video belongs to the user
    //delete the video from cloudinary
    //delete the video from the database
    //return success response


    const {videoId} = req.body;

    if(!videoId){
        throw new ApiError(400, 'Please provide video ID');
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, 'Video not found');
    }

    if(video.owner.toString() !== req.user.id.toString()){
        throw new ApiError(403, 'Unauthorized request');
    }


    //delete the video from cloudinary
    await clearCloudinary(video.videoFile.public_id, 'video');
    await clearCloudinary(video.thumbnail.public_id, 'image');


    try {
        //delete the video from the database
        await video.deleteOne({_id : videoId});
    } catch (error) {
        console.error("Error deleting video from database:", error);
        throw new ApiError(500, 'Failed to delete video');
    }
   
    return res.status(200).json(new ApiResponse(200, 'Video deleted successfully'));
});


const getVideoById = asyncHandler(async (req, res) => {
    //get the video id from the request body
    //check if the video exists
    //check if the video is published
    //return the video

    const {videoId} = req.body;
    if(!videoId){
        throw new ApiError(400, 'Please provide video ID');
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, 'Video not found');
    }

    if(!video.isPublished){
        throw new ApiError(404, 'Video not Available');
    }
    
    return res.status(200).json(new ApiResponse(200, 'Video retrieved successfully', video));

});

const addToWatchHistory = asyncHandler(async (req, res) => {

    //get user and videoId from req.body and if video not exist in watchHistory then add it 
    //otherwise remove the previous and add to the end again.


    const user = await User.findById(req.user.id);
    
    if(!user){
        throw new ApiError(404, 'User not found');
    }

    const { videoId } = req.body;

    if (!videoId) {
        throw new ApiError(400, 'Please provide video ID');
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, 'Video not found');
    }


    //if not exist then add to watch history else remove previous and add to the end again.
    if (!user.watchHistory.includes(videoId)) {
        user.watchHistory.push(videoId);
    }else{
        user.watchHistory = user.watchHistory.filter(item => item !== videoId);
        user.watchHistory.push(videoId);
    }

    await user.save();

    return res.status(200).json(new ApiResponse(200, 'Video added to watch history successfully', user.watchHistory));
});

export { uploadVideo, publishVideo, deleteVideo ,getVideoById,addToWatchHistory};
