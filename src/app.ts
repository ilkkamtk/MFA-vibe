import express from 'express';
import v1Router from './api/v1';
import { configureMiddleware } from './middleware';

const app = express();

configureMiddleware(app);
app.use('/api/v1', v1Router);

export default app;
