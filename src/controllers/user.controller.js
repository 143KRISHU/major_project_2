import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uplaodOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
      try {
            const user = await User.findById( userId );
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();
            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false });

            return { accessToken, refreshToken };
      } catch (error) {
            throw new ApiError(500, `Token generation error : ${error}`);
      }
}

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
      let coverImageLoaclPath
      if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLoaclPath = await req.files?.coverImage[0].path;
      }

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
            coverImage: coverImageCloudinaryResponseURL !== "File Path is Not Found"
                  ? coverImageCloudinaryResponseURL.url : "",
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

const userLogin = asyncHandler(async (req, res, next) => {
      // extract user email and password from reqq body
      // validate the email and password from the data base
      // get the access token and  refresh token.
      // send the tokens in secure cookies

      let { email, password, username } = req.body;
      if (username === "" && email === "") {
            throw new ApiError(400, "Enter Either Username or Email yo proceed login ");
      }
           const userFound = await User.findOne({ $or: [{ email: email }, { userName: username }] });

      if (!userFound && username !== "") {
            throw new ApiError(404, `${username} doesn't exist`);
      }
      if (!userFound && email !== "") {
            throw new ApiError(404, `User of this email : ${email} doesn't exist`);
      }
      if (!password) {
            throw new ApiError(400, "Enter the password");
      }

      const isPasswordValid = userFound.isPasswordCorrect(password)

      if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials");
      }

      // generating access and refresh Token
      const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(userFound._id);

      const userLoggedIn = await User.findById(userFound._id)
      .select("-password -refreshToken ");
      // Setting up the cookie

      const options = {
            httpOnly: true,
            secure: true
      }

      return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(
                  200,
                  {
                        user: {
                              user: userLoggedIn,
                              refreshToken: refreshToken,
                              accessToken: accessToken
                        }
                  },
                  "User logged In"
            ))
})

const userLogout = asyncHandler(async (req, res) => {
     await User.findOneAndUpdate(req.user._id,

            {
                  $set: {
                        refreshToken: undefined
                  }
            },
            {
                  new: true
            }
      );

      const options = {
            httpOnly: true,
            secure: true
      }

      return res
      .status(200)
      .clearCookie("accessToken",options)
      .clearCookie("refreshToken",options)
      .json(
            200,{},
            message = "User Logged Out SuccessFully"
      )
});

export {
      registerUser,
      userLogin,
      userLogout
};
