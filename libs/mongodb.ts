import mongoose from "mongoose";
const { DATABASE_URL } = process.env;
export const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(DATABASE_URL as string);
    if (connection.readyState === 1) {
      return Promise.resolve(true);
    }
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};