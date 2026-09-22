import { Router } from 'express';
import mfaRouter from './routers/mfaRouter';

const router = Router();

router.use('/auth', mfaRouter);

export default router;
