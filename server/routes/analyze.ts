import { Router, Request, Response } from 'express';
import { analyzeImageWithVenice } from '../services/veniceService.js';

const router = Router();

interface AnalyzeRequest {
  image: {
    data: string; // base64 encoded string
    mimeType: string;
  };
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { image }: AnalyzeRequest = req.body;

    if (!image || !image.data || !image.mimeType) {
      return res.status(400).json({ 
        error: 'Invalid request. Image data and mimeType are required.' 
      });
    }

    const result = await analyzeImageWithVenice({
      data: image.data,
      mimeType: image.mimeType,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ 
      error: 'Failed to analyze image',
      message: error.message || 'An unknown error occurred'
    });
  }
});

export { router as analyzeImage };

