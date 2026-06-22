import express from 'express';
import { createDemoRequest } from '../controllers/marketingController';

const router = express.Router();

router.post('/demo-requests', createDemoRequest);

export default router;
