import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import dotenv from "dotenv"
import {ApiResponse} from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.models.js";

dotenv.config(
  {
     path:"./src/.env"
  }
)

const createAndPostTweet = asyncHandler(async (req,res)=>{

    //check if user is loggedIn and then check if text is present in req.body
    //if yes then create a new Tweet object with user as owner and text as tweet message.
    //else throw error accordingly.

    const user = await User.findById(req.user.id);
    if(!user){
        throw new ApiError("Please login to post tweet!!");
    }

    const content = req.body.text;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Empty tweet");
    }

    const newTweet = new Tweet({owner : user._id,content});
    await newTweet.save();

    return res.status(200).json(new ApiResponse(200,"Tweet posted successfully",newTweet));
});

const deleteTweet = asyncHandler(async (req,res)=>{
    //check if user is loggedIn and then check if tweetId is present in req.body
    //if yes then check if owner of tweet is same as user who is loggedIn
    //if yes then delete the tweet and return success message
    //else throw error accordingly.

    const user = await User.findById(req.user.id);
    if(!user){
        throw new ApiError("Please login to delete tweet!!");
    }

    const tweetId = req.body.tweetId;
    if(!tweetId){
        throw new ApiError(400,"Please provide tweetId to delete tweet!!");
    }

    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(400,"Tweet not found!!");
    }

    if(tweet.owner.toString() !== user._id.toString()){
        throw new ApiError(401,"You are not authorized to delete this tweet!!");
    }

    await tweet.deleteOne();

    return res.status(200).json(new ApiResponse(200,"Tweet deleted successfully"));
});

const editTweet = asyncHandler(async (req,res)=>{
    //check if user is LoggedIn and then check if tweetId and text is present in req.body
    //if yes then check if owner of tweet is same as user who is loggedIn
    //if yes then update the tweet and return success message   
    //else throw error accordingly.

    const user = await User.findById(req.user.id);
    if(!user){
        throw new ApiError("Please login to edit tweet!!");
    }

    const tweetId = req.body.tweetId;
    const content = req.body.text; 

    if(!tweetId || !content || content.trim() === ""){
        throw new ApiError(400,"Please provide tweetId and text to edit tweet!!");
    }

    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(400,"Tweet not found!!");
    }

    if(tweet.owner.toString() !== user._id.toString()){
        throw new ApiError(401,"You are not authorized to edit this tweet!!");
    }

    tweet.content = content;
    await tweet.save();

    return res.status(200).json(new ApiResponse(200,"Tweet edited successfully",tweet));
});

export {
    createAndPostTweet,deleteTweet,editTweet
}

