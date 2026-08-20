import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on('connected', () => console.log("Mongo connected"))

    await mongoose.connect(`${process.env.MONGODB_URI}/alphax`)
}

export default connectDB