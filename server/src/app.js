import express from 'express';
import cors from 'cors';
import systemRoutes from './routes/system.routes.js';
import fileRoutes from './routes/file.routes.js';
import discoveryRoutes from './routes/discovery.routes.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

export function createApp() {
  const app = express();

  // CORS middleware - allow requests from any LAN client or web UI
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api', systemRoutes);
  app.use('/api/files', fileRoutes);
  app.use('/api/devices', discoveryRoutes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
