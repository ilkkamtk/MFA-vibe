import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const dbUrl = process.env.DB_URL;

  if (!dbUrl) {
    throw new Error('DB_URL is not defined');
  }

  await mongoose.connect(dbUrl);
  console.log('Database connected');
};

export default connectDB;
