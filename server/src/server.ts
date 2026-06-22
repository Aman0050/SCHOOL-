import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import apiRouter from './routes';
import { resolveTenant } from './middlewares/tenantResolver';
import { errorHandler } from './middlewares/errorHandler';
import http from 'http';
import { register } from './lib/metrics';
import { logger } from './lib/logger';
import { initSocket } from './lib/socketManager';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security configuration for CORS
const allowedOrigins = [
  'http://localhost:5173',          // Vite default port
  'http://localhost:5174',          // Vite fallback port
  'http://greenwood.localhost:5173', // Greenwood high dev domain
  'http://oakridge.localhost:5173'  // Oakridge academy dev domain
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      
      // Dynamic matching to support school subdomains
      const isAllowed = allowedOrigins.includes(origin) || 
                        /^[a-zA-Z0-9-]+\.localhost:(5173|5174)$/.test(new URL(origin).host);
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS policy'));
      }
    },
    credentials: true,
  })
);

app.use(compression());
app.use(express.json());
app.use(cookieParser());

// Trust proxy for secure cookies behind reverse proxies (like NGINX/ALB)
app.set('trust proxy', 1);

// Security Hardening: Helmet
// Disables x-powered-by, enables HSTS, adds XSS protection headers, etc.
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Security Hardening: Rate Limiting
// Prevents brute force attacks and DDoS on the application layer
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use('/api', globalLimiter);

// --- Observability Endpoints ---
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Custom Middleware: Resolves Tenant based on host or headers
app.use(resolveTenant);

// API Routes
app.use('/api', apiRouter);

// Global Error Handler Middleware
app.use(errorHandler);

// Create HTTP server
const httpServer = http.createServer(app);

// Setup Socket.IO
const io = initSocket(httpServer);

// Attach io to req so controllers can emit events
app.use((req, res, next) => {
  (req as any).io = io;
  next();
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🏫 School SaaS API Server Running on Port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`⚡ WebSocket Server Initialized`);
  console.log(`=============================================`);
  logger.info(`Server initialized on port ${PORT}`);
});

export default app;
