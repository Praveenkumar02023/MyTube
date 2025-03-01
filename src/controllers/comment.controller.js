import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import {Comment} from '../models/comment.models.js'
import {User} from '../models/user.models.js'
import {Video} from '../models/video.models.js'
import {Tweet} from '../models/tweet.models.js'

const videoComment = asyncHandler(async (req,res) =>{
    //get user , videoId and text from req body and validate them.
    //if correct add new comment else throw error accordingly.

    const user = await User.findById(req.user.id);
    if(!user){
        throw new ApiError("Login to comment on the video!!");
    }

    const videoId = req.body.videoId;
    if(!videoId){
        throw new ApiError("VideoId is Required!!");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError("User Not found");
    }

    const content = req.body.text;
    if(!content || content.trim() === ""){
        throw new ApiError("Enter comment!!");
    }

    const newComment = new Comment({content: content,video:video._id,owner:user._id});
    await newComment.save();

    return res.status(200).json(new ApiResponse(200,"Comment done :)",newComment));
});

const tweetComment = asyncHandler(async (req,res) =>{

    const user = await User.findById(req.user.id);
    if(!user){
        throw new ApiError("Login to comment on the video!!");
    }

    const tweetId = req.body.tweetId;
    if(!tweetId){
        throw new ApiError("TweetId is Required!!");
    }

    const tweet = await Tweet.findById
    if(!tweet){
        throw new ApiError("User Not found");
    }

    const content = req.body.text;
    if(!content || content.trim() === ""){
        throw new ApiError("Enter comment!!");
    }

    const newComment = new Comment({content: content,tweet:tweet._id,owner:user._id});
    await newComment.save();

    return res.status(200).json(new ApiResponse(200,"Comment done :)",newComment));

});

const replyComment = asyncHandler(async (req,res) =>{
    const user  = await User.findById(req.user.id);
    if(!user){
        throw new ApiError("Login to comment on the video!!");
    }

    const commentId = req.body.commentId;
    if(!commentId){
        throw new ApiError("CommentId is Required!!");
    }

    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError("Comment Not found");
    }

    const content = req.body.text;
    if(!content || content.trim() === ""){
        throw new ApiError("Enter comment!!");
    }   

    const newComment = new Comment({content: content,comment:comment._id,owner:user._id});
    await newComment.save();   

    return res.status(200).json(new ApiResponse(200,"Comment done :)",newComment));
});




export{
    videoComment,tweetComment,replyComment
};