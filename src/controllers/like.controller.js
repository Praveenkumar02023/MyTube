import {Like} from "../models/like.models.js";
import {Comment} from "../models/comment.models.js";
import {Video} from "../models/video.models.js";
import {Tweet} from "../models/tweet.models.js";
import {User} from "../models/user.models.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const likeVideo = asyncHandler(async (req,res)=>{
    //get user and videoId from req.body
    //check if user is loggedIn and then check if videoId is present in req.body
    //if yes then create a new Like object with user as likedBy and video as video id.
    //else throw error accordingly.

    const user = await User.findById(req.user.id);
    if(!user){
        throw new ApiError("Please login to like video!!");
    }

    const videoId = req.body.videoId;
    if(!videoId){
        throw new ApiError(400,"Please provide videoId to like video!!");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"Video not found!!");
    }

    const newLike = new Like({video : video._id, likedBy : user._id});
    await newLike.save();

    return res.status(200).json(new ApiResponse(200,"Video liked successfully",newLike));
});



const likeComment = asyncHandler(async (req,res)=>{
    //get user and commentId from req.body and check if user is loggedIn
    //if yes then check if commentId is present in req.body and then check if comment is present in database
    //if yes then create a new Like object with user as likedBy and comment as comment id.
    //else throw error accordingly.

    const user = await User.findById(req.user.id);
    if(!user){
        throw new ApiError("Please login to like comment!!");
    }

    const commentId = req.body.commentId;
    if(!commentId){
        throw new ApiError(400,"Please provide commentId to like comment!!");
    }

    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(400,"Comment not found!!");
    }

    const newLike = new Like({comment : comment._id, likedBy : user._id});
    await newLike.save();       

    return res.status(200).json(new ApiResponse(200,"Comment liked successfully",newLike));

});

const likeTweet = asyncHandler(async (req,res)=>{
    //get user and tweetId from req.body and check if user is loggedIn
    //if yes then check if tweetId is present in req.body and then check if tweet is present in database
    //if yes then create a new Like object with user as likedBy and tweet as tweet id.
    //else throw error accordingly.

    const user = await User.findById(req.user.id);
    if(!user){
        throw new ApiError("Please login to like tweet!!");
    }

    const tweetId = req.body.tweetId;
    if(!tweetId){
        throw new ApiError(400,"Please provide tweetId to like tweet!!");
    }

    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(400,"Tweet not found!!");
    }

    const newLike = new Like({tweet : tweet._id, likedBy : user._id});
    await newLike.save();

    return res.status(200).json(new ApiResponse(200,"Tweet liked successfully",newLike));

});

export {
    likeVideo,
    likeComment,
    likeTweet
};