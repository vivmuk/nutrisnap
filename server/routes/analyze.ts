import { Router, Request, Response } from 'express';
import { analyzeImageWithVenice } from '../services/veniceService.js';

const router = Router();

interface AnalyzeRequest {
  image: {
    data: string; // base64 encoded string
    mimeType: string;
  };
  foodName?: string; // Optional food name to guide analysis
  modelId?: string; // Optional model selection
  userCues?: string; // Optional measurement cues
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { image, foodName, modelId, userCues }: AnalyzeRequest = req.body;

    if (!image || !image.data || !image.mimeType) {
      return res.status(400).json({ 
        error: 'Invalid request. Image data and mimeType are required.' 
      });
    }

    console.log('Received image analysis request', {
      foodName: foodName || 'none',
      modelId: modelId || 'default',
      hasCues: !!userCues
    });
    
    const result = await analyzeImageWithVenice({
      data: image.data,
      mimeType: image.mimeType,
    }, foodName, modelId, userCues);

    // Validate the response structure before sending
    if (!result || !result.macroNutrients || typeof result.macroNutrients.protein !== 'number') {
      console.error('Invalid response structure:', JSON.stringify(result, null, 2));
      return res.status(500).json({
        error: 'Invalid response from AI model',
        message: 'The nutritional analysis response is missing required fields',
        details: result
      });
    }

    console.log('Image analysis successful');
    console.log('Response structure validated:', {
      hasDishName: !!result.dishName,
      hasTotalCalories: !!result.totalCalories,
      hasMacroNutrients: !!result.macroNutrients,
      hasProtein: !!result.macroNutrients?.protein,
      hasItems: !!result.items,
      itemsCount: result.items?.length || 0
    });
    
    res.json(result);
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    console.error('Error stack:', error.stack);
    
    // Ensure we always send valid JSON
    const errorResponse = {
      error: 'Failed to analyze image',
      message: error.message || 'An unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
    
    res.status(500).json(errorResponse);
  }
});

export { router as analyzeImage };

