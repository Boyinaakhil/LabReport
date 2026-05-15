import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/labreports');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.warn('Backend is running without MongoDB (Bookmarks and specific persistence features will fail). Please provide a valid MONGO_URI.');
    // process.exit(1); // Do not crash the server
  }
};
