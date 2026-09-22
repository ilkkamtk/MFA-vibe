import app from './app';
import connectDB from './utils/db';

const port = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

void startServer();
