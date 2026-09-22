import { Router } from 'express';
import mfaRouter from './routers/mfaRouter';
import exampleRouter from './routers/exampleRouter';

const router = Router();

router.use('/', exampleRouter);
router.use('/mfa', mfaRouter);

export default router;
