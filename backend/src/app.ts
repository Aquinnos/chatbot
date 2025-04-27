import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/api', userRoutes);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chatbot';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
