import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uplaodOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res, next) => {
      // get user detail from frontend
      // validation - not empty data
      // check if user already exist : with the help of username or email
      // check for the images, check for the avtar
      // upload them to cloudinary, avtar
      // create user Object -  create entry in db
      // remove password and refresh token field from response
      // check user creation
      // return res 

      const { fullname, username, email, password } = req.body;

      if (fullname === "") {
            throw new ApiError(400, "FullName is required");
      }

      // another method to check empty
      if (
            [username, email, password].some((field) => field?.trim() === "")
      ) {
            throw new ApiError(400, "all fields are required");
      }

      // check for the valid email
      if (!(email.includes("@") && email.includes(".com"))) {
            throw new ApiError(400, "Enter the valid Email");
      }
      
      const registeredUser = await User.findOne({ $or: [{ userName: username }, { email: email }] })
      if (registeredUser) {
            throw new ApiError(409, "Username or Email is Already Exist")
      }

      // As express give the access of req.body simillary multer give the access of req.files
      const avatarLoaclPath = await req.files?.avatar[0].path;
      const coverImageLoaclPath = await req.files?.coverImage[0].path;
      if (!avatarLoaclPath) {
            throw new ApiError(400, "Avatar file is required");
      }

      const avatarCloudinaryResponseURL = await uplaodOnCloudinary(avatarLoaclPath);
      const coverImageCloudinaryResponseURL = await uplaodOnCloudinary(coverImageLoaclPath);

      if (!avatarCloudinaryResponseURL) {
            throw new ApiError(400, "Avatar is required")
      }

      const user = await User.create({
            fullName: fullname,
            email: email,
            avatar: avatarCloudinaryResponseURL.url,
            coverImage: coverImageCloudinaryResponseURL ? coverImageCloudinaryResponseURL.url : "",
            userName: `${username.toLowerCase()}`,
            password: password
      })

      const createdUser = await User.findById(user._id).select(" -password -refreshToken");

      if (!createdUser) {
            throw new ApiError(500, "Something went Wrong while registering User");
      }

      return res.status(201).json(
            new ApiResponse(200, createdUser, "User registerd Successfully")
      )
});

export default registerUser;