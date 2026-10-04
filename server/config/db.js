import mongoose from "mongoose";

export async function connectDB() {
    await mongoose.connect(process.env.MONGODB_URI, {
        family: 4
    });

    console.log("MongoDB connected");
}