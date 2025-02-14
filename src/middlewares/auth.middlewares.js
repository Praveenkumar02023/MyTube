import { User } from '../models/user.models.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({
    path: "./src/.env"
});

export const verifyJWT = asyncHandler(async (req, _, next) => {
    // 1️⃣ Extract the Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new ApiError(401, 'Access Denied: Missing or Malformed Token'));
    }

    // 2️⃣ Extract the JWT token
    const token = authHeader.split(' ')[1];

    try {
        // 3️⃣ Verify the JWT token
        const decodedToken = jwt.verify(token, process.env.USER_ACCESS_TOKEN);

        if (!decodedToken?.id) {
            return next(new ApiError(401, 'Access Denied: Invalid Token Payload'));
        }

        // 4️⃣ Fetch the user from DB (excluding password & refreshToken)
        const user = await User.findById(decodedToken.id).select('-password -refreshToken');

        if (!user) {
            return next(new ApiError(401, 'Access Denied: User Not Found'));
        }

        // 5️⃣ Attach the user object to the request
        req.user = user;
        next();
    } catch (error) {
        console.error("🔹 JWT Verification Error:", error.message);

        if (error.name === "TokenExpiredError") {
            return next(new ApiError(401, "Access Denied: Token Expired"));
        }

        return next(new ApiError(401, "Access Denied: Invalid Token"));
    }
});
