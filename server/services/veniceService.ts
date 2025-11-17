import OpenAI from 'openai';
import dotenv from 'dotenv';
import { NutritionalReport } from '../types.js';
import { SYSTEM_PROMPT, USER_PROMPT, RESPONSE_SCHEMA } from '../constants.js';

// Load environment variables
dotenv.config();

if (!process.env.VENICE_API_KEY) {
  throw new Error("VENICE_API_KEY environment variable not set");
}

const client = new OpenAI({
  apiKey: process.env.VENICE_API_KEY,
  baseURL: 'https://api.venice.ai/api/v1',
  timeout: 180000, // 3 minutes timeout (increased for formatting step)
  maxRetries: 0, // We handle retries ourselves
});

interface ImagePart {
  data: string; // base64 encoded string
  mimeType: string;
}

// Helper function for exponential backoff
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Step 1: Extract information from image (no strict schema)
const extractNutritionalInfo = async (model: string, imageUrl: string): Promise<string> => {
  const extractionPrompt = `As an expert nutritionist, analyze this food image and extract ALL nutritional information in a detailed, structured format. 

Provide a comprehensive analysis including:
- Dish name and description
- All visible foods and ingredients
- Estimated portion sizes and weights
- Complete macronutrient breakdown (protein, carbs with fiber/sugars, fats with saturated/unsaturated)
- Micronutrients (vitamins and minerals)
- Visual observations
- Portion estimation methodology
- Confidence assessment
- Allergens and cautions

Format your response as detailed text or flexible JSON. Focus on completeness and accuracy - we will format it properly in the next step.`;

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Extraction timeout after 120 seconds')), 120000);
  });

  const apiCall = client.chat.completions.create({
    model: model,
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: extractionPrompt,
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
    // No strict schema - just get the information
    temperature: 0.3,
    max_tokens: 4000,
    max_completion_tokens: 4000,
  });

  const response = await Promise.race([apiCall, timeoutPromise]) as any;
  const content = response.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content returned from extraction step');
  }

  return content;
};

// Transform zai-org-glm-4.6 response to our expected schema format
const transformResponseToSchema = (response: any): NutritionalReport => {
  // Handle snake_case to camelCase conversion and structure transformation
  const transformed: NutritionalReport = {
    dishName: response.dish_name || response.dishName || 'Unknown Dish',
    totalCalories: response.total_calories || response.totalCalories || response.calories || 0,
    macroNutrients: {
      protein: response.total_nutrition?.protein_g || response.macroNutrients?.protein || response.protein_g || 0,
      carbohydrates: {
        total: response.total_nutrition?.carbs_g || response.macroNutrients?.carbohydrates?.total || response.carbs_g || 0,
        fiber: response.total_nutrition?.fiber_g || response.macroNutrients?.carbohydrates?.fiber || response.fiber_g || 0,
        sugars: response.total_nutrition?.sugar_g || response.macroNutrients?.carbohydrates?.sugars || response.sugar_g || 0,
      },
      fat: {
        total: response.total_nutrition?.fat_g || response.macroNutrients?.fat?.total || response.fat_g || 0,
        saturated: response.macroNutrients?.fat?.saturated || 0,
        unsaturated: response.macroNutrients?.fat?.unsaturated || 0,
      },
    },
    microNutrients: {
      vitamins: typeof response.microNutrients?.vitamins === 'string' 
        ? response.microNutrients.vitamins 
        : Array.isArray(response.microNutrients?.vitamins)
        ? response.microNutrients.vitamins.join(', ')
        : response.vitamins || 'Not specified',
      minerals: typeof response.microNutrients?.minerals === 'string'
        ? response.microNutrients.minerals
        : Array.isArray(response.microNutrients?.minerals)
        ? response.microNutrients.minerals.join(', ')
        : response.minerals || 'Not specified',
    },
    items: (response.items || []).map((item: any) => ({
      name: item.name || 'Unknown Item',
      calories: item.calories || 0,
      weightGrams: item.weight_g || item.weightGrams || 0,
      macronutrients: {
        protein: item.protein_g || item.macronutrients?.protein || 0,
        carbohydrates: {
          total: item.carbs_g || item.macronutrients?.carbohydrates?.total || 0,
          fiber: item.fiber_g || item.macronutrients?.carbohydrates?.fiber || 0,
          sugars: item.sugar_g || item.macronutrients?.carbohydrates?.sugars || 0,
        },
        fat: {
          total: item.fat_g || item.macronutrients?.fat?.total || 0,
          saturated: item.macronutrients?.fat?.saturated || 0,
          unsaturated: item.macronutrients?.fat?.unsaturated || 0,
        },
      },
    })),
    notes: Array.isArray(response.notes) ? response.notes : [],
    analysis: {
      visualObservations: Array.isArray(response.analysis?.visualObservations)
        ? response.analysis.visualObservations.join('. ')
        : response.analysis?.visualObservations || response.visualObservations || 'No visual observations',
      portionEstimate: response.analysis?.portionEstimate || response.portionEstimate || 'Portion size estimated',
      confidence: response.analysis?.confidence || response.confidence || 75,
      confidenceNarrative: response.analysis?.confidenceNarrative || response.confidenceNarrative || 'Confidence based on visual analysis',
      cautions: Array.isArray(response.analysis?.cautions) ? response.analysis.cautions : [],
    },
  };

  return transformed;
};

// Step 2: Format extracted information according to strict schema
// Use qwen3-4b for formatting (better structured output support)
const formatToSchema = async (extractedInfo: string): Promise<NutritionalReport> => {
  const formattingModel = 'qwen3-4b'; // Dedicated model for JSON formatting
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

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Formatting timeout after 180 seconds')), 180000); // Increased to 3 minutes
  });

  const apiCall = client.chat.completions.create({
    model: formattingModel,
    messages: [
      {
        role: 'system',
        content: 'You are a JSON formatting assistant. Format nutritional data into the exact schema provided. Ensure the JSON is complete and valid.',
      },
      {
        role: 'user',
        content: formattingPrompt,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'nutritional_report',
        strict: true,
        schema: RESPONSE_SCHEMA,
      },
    },
    temperature: 0.1, // Lower temperature for more consistent formatting
    max_tokens: 16000, // Increased from 8000 to prevent truncation
    max_completion_tokens: 16000,
  });

  const response = await Promise.race([apiCall, timeoutPromise]) as any;

  const finishReason = response.choices[0]?.finish_reason;
  if (finishReason === 'length') {
    console.warn(`Model ${formattingModel} - Formatting response was truncated. Consider increasing max_tokens further.`);
  }

  const content = response.choices[0]?.message?.content;
  
  if (!content) {
    console.error(`Model ${formattingModel} - No content in formatting response. Full response:`, JSON.stringify(response, null, 2));
    throw new Error('No content returned from formatting step');
  }

  const jsonText = content.trim();
  
  // Check if response might be truncated
  if (!jsonText.endsWith('}')) {
    console.warn(`Model ${formattingModel} - Formatting response may be truncated. Full length: ${jsonText.length}`);
    console.warn(`Model ${formattingModel} - Last 500 chars:`, jsonText.substring(Math.max(0, jsonText.length - 500)));
  }
  
  try {
    const data = JSON.parse(jsonText);
    
    // Check if data already matches our schema (qwen3-4b might return correct format)
    if (data.macroNutrients && typeof data.macroNutrients.protein === 'number') {
      console.log(`Model ${formattingModel} - Response already matches schema format`);
      return data as NutritionalReport;
    }
    
    // Transform the response to match our expected schema (for models that return different format)
    const transformed = transformResponseToSchema(data);
    console.log(`Model ${formattingModel} - Successfully transformed response to schema`);
    return transformed;
  } catch (parseError: any) {
    console.error(`Model ${formattingModel} - Failed to parse formatted JSON`);
    console.error(`Model ${formattingModel} - Response length: ${jsonText.length}`);
    console.error(`Model ${formattingModel} - First 500 chars:`, jsonText.substring(0, 500));
    console.error(`Model ${formattingModel} - Last 500 chars:`, jsonText.substring(Math.max(0, jsonText.length - 500)));
    
    // Try to fix truncated JSON
    if (!jsonText.endsWith('}')) {
      console.warn(`Model ${formattingModel} - Attempting to fix truncated JSON...`);
      let fixedJson = jsonText.trim();
      
      // Count open/close braces
      const openBraces = (fixedJson.match(/\{/g) || []).length;
      const closeBraces = (fixedJson.match(/\}/g) || []).length;
      const missingBraces = openBraces - closeBraces;
      
      if (missingBraces > 0) {
        // Remove trailing comma if present
        fixedJson = fixedJson.replace(/,\s*$/, '');
        // Add missing closing braces
        fixedJson += '}'.repeat(missingBraces);
        
        try {
          const fixedData = JSON.parse(fixedJson);
          // Transform the fixed response to match our expected schema
          const transformed = transformResponseToSchema(fixedData);
          console.log(`Model ${formattingModel} - Successfully fixed, parsed, and transformed truncated JSON`);
          return transformed;
        } catch (fixError: any) {
          console.error(`Model ${formattingModel} - Failed to fix truncated JSON:`, fixError.message);
        }
      }
    }
    
    throw new Error(`Failed to parse formatted JSON: ${parseError.message}`);
  }
};

export const analyzeImageWithVenice = async (image: ImagePart): Promise<NutritionalReport> => {
  // Using google-gemma-3-27b-it as primary, mistral-31-24b as fallback
  const models = ['google-gemma-3-27b-it', 'mistral-31-24b'];
  
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    let retries = 0;
    const maxRetries = 3;
    
    while (retries <= maxRetries) {
      try {
        console.log(`Attempting to analyze image with model: ${model} (attempt ${retries + 1})`);
        
        // Convert base64 to data URL format for Venice API
        const imageUrl = `data:${image.mimeType};base64,${image.data}`;

        // Step 1: Extract information (no strict schema)
        console.log(`Step 1: Extracting nutritional information...`);
        let extractedInfo: string;
        try {
          extractedInfo = await extractNutritionalInfo(model, imageUrl);
          console.log(`Step 1: Successfully extracted information (length: ${extractedInfo.length} chars)`);
        } catch (extractError: any) {
          console.error(`Model ${model} - Extraction failed:`, extractError.message);
          throw extractError;
        }

        // Step 2: Format to schema (using dedicated formatting model)
        console.log(`Step 2: Formatting information to schema...`);
        try {
          const formattedData = await formatToSchema(extractedInfo);
          console.log(`Successfully analyzed image with ${model} and formatted with qwen3-4b`);
          return formattedData;
        } catch (formatError: any) {
          console.error(`Formatting failed:`, formatError.message);
          throw formatError;
        }
      } catch (error: any) {
        const statusCode = error.status || error.response?.status;
        const errorMessage = error.message || '';
        const errorDetails = error.response?.data || error.error || {};
        
        // Log full error details for debugging
        console.error(`Model ${model} - Full error details:`, {
          statusCode,
          message: errorMessage,
          error: errorDetails,
          response: error.response?.data,
        });
        
        // Handle rate limiting (429)
        if (statusCode === 429) {
          const retryAfter = error.response?.headers?.['x-ratelimit-reset-requests'] || error.response?.headers?.['retry-after'] || 30;
          console.error(`Model ${model} - Rate limited. Waiting ${retryAfter} seconds...`);
          
          if (retries < maxRetries) {
            await sleep(retryAfter * 1000);
            retries++;
            continue; // Retry same model
          } else {
            // If we've exhausted retries on this model, try next model
            break;
          }
        }
        
        // Handle server errors (500, 503) with exponential backoff
        if (statusCode === 500 || statusCode === 503) {
          const backoffTime = Math.min(1000 * Math.pow(2, retries), 30000); // Max 30 seconds
          console.error(`Model ${model} - Server error (${statusCode}). Retrying in ${backoffTime}ms...`);
          
          if (retries < maxRetries) {
            await sleep(backoffTime);
            retries++;
            continue; // Retry same model
          } else {
            break; // Try next model
          }
        }
        
        // Handle 404 (model not found) - try next model immediately
        if (statusCode === 404) {
          console.error(`Model ${model} - Not found (404). Trying next model...`);
          break; // Try next model
        }
        
        // Handle 400 (bad request) - likely model doesn't support the feature
        if (statusCode === 400) {
          console.error(`Model ${model} - Bad request (400):`, errorDetails);
          break; // Try next model
        }
        
        // For other errors, log and try next model
        console.error(`Model ${model} - Error calling Venice API:`, errorMessage);
        
        // If this is the last model and last retry, throw the error
        if (i === models.length - 1 && retries >= maxRetries) {
          const detailedError = errorDetails?.error?.message || errorDetails?.message || errorMessage;
          throw new Error(`Venice API error: ${detailedError}`);
        }
        
        // Otherwise, try next model
        break;
      }
    }
  }
  
  // If we get here, all models failed
  throw new Error('All vision models failed to analyze the image. Please check the backend logs for details and wait 30 seconds before trying again.');
};

