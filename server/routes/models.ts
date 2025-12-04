import { Router, Request, Response } from 'express';
import { getAvailableVisionModels } from '../models/VeniceModels.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const models = getAvailableVisionModels();
    res.json({ models });
  } catch (error: any) {
    console.error('Error fetching models:', error);
    res.status(500).json({ 
      error: 'Failed to fetch models',
      message: error.message 
    });
  }
});

export { router as modelsRouter };

