import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PORT } from './shared/config/config.js';
import { checkConnection } from './infrastructure/database/connection.js';

// Routes imports
import publicRoutes from './infrastructure/http/routes/public.routes.js';
import orderRoutes from './infrastructure/http/routes/order.routes.js';

const app = express();

const allowedOrigins = [
    'http://localhost:5173', // Vite default
    'http://localhost:3000',
    'http://127.0.0.1:5173'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Security Headers (COOP for Google Auth)
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/api', publicRoutes);
app.use('/api', orderRoutes);

checkConnection();

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
