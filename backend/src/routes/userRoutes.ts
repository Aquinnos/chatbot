import { Router } from 'express';
import {
  createUser,
  loginUser,
  getProfile,
  updateProfile,
  deleteUser,
  updateApiKey,
} from '../controllers/userController';
import { auth } from '../middlewares/auth';
import { validateRegistration, validateLogin } from '../middlewares/validator';

const router = Router();

// User registration and login routes
router.post('/users', validateRegistration, createUser);
router.post('/login', validateLogin, loginUser);

// Protected routes for user profile management
router.put('/users', auth, updateProfile);
router.delete('/users', auth, deleteUser);

// Get user profile and update API key
router.get('/users', auth, getProfile);
router.put('/api-key', auth, updateApiKey);

export default router;
