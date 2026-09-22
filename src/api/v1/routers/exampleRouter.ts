import { Router } from 'express';
import { getExample } from '../controllers/exampleController';

const exampleRouter = Router();

exampleRouter.get('/', getExample);

export default exampleRouter;
