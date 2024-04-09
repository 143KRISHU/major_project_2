import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB = async () => {
    try{
       const connectionInstnace = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log("database is connected",connectionInstnace.connection.host);
    } catch(error){
        console.log("MONOGODB connection Failed ",error);
        process.exit(1)
    }
}
export default connectDB