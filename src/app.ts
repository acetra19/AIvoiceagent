import express from 'express';
import routes from './api/routes';
import { requestLogger, errorHandler, notFoundHandler } from './api/middleware';

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

app.use(routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
