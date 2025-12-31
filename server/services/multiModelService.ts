/**
 * Multi-Model Analysis Service
 *
 * Orchestrates parallel analysis across multiple Venice AI vision models
 * and returns unified results for user comparison and selection.
 *
 * All models are accessed through the Venice AI API.
 */

import OpenAI from 'openai';
import { NutritionalReport, ModelAnalysisResult, MultiModelAnalysisResponse } from '../types.js';
import {
  VeniceVisionModel,
  VENICE_VISION_MODELS,
  VENICE_API_CONFIG,
  FORMATTING_MODEL,
  getDefaultComparisonModels,
  getModelById,
  isVeniceConfigured,
} from './multiModelConfig.js';
import { SYSTEM_PROMPT, RESPONSE_SCHEMA } from '../constants.js';

interface ImagePart {
  data: string;
  mimeType: string;
}

// Venice API client
const getVeniceClient = () => {
  const apiKey = process.env[VENICE_API_CONFIG.apiKeyEnv];
  if (!apiKey) {
    throw new Error(`Venice API key not configured (${VENICE_API_CONFIG.apiKeyEnv})`);
  }

  return new OpenAI({
    apiKey,
    baseURL: VENICE_API_CONFIG.baseURL,
    timeout: VENICE_API_CONFIG.formattingTimeout,
    maxRetries: 0, // We handle retries ourselves
  });
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Extract nutritional information from image using a specific Venice model
 */
const extractNutritionalInfo = async (
  client: OpenAI,
  modelId: string,
  imageUrl: string,
  foodName?: string,
  userCues?: string
): Promise<string> => {
  const foodNameContext = foodName
    ? `\n\nIMPORTANT CONTEXT: The user has indicated this dish may be called "${foodName}". Please use this information to help identify regional or cultural variations, traditional preparation methods, and authentic ingredients.`
    : '';

  const userCuesContext = userCues
    ? `\n\nUSER-PROVIDED MEASUREMENT CUES:\n${userCues}\n\nUse these cues as PRIMARY measurement anchors for portion estimation.`
    : '';

  const extractionPrompt = `As an expert nutritionist, analyze this food image and extract ALL nutritional information in a detailed, structured format.${foodNameContext}${userCuesContext}

Provide a comprehensive analysis including:
- Dish name and description
- All visible foods and ingredients
- Estimated portion sizes and weights
- Complete macronutrient breakdown (protein, carbs with fiber/sugars, fats with saturated/unsaturated)
- Micronutrients (vitamins and minerals as descriptive text)
- Visual observations
- Portion estimation methodology
- Confidence assessment
- Allergens and cautions

Format your response as detailed text or flexible JSON. Focus on completeness and accuracy.`;

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Extraction timeout')), VENICE_API_CONFIG.extractionTimeout);
  });

  const apiCall = client.chat.completions.create({
    model: modelId,
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: extractionPrompt },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
    temperature: VENICE_API_CONFIG.defaultTemperature,
    max_tokens: VENICE_API_CONFIG.extractionMaxTokens,
  });

  const response = await Promise.race([apiCall, timeoutPromise]);
  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No content returned from extraction step');
  }

  return content;
};

/**
 * Format extracted information into structured JSON using the formatting model
 */
const formatToSchema = async (
  client: OpenAI,
  extractedInfo: string
): Promise<NutritionalReport> => {
  const formattingPrompt = `You are a nutritionist assistant. Format the following nutritional information into the exact JSON schema required.

EXTRACTED INFORMATION:
${extractedInfo}

REQUIREMENTS:
- ALL numeric values MUST be whole integers (no decimals)
- Follow the exact schema structure
- Ensure all required fields are present
- Break down each food component in items[] with individual calories
- Include professional nutritional insights in notes[]
- Provide detailed visual observations in analysis.visualObservations
- Explain portion estimation methodology in analysis.portionEstimate
- Detail confidence reasoning in analysis.confidenceNarrative
- List allergens and cautions in analysis.cautions

Return ONLY valid JSON matching the schema.`;

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Formatting timeout')), VENICE_API_CONFIG.formattingTimeout);
  });

  const apiCall = client.chat.completions.create({
    model: FORMATTING_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a JSON formatting assistant. Format nutritional data into the exact schema provided. Ensure the JSON is complete and valid.',
      },
      { role: 'user', content: formattingPrompt },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'nutritional_report',
        strict: true,
        schema: RESPONSE_SCHEMA,
      },
    },
    temperature: 0.1,
    max_tokens: VENICE_API_CONFIG.formattingMaxTokens,
  });

  const response = await Promise.race([apiCall, timeoutPromise]);
  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No content returned from formatting step');
  }

  const jsonText = content.trim();

  try {
    const data = JSON.parse(jsonText);

    // Always run through transformToSchema to ensure all required fields have values
    // This handles cases where the API returns data with missing optional fields
    return transformToSchema(data);
  } catch (parseError: any) {
    // Try to fix truncated JSON
    if (!jsonText.endsWith('}')) {
      const fixedJson = attemptJsonFix(jsonText);
      if (fixedJson) {
        const data = JSON.parse(fixedJson);
        return transformToSchema(data);
      }
    }
    throw new Error(`Failed to parse formatted JSON: ${parseError.message}`);
  }
};

/**
 * Helper to ensure a value is a non-empty string
 */
const ensureString = (value: any, defaultValue: string): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  if (Array.isArray(value) && value.length > 0) {
    return value.join(', ');
  }
  return defaultValue;
};

const transformToSchema = (response: any): NutritionalReport => {
  return {
    dishName: ensureString(response.dish_name || response.dishName, 'Unknown Dish'),
    totalCalories: Math.round(response.total_calories || response.totalCalories || 0),
    macroNutrients: {
      protein: Math.round(response.macroNutrients?.protein || 0),
      carbohydrates: {
        total: Math.round(response.macroNutrients?.carbohydrates?.total || 0),
        fiber: Math.round(response.macroNutrients?.carbohydrates?.fiber || 0),
        sugars: Math.round(response.macroNutrients?.carbohydrates?.sugars || 0),
      },
      fat: {
        total: Math.round(response.macroNutrients?.fat?.total || 0),
        saturated: Math.round(response.macroNutrients?.fat?.saturated || 0),
        unsaturated: Math.round(response.macroNutrients?.fat?.unsaturated || 0),
      },
    },
    microNutrients: {
      vitamins: ensureString(response.microNutrients?.vitamins, 'Not specified'),
      minerals: ensureString(response.microNutrients?.minerals, 'Not specified'),
    },
    items: (response.items || []).map((item: any) => ({
      name: ensureString(item.name, 'Unknown Item'),
      calories: Math.round(item.calories || 0),
      weightGrams: Math.round(item.weightGrams || item.weight_g || 0),
      macronutrients: {
        protein: Math.round(item.macronutrients?.protein || 0),
        carbohydrates: {
          total: Math.round(item.macronutrients?.carbohydrates?.total || 0),
          fiber: Math.round(item.macronutrients?.carbohydrates?.fiber || 0),
          sugars: Math.round(item.macronutrients?.carbohydrates?.sugars || 0),
        },
        fat: {
          total: Math.round(item.macronutrients?.fat?.total || 0),
          saturated: Math.round(item.macronutrients?.fat?.saturated || 0),
          unsaturated: Math.round(item.macronutrients?.fat?.unsaturated || 0),
        },
      },
    })),
    notes: Array.isArray(response.notes) ? response.notes : [],
    analysis: {
      visualObservations: ensureString(response.analysis?.visualObservations, 'Visual analysis performed on food image'),
      portionEstimate: ensureString(response.analysis?.portionEstimate, 'Estimated based on visual analysis'),
      confidence: Math.round(response.analysis?.confidence || 75),
      confidenceNarrative: ensureString(response.analysis?.confidenceNarrative, 'Analysis confidence based on image clarity'),
      cautions: Array.isArray(response.analysis?.cautions) ? response.analysis.cautions : [],
    },
  };
};

/**
 * Attempt to fix truncated JSON
 */
const attemptJsonFix = (jsonText: string): string | null => {
  let fixed = jsonText.trim();
  const openBraces = (fixed.match(/\{/g) || []).length;
  const closeBraces = (fixed.match(/\}/g) || []).length;
  const missingBraces = openBraces - closeBraces;

  if (missingBraces > 0) {
    fixed = fixed.replace(/,\s*$/, '');
    fixed += '}'.repeat(missingBraces);
    return fixed;
  }
  return null;
};

/**
 * Create an empty nutrition report for failed analyses
 */
const createEmptyReport = (): NutritionalReport => ({
  dishName: 'Analysis Failed',
  totalCalories: 0,
  macroNutrients: {
    protein: 0,
    carbohydrates: { total: 0, fiber: 0, sugars: 0 },
    fat: { total: 0, saturated: 0, unsaturated: 0 },
  },
  microNutrients: {
    vitamins: 'Not available',
    minerals: 'Not available',
  },
  items: [],
  notes: [],
  analysis: {
    visualObservations: 'Analysis failed',
    portionEstimate: 'Unable to estimate',
    confidence: 0,
    confidenceNarrative: 'Analysis was not successful',
    cautions: [],
  },
});

/**
 * Analyze a food image with a single Venice model
 */
const analyzeWithModel = async (
  modelConfig: VeniceVisionModel,
  image: ImagePart,
  foodName?: string,
  userCues?: string
): Promise<ModelAnalysisResult> => {
  const startTime = Date.now();

  try {
    const client = getVeniceClient();
    const imageUrl = `data:${image.mimeType};base64,${image.data}`;

    console.log(`[MultiModel] Starting analysis with ${modelConfig.displayName} (${modelConfig.id})...`);
    console.log(`[MultiModel] ${modelConfig.displayName} - Image size: ${Math.round(image.data.length / 1024)}KB, MIME: ${image.mimeType}`);

    // Step 1: Extract nutritional information
    let extractedInfo: string;
    try {
      extractedInfo = await extractNutritionalInfo(
        client,
        modelConfig.id,
        imageUrl,
        foodName,
        userCues
      );
      console.log(`[MultiModel] ${modelConfig.displayName} - Extraction complete (${extractedInfo.length} chars)`);
    } catch (extractionError: any) {
      console.error(`[MultiModel] ${modelConfig.displayName} - Extraction FAILED:`, extractionError.message);
      if (extractionError.response) {
        console.error(`[MultiModel] ${modelConfig.displayName} - API Response:`, JSON.stringify(extractionError.response.data || extractionError.response, null, 2));
      }
      throw extractionError;
    }

    // Step 2: Format to schema
    let nutritionReport: NutritionalReport;
    try {
      nutritionReport = await formatToSchema(client, extractedInfo);
      console.log(`[MultiModel] ${modelConfig.displayName} - Formatting complete`);
    } catch (formattingError: any) {
      console.error(`[MultiModel] ${modelConfig.displayName} - Formatting FAILED:`, formattingError.message);
      throw formattingError;
    }

    const analysisTimeMs = Date.now() - startTime;

    console.log(`[MultiModel] ${modelConfig.displayName} completed successfully in ${analysisTimeMs}ms`);

    return {
      modelId: modelConfig.id,
      modelName: modelConfig.name,
      displayName: modelConfig.displayName,
      color: modelConfig.color,
      nutritionReport,
      analysisTimeMs,
      confidence: nutritionReport.analysis?.confidence || 75,
      status: 'success',
    };
  } catch (error: any) {
    const analysisTimeMs = Date.now() - startTime;

    // Extract detailed error info
    let errorMessage = error.message || 'Unknown error';
    if (error.status) {
      errorMessage = `HTTP ${error.status}: ${errorMessage}`;
    }
    if (error.code) {
      errorMessage = `${error.code}: ${errorMessage}`;
    }

    console.error(`[MultiModel] ${modelConfig.displayName} FAILED after ${analysisTimeMs}ms:`, errorMessage);
    if (error.stack) {
      console.error(`[MultiModel] ${modelConfig.displayName} Stack:`, error.stack.split('\n').slice(0, 3).join('\n'));
    }

    return {
      modelId: modelConfig.id,
      modelName: modelConfig.name,
      displayName: modelConfig.displayName,
      color: modelConfig.color,
      nutritionReport: createEmptyReport(),
      analysisTimeMs,
      confidence: 0,
      status: 'error',
      error: errorMessage,
    };
  }
};

/**
 * Analyze a food image with multiple Venice models in parallel
 */
export const analyzeImageWithMultipleModels = async (
  image: ImagePart,
  foodName?: string,
  userCues?: string,
  selectedModelIds?: string[]
): Promise<MultiModelAnalysisResponse> => {
  const startTime = Date.now();

  if (!isVeniceConfigured()) {
    throw new Error('Venice API is not configured. Please set the VENICE_API_KEY environment variable.');
  }

  // Get models to use
  let modelsToUse: VeniceVisionModel[];

  if (selectedModelIds && selectedModelIds.length > 0) {
    modelsToUse = selectedModelIds
      .map(id => getModelById(id))
      .filter((m): m is VeniceVisionModel => m !== undefined);
  } else {
    modelsToUse = getDefaultComparisonModels();
  }

  if (modelsToUse.length === 0) {
    throw new Error('No valid vision models selected for analysis.');
  }

  console.log(`[MultiModel] Starting parallel analysis with ${modelsToUse.length} models:`,
    modelsToUse.map(m => m.displayName).join(', '));

  // Run all model analyses in parallel
  const analysisPromises = modelsToUse.map(config =>
    analyzeWithModel(config, image, foodName, userCues)
  );

  const results = await Promise.all(analysisPromises);

  const totalTimeMs = Date.now() - startTime;
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  console.log(`[MultiModel] All analyses complete in ${totalTimeMs}ms. Success: ${successCount}, Errors: ${errorCount}`);

  // Sort results: successful first, then by confidence
  results.sort((a, b) => {
    if (a.status === 'success' && b.status === 'error') return -1;
    if (a.status === 'error' && b.status === 'success') return 1;
    return b.confidence - a.confidence;
  });

  return {
    results,
    totalTimeMs,
    successCount,
    errorCount,
  };
};

/**
 * Get list of available vision models
 */
export const getAvailableModels = (): Array<{
  id: string;
  name: string;
  displayName: string;
  description: string;
  color: string;
}> => {
  if (!isVeniceConfigured()) {
    return [];
  }

  return VENICE_VISION_MODELS.map(config => ({
    id: config.id,
    name: config.name,
    displayName: config.displayName,
    description: config.description,
    color: config.color,
  }));
};

/**
 * Get list of all supported models
 */
export const getAllSupportedModels = (): Array<{
  id: string;
  name: string;
  displayName: string;
  description: string;
  color: string;
  isConfigured: boolean;
}> => {
  const isConfigured = isVeniceConfigured();

  return VENICE_VISION_MODELS.map(config => ({
    id: config.id,
    name: config.name,
    displayName: config.displayName,
    description: config.description,
    color: config.color,
    isConfigured,
  }));
};
