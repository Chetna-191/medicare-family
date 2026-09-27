import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import membersRoutes from './routes/members.routes.js';
import medicinesRoutes from './routes/medicines.routes.js';
import scheduleRoutes from './routes/schedule.routes.js';
import adherenceRoutes from './routes/adherence.routes.js';
import { ensureDemoUserExists } from './services/seedService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure demo user exists on boot
ensureDemoUserExists().catch(console.error);

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'MediCare Family API',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/medicines', medicinesRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/adherence', adherenceRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MediCare Family server running on http://localhost:${PORT}`);
});
