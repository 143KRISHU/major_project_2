import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // For aggreration Query
const videoScema = new Schema(
    {
        vidieFile:{
            type:String, //cloudinary url
            required:true,
        },
        thumbnail:{
            type:String, 
            require:true
        },
        title:{
            type:String, 
            require:true
        },
        duration:{
            type:Number, 
            require:true
        },
        views:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    },
    {timestamps:true,}
)
mongoose.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video",videoScema)