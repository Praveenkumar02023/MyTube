import { User } from '../models/user.models.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({
    path: "./src/.env"
});

export const verifyJWT = asyncHandler(async (req, _, next) => {
    // Log the token sources
    console.log("🔹 Cookies:", req.cookies);
    console.log("🔹 Authorization Header:", req.header('Authorization'));

    // Extract the token
    const incomingAccessToken = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
    
    // Log the extracted token
    console.log("🔹 Extracted Token:", incomingAccessToken);

    // Check if token exists
    if (!incomingAccessToken) {
        return next(new ApiError(401, 'Access Denied: No Token Provided'));
    }

    try {
        // Decode the token
        const decodedToken = jwt.verify(incomingAccessToken, process.env.USER_ACCESS_TOKEN);
        console.log("🔹 Decoded Token:", decodedToken.id);

        // Fetch user
        const user = await User.findById(decodedToken.id).select("-password -refreshToken");

        if (!user) {
            return next(new ApiError(401, 'Access Denied: Invalid User'));
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.error("🔹 JWT Verification Error:", error.message);
        return next(new ApiError(401, "Access Denied: Invalid Token"));
    }
});