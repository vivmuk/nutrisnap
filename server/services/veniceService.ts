import OpenAI from 'openai';
import dotenv from 'dotenv';
import { NutritionalReport } from '../types.js';
import { SYSTEM_PROMPT, USER_PROMPT, RESPONSE_SCHEMA } from '../constants.js';

// Load environment variables
dotenv.config();

if (!process.env.VENICE_API_KEY) {
  throw new Error("VENICE_API_KEY environment variable not set");
}

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

export const analyzeImageWithVenice = async (image: ImagePart): Promise<NutritionalReport> => {
  // Try primary model first, then fallback
  const models = ['mistral-31-24b', 'qwen-2.5-vl', 'mistral-32-24b'];
  
  for (const model of models) {
    try {
      console.log(`Attempting to analyze image with model: ${model}`);
      
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
        continue; // Try next model
      }

      const jsonText = content.trim();
      
      if (!jsonText) {
        console.error(`Model ${model} - Empty content from Venice API`);
        continue; // Try next model
      }

      try {
        const data = JSON.parse(jsonText);
        console.log(`Successfully analyzed image with model: ${model}`);
        return data as NutritionalReport;
      } catch (parseError: any) {
        console.error(`Model ${model} - Failed to parse Venice API response:`, jsonText.substring(0, 200));
        console.error('Parse error:', parseError);
        continue; // Try next model
      }
    } catch (error: any) {
      console.error(`Model ${model} - Error calling Venice API:`, error.message);
      
      // If this is the last model, throw the error
      if (model === models[models.length - 1]) {
        // Provide more detailed error messages
        if (error.response?.data?.error) {
          throw new Error(`Venice API error: ${error.response.data.error.message || error.response.data.error}`);
        }
        
        throw new Error(`Failed to get a valid response from the AI nutritionist: ${error.message}`);
      }
      // Otherwise, continue to next model
      continue;
    }
  }
  
  // If we get here, all models failed
  throw new Error('All vision models failed to analyze the image');
};

