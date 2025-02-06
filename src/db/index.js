import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`Connected to database :) \n DataBase Host : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("Error connecting to database :(", error.message);
    }
};

export default connectDB;