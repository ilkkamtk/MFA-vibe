import { Router } from 'express';
import {
  generateMfaSecret,
  registerUser,
  verifyMfaCode,
} from '../controllers/mfaController';

const mfaRouter = Router();

mfaRouter.post('/secret', generateMfaSecret);
mfaRouter.post('/register', registerUser);
mfaRouter.post('/verify', verifyMfaCode);

export default mfaRouter;
