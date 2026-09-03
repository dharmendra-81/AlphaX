import mongoose from "mongoose";

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    mongoose.connection.on('connected', () => console.log("Mongo connected"));

    let uri = process.env.MONGODB_URI;
    if (uri && !uri.includes('alphax') && !uri.includes('?')) {
        uri = `${uri.replace(/\/$/, '')}/alphax`;
    }
    await mongoose.connect(uri || process.env.MONGODB_URI);
}

export default connectDB;