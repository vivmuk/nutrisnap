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
});

interface ImagePart {
  data: string; // base64 encoded string
  mimeType: string;
}

// Helper function for exponential backoff
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeImageWithVenice = async (image: ImagePart): Promise<NutritionalReport> => {
  // Try primary model first, then fallback
  // google-gemma-3-27b-it is a vision model, so it's our primary choice
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

        const response = await client.chat.completions.create({
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
          max_completion_tokens: 4000,
        });

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

        try {
          const data = JSON.parse(jsonText);
          console.log(`Successfully analyzed image with model: ${model}`);
          return data as NutritionalReport;
        } catch (parseError: any) {
          console.error(`Model ${model} - Failed to parse Venice API response:`, jsonText.substring(0, 200));
          console.error('Parse error:', parseError);
          break; // Try next model
        }
      } catch (error: any) {
        const statusCode = error.status || error.response?.status;
        const errorMessage = error.message || '';
        
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
        
        // For other errors, log and try next model
        console.error(`Model ${model} - Error calling Venice API:`, errorMessage);
        
        // If this is the last model and last retry, throw the error
        if (i === models.length - 1 && retries >= maxRetries) {
          if (error.response?.data?.error) {
            throw new Error(`Venice API error: ${error.response.data.error.message || error.response.data.error}`);
          }
          throw new Error(`Failed to get a valid response from the AI nutritionist: ${errorMessage}`);
        }
        
        // Otherwise, try next model
        break;
      }
    }
  }
  
  // If we get here, all models failed
  throw new Error('All vision models failed to analyze the image. Please wait 30 seconds and try again.');
};

