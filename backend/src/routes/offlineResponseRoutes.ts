import { Router } from 'express';
import {
  saveOfflineResponse,
  getOfflineResponses,
  findMatchingResponse,
  deleteOfflineResponse,
} from '../controllers/offlineResponseController';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/', auth, saveOfflineResponse);
router.get('/', auth, getOfflineResponses);
router.post('/match', auth, findMatchingResponse);
router.delete('/:id', auth, deleteOfflineResponse);

export default router;
