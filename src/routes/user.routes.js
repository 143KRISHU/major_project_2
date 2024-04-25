import { Router } from "express";
import  {registerUser , userLogin, userLogout}  from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"


const userRouter = Router()


userRouter.route("/register").post(
      upload.fields([
            {
                  name : "avatar",
                  maxCounts : 1
            }, 
            {
                  name : "coverImage",
                  maxCount: 1
            }
      ]),
      registerUser);

userRouter.route("/login").post(userLogin);


//secured route
userRouter.route("/logout").post(verifyJWT, userLogout)

export default userRouter;