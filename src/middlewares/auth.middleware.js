import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
      try {
            const token = req.cookies?.accessToken ||
                  req.header("Authorizarion")?.replace("Bearer ", "");

            if (!token) {
                  throw new ApiError(401, "Unauthorized Request");
            }

            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

            if (!user) {
                  throw new ApiError(401, "Invalid Access Token");
            }

            req.user = user;
            next()
      } catch (error) {
            throw new ApiError(401, error?.message || "invalid access user");
      }
})