import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import chatRoutes from './routes/chatRoutes';
import offlineResponseRoutes from './routes/offlineResponseRoutes';

dotenv.config();

const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  exposedHeaders: ['Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not defined in the environment variables');
}

app.use('/api', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/offline-responses', offlineResponseRoutes);

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MongoDB URI is not defined in the environment variables');
  process.exit(1);
}

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
