import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary, clearCloudinary } from "../utils/cloudinary.js";
import dotenv from "dotenv"
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


dotenv.config(
  {
     path:"./src/.env"
  }
)


const generateAccessAndRefreshToken = async (userId)=>{
  try {
    const user = await User.findById(userId);

  if(!user){
    throw new ApiError(401,"User not found :(");
  }

  //generate access and refresh token
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken
  await user.save({validateBeforeSave : false});

  return {accessToken,refreshToken};
  } catch (error) {
    throw new ApiError(407,"Error generating access and refresh token :(");
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  // Validation
  if ([fullName, email, username, password].some(field => field.trim() === "")) {
    throw new ApiError(400, "All fields are required!!");
  }

  // Check for existing user
  const userExist = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (userExist) {
    throw new ApiError(409, "User already exists with username or email!!");
  }

  // Handle file uploads
  const files = req.files;
  if (!files || !files.avatar || !files.coverImage) {
    throw new ApiError(400, "Avatar and cover image are required!!");
  }

  const avatarLocalPath = files.avatar[0].path;
  const coverImageLocalPath = files.coverImage[0].path;

  // Upload on Cloudinary
  const avatarImage = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);


  try {
    // Create new user
   
    const newUser = await User.create({
      fullName,
      email,
      username,
      password,
      avatar: {
        url : avatarImage.url,
        public_id : avatarImage.public_id
      },
      coverImage: {
        url : coverImage.url,
        public_id : coverImage.public_id
      }
    });

    // Check if user registered successfully
    const isUserRegistered = await User.findById(newUser._id).select("-password -refreshToken");

    if (!isUserRegistered) {
      throw new ApiError(500, "Something went wrong :(");
    }

    res.status(201).json(new ApiResponse(200, "User Registered!!"));
  } catch (error) {
    console.log("Error Registering User :(", error);

    // Log public IDs
    console.log("Public IDs to delete:", publicIds);

    // Clear uploaded files from Cloudinary
    const publicIds = [avatarImage.public_id, coverImage.public_id];
    await clearCloudinary(publicIds);

    throw new ApiError(500, "Failed to register user");
  }
});

const loginUser = asyncHandler(async (req,res)=>{

  const{email,username,password} = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required!!");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }]
  });

  if(!user){
    throw new ApiError(401,"User not found :(");
  }

  //user found now validate password

  const isPasswordCorrect = await user.isPasswordCorrect(password,user.password);

  if(!isPasswordCorrect){
    throw new ApiError(403,"Incorrect Credentials :(");
  }

  const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  if(!loggedInUser){
    throw new ApiError(404,"Login Error");
  }  

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  };

  return res.status(200)
  .cookie("refreshToken", refreshToken, options)  // Store only refreshToken in cookies
  .json(new ApiResponse(200, { user: loggedInUser, accessToken }, "User logged in successfully :)"));

});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    // 1️⃣ Get the refresh token from cookies or body
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    console.log("🔹 Incoming Refresh Token:", incomingRefreshToken);

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized: No refresh token provided.");
    }

    // 2️⃣ Verify the refresh token
    let decodedToken;
    try {
      decodedToken = jwt.verify(incomingRefreshToken, process.env.USER_REFRESH_TOKEN);
      console.log("🔹 Decoded Token:", decodedToken);
    } catch (error) {
      throw new ApiError(403, "Forbidden: Invalid refresh token.");
    }

    // 3️⃣ Find the user in the database
    const user = await User.findById(decodedToken.id);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    // 4️⃣ Check if the refresh token matches the one stored in the database
    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(403, "Unauthorized: Token mismatch.");
    }

    // 5️⃣ Generate new access and refresh tokens
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    // 6️⃣ Update the user's refresh token in the database
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    // 7️⃣ Set the new refresh token as an HTTP-only cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };

    res.status(200)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(new ApiResponse(200, { accessToken }, "Access token refreshed successfully."));

  } catch (error) {
    console.error("🔹 Refresh Token Error:", error.message);
    throw new ApiError(401, `Failed to refresh access token: ${error.message}`);
  }
});




const logoutUser = asyncHandler(async (req,res)=>{
 
  try {
     //get the user from the request
  const user = req.user;

  if(!user){
    throw new ApiError(401,"Unauthorized :(");
  }

  //clear the refresh token from the user details
  await User.findByIdAndUpdate(user._id,
    {
      $set:{
        refreshToken:null
      }
    }
  );

  //options
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  //clear the cookies
  res.status(200)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{accessToken},"User logged out successfully :)"));
    
  } catch (error) {
    throw new ApiError(401,`Error logging out User :( ${error.message}`);
  }
});

const updateCurrentPassword = asyncHandler(async (req,res)=>{
  try {
    //take old and new password from the request
    const {oldPassword,newPassword} = req.body;
  //check if old and new password are present
  if(!oldPassword || !newPassword){
    throw new ApiError(400,"Old password and new password are required :(");
  }
  //get user from the request
  const user = await User.findById(req.user._id);
  //check if user is present
  if(!user){
    throw new ApiError(404,"User not found :(");
  }
 //check if the old password is correct
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if(!isPasswordValid){
    throw new ApiError(403,"Incorrect Password :(");
  }
  //change the password
  user.password = newPassword;
  //save the changes
  await user.save({validateBeforeSave:false});
  //send the response
  return res.status(200)
     .json(new ApiResponse(200,{},"Password updated successfully :)")); 
  } catch (error) {
    throw new ApiError(400,`Error updating password :( ${error.message}`);
  }

});

const getCurrentUser = asyncHandler(async (req,res)=>{
 
    //return the user from the request
    return res.status(200)
              .json(new ApiResponse(200,req.user,"User found successfully :)"));

});

const updateUserDetails = asyncHandler(async (req,res)=>{
  //get details from request
  const {fullname , email} = req.body;
  //check if fullname and email are present
  if(!fullname || !email){
    throw new ApiError(400,"Fullname and email are required :(");
  }
  //get user from the request
  const user = req.user;
  //check if user is present
  if(!user){
    throw new ApiError(404,"User not found :(");
  }

  //update the user details and get the user
 const updatedUser =  await User.findByIdAndUpdate(user._id,{
    $set:{
      fullname,
      email
    }
  },
  {new:true}
).select("-password -refreshToken");
//send the response
  return res.status(200)
            .json(new ApiResponse(200,updatedUser,"User details updated successfully :)"));
});

const updateUserAvatar = asyncHandler(async (req,res)=>{

  //get the filepath for avatar image.

  const avatarLocalPath = req.file?.path;

  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar image is required :(");
  }

  //delete the previous avatar image from cloudinary
  if(req.user.avatar){
    await clearCloudinary([req.user.avatar.public_id],"image");
  }

  //upload the avatar image on cloudinary
 const avatarResponse = await uploadOnCloudinary(avatarLocalPath);

 //update the user avatar detail

 const updatedUser = await User.findByIdAndUpdate(req.user._id,{
   $set:{
      url:avatarResponse.url,
      public_id:avatarResponse.public_id
   }
 },{new:true}).select("-password -refreshToken");

  //send the response
  return res.status(200)
            .json(new ApiResponse(200,updatedUser,"User avatar updated successfully :)"));
});

const updateUserCoverImage = asyncHandler(async (req,res)=>{

  
  //get the filepath for cover image.

  const coverImageLocalPath = req.file?.path;

  if(!coverImageLocalPath){
    throw new ApiError(400,"cover image is required :(");
  }
  //delete the previous cover image from cloudinary
  if(req.user.coverImage){
    await clearCloudinary([req.user.coverImage.public_id],"image");
  }

  //upload the cover image on cloudinary
 const coverImageResponse = await uploadOnCloudinary(coverImageLocalPath);

  //check if response is valid

  if(!coverImageResponse){
    throw new ApiError(401,"Error uploading image on cloudinary.");
  }

 //update the user coverImage detail

 const updatedUser = await User.findByIdAndUpdate(req.user._id,{
   $set:{
     coverImage:{
        url:coverImageResponse.url,
        public_id:coverImageResponse.public_id
     }
   }
 },{new:true}).select("-password -refreshToken");

  //send the response
  return res.status(200)
            .json(new ApiResponse(200,updatedUser,"User coverImage updated successfully :)"));

});




export { registerUser,loginUser,refreshAccessToken,logoutUser,updateCurrentPassword,getCurrentUser,updateUserDetails,updateUserAvatar,updateUserCoverImage };