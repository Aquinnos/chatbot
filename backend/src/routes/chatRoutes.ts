import { Router } from 'express';
import {
  createChat,
  getUserChats,
  getChatById,
  addMessageToChat,
  deleteChat,
} from '../controllers/chatController';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/', auth, createChat);
router.get('/', auth, getUserChats);
router.get('/:id', auth, getChatById);
router.post('/:id/messages', auth, addMessageToChat);
router.delete('/:id', auth, deleteChat);

export default router;
