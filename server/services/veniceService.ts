import OpenAI from 'openai';
import dotenv from 'dotenv';
import { NutritionalReport } from '../../types';
import { SYSTEM_PROMPT, USER_PROMPT, RESPONSE_SCHEMA } from '../../constants';

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

export const analyzeImageWithVenice = async (image: ImagePart): Promise<NutritionalReport> => {
  try {
    // Convert base64 to data URL format for Venice API
    const imageUrl = `data:${image.mimeType};base64,${image.data}`;

    const response = await client.chat.completions.create({
      model: 'mistral-31-24b', // Mistral model with vision support
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
      throw new Error('No response content from Venice API');
    }

    const jsonText = content.trim();
    const data = JSON.parse(jsonText);
    
    return data as NutritionalReport;
  } catch (error: any) {
    console.error("Error calling Venice API:", error);
    
    // Provide more detailed error messages
    if (error.response?.data?.error) {
      throw new Error(`Venice API error: ${error.response.data.error.message || error.response.data.error}`);
    }
    
    throw new Error(`Failed to get a valid response from the AI nutritionist: ${error.message}`);
  }
};

