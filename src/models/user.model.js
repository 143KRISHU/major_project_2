import mongoose ,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config({
    path:'.env'
})
const userSchema  = new Schema ({
    userName:{
        type:String,
        required : true,
        unique:true,
        lowercase : true,
        trim:true,
        index:true, // to enhance the searchability
    },
    email:{
        type:String,
        required : true,
        unique:true,
        lowercase : true,
        trim:true,
    },
    fullName:{
        type:String,
        required : true,
        lowercase : true,
        trim:true,
        index:true, // to enhance the searchability
    },
    avatar : {
        type : String, //cloudinary url
        required:true,
    },
    coverImage:{
        type:String,
    },
    watchHistory:[
       {    
            type: Schema.Types.ObjectId,
            ref:"Video",
        }
    ],
    password:{
        type:String,
        required:[true,"Password iss required"],
    },
    refreshToken:{
        type:String
    }
},
{
    timestamps:true,
})

//Hooks
userSchema.pre("save",async function (next) {

    //paswword only be encrypt if it is modifies or stores first time

    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10);
    console.log(this.password);
    next()
})

//Custom Methods
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password); 
}

// Access Token generator
userSchema.methods.generateAccessToken = function(){
   return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            userName:this.userName,
            fullName:this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema);