import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/labreports';
    const maskedUri = uri.replace(/\/\/.*@/, '//****:****@'); // Hide credentials in logs
    console.log(`📡 Attempting to connect to: ${maskedUri}`);

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn('Backend is running without MongoDB (Bookmarks and specific persistence features will fail).');
  }
};
