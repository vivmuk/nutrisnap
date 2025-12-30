import { Router, Request, Response } from 'express';
import { analyzeImageWithMultipleModels, getAvailableModels, getAllSupportedModels } from '../services/multiModelService.js';

const router = Router();

interface MultiAnalyzeRequest {
  image: {
    data: string; // base64 encoded string
    mimeType: string;
  };
  foodName?: string; // Optional food name to guide analysis
  userCues?: string; // Optional measurement cues
  selectedModels?: string[]; // Optional: specific models to use
}

/**
 * POST /api/analyze-multi
 * Analyze a food image with multiple AI models in parallel
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { image, foodName, userCues, selectedModels }: MultiAnalyzeRequest = req.body;

    if (!image || !image.data || !image.mimeType) {
      return res.status(400).json({
        error: 'Invalid request. Image data and mimeType are required.',
      });
    }

    console.log('Received multi-model analysis request', {
      foodName: foodName || 'none',
      hasCues: !!userCues,
      selectedModels: selectedModels || 'all available',
    });

    const result = await analyzeImageWithMultipleModels(
      { data: image.data, mimeType: image.mimeType },
      foodName,
      userCues,
      selectedModels
    );

    // Validate that we have at least one successful result
    if (result.successCount === 0) {
      console.error('All models failed:', result.results.map(r => ({ model: r.modelId, error: r.error })));
      return res.status(500).json({
        error: 'All AI models failed to analyze the image',
        message: 'Please try again or use a different image',
        details: result.results.map(r => ({ model: r.modelId, error: r.error })),
      });
    }

    console.log('Multi-model analysis successful', {
      totalModels: result.results.length,
      successCount: result.successCount,
      errorCount: result.errorCount,
      totalTimeMs: result.totalTimeMs,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error in multi-model analysis:', error);
    console.error('Error stack:', error.stack);

    res.status(500).json({
      error: 'Failed to analyze image',
      message: error.message || 'An unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

/**
 * GET /api/analyze-multi/models
 * Get list of available models for multi-model analysis
 */
router.get('/models', async (req: Request, res: Response) => {
  try {
    const available = getAvailableModels();
    const all = getAllSupportedModels();

    res.json({
      available,
      all,
      count: available.length,
    });
  } catch (error: any) {
    console.error('Error getting model list:', error);
    res.status(500).json({
      error: 'Failed to get model list',
      message: error.message,
    });
  }
});

export { router as analyzeMulti };
