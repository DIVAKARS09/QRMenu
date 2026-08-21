import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { authRouter } from './server/routes/authRoutes';
import { shopRouter } from './server/routes/shopRoutes';
import { categoryRouter } from './server/routes/categoryRoutes';
import { foodRouter } from './server/routes/foodRoutes';
import { orderRouter } from './server/routes/orderRoutes';
import { qrRouter } from './server/routes/qrRoutes';
import { seedRouter } from './server/routes/seedRoutes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON body parser & urlencoded parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'ScanMenu API', timestamp: new Date().toISOString() });
  });

  // Mount API endpoints
  app.use('/api/auth', authRouter);
  app.use('/api/shops', shopRouter);
  app.use('/api/categories', categoryRouter);
  app.use('/api/foods', foodRouter);
  app.use('/api/orders', orderRouter);
  app.use('/api/qr', qrRouter);
  app.use('/api/seed', seedRouter);

  // Development vs Production static/Vite serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScanMenu server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
