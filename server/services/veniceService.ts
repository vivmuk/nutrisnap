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
  timeout: 120000, // 2 minutes timeout
  maxRetries: 0, // We handle retries ourselves
});

interface ImagePart {
  data: string; // base64 encoded string
  mimeType: string;
}

// Helper function for exponential backoff
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeImageWithVenice = async (image: ImagePart): Promise<NutritionalReport> => {
  // Using mistral-31-24b vision model
  const models = ['mistral-31-24b'];
  
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    let retries = 0;
    const maxRetries = 3;
    
    while (retries <= maxRetries) {
      try {
        console.log(`Attempting to analyze image with model: ${model} (attempt ${retries + 1})`);
        
        // Convert base64 to data URL format for Venice API
        const imageUrl = `data:${image.mimeType};base64,${image.data}`;

        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout after 120 seconds')), 120000);
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
                  text: USER_PROMPT,
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
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'nutritional_report',
              strict: true,
              schema: RESPONSE_SCHEMA,
            },
          },
          temperature: 0.3,
          max_tokens: 20000, // Increased to prevent truncation
          max_completion_tokens: 20000,
        });

        const response = await Promise.race([apiCall, timeoutPromise]) as any;

        // Check if response was truncated
        const finishReason = response.choices[0]?.finish_reason;
        if (finishReason === 'length') {
          console.warn(`Model ${model} - Response was truncated due to token limit. Consider increasing max_tokens.`);
        }

        const content = response.choices[0]?.message?.content;
        
        if (!content) {
          console.error(`Model ${model} - Venice API response:`, JSON.stringify(response, null, 2));
          break; // Try next model
        }

        const jsonText = content.trim();
        
        if (!jsonText) {
          console.error(`Model ${model} - Empty content from Venice API`);
          break; // Try next model
        }

        // Check if response might be truncated
        if (!jsonText.endsWith('}')) {
          console.warn(`Model ${model} - Response may be truncated. Full length: ${jsonText.length}`);
          console.warn(`Model ${model} - Last 500 chars:`, jsonText.substring(Math.max(0, jsonText.length - 500)));
        }

        try {
          // Try to parse the JSON
          let data: any;
          try {
            data = JSON.parse(jsonText);
          } catch (parseError: any) {
            // If parsing fails, try to fix common issues
            console.warn(`Model ${model} - Initial parse failed, attempting to fix JSON...`);
            
            // Try to complete truncated JSON
            let fixedJson = jsonText;
            if (!fixedJson.endsWith('}')) {
              // Count open braces and close them
              const openBraces = (fixedJson.match(/\{/g) || []).length;
              const closeBraces = (fixedJson.match(/\}/g) || []).length;
              const missingBraces = openBraces - closeBraces;
              
              if (missingBraces > 0) {
                // Try to intelligently close the JSON
                fixedJson = fixedJson.trim();
                // Remove trailing comma if present
                fixedJson = fixedJson.replace(/,\s*$/, '');
                // Add missing closing braces
                fixedJson += '}'.repeat(missingBraces);
                console.log(`Model ${model} - Attempted to fix JSON by adding ${missingBraces} closing braces`);
              }
            }
            
            try {
              data = JSON.parse(fixedJson);
              console.log(`Model ${model} - Successfully parsed after fixing JSON`);
            } catch (secondParseError: any) {
              console.error(`Model ${model} - Failed to parse even after fixing. Original error:`, parseError.message);
              console.error(`Model ${model} - Fixed JSON (first 500 chars):`, fixedJson.substring(0, 500));
              throw parseError; // Throw original error
            }
          }
          
          console.log(`Successfully analyzed image with model: ${model}`);
          return data as NutritionalReport;
        } catch (parseError: any) {
          console.error(`Model ${model} - Failed to parse Venice API response`);
          console.error(`Model ${model} - Response length: ${jsonText.length}`);
          console.error(`Model ${model} - First 500 chars:`, jsonText.substring(0, 500));
          console.error(`Model ${model} - Last 500 chars:`, jsonText.substring(Math.max(0, jsonText.length - 500)));
          console.error('Parse error:', parseError);
          break; // Try next model
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

