/**
 * Multi-Model Configuration for Food Nutrition Analysis
 *
 * All models are accessed through the Venice AI API.
 * This allows running multiple vision models in parallel for comparison.
 */

export interface VeniceVisionModel {
  id: string;
  name: string;
  displayName: string;
  description: string;
  color: string;
  supportsVision: boolean;
  privacy: 'private' | 'anonymized';
  pricing?: {
    input: number;
    output: number;
  };
}

// Vision-capable models available through Venice AI
// Based on the API response where supportsVision: true
export const VENICE_VISION_MODELS: VeniceVisionModel[] = [
  {
    id: 'mistral-31-24b',
    name: 'mistral-31-24b',
    displayName: 'Venice Medium',
    description: 'Balanced blend of speed and capability with image analysis',
    color: '#FF6B6B', // Red
    supportsVision: true,
    privacy: 'private',
    pricing: { input: 0.5, output: 2 },
  },
  {
    id: 'google-gemma-3-27b-it',
    name: 'google-gemma-3-27b-it',
    displayName: 'Gemma 3 27B',
    description: 'Google\'s multimodal model with vision-language support',
    color: '#4285F4', // Google Blue
    supportsVision: true,
    privacy: 'private',
    pricing: { input: 0.12, output: 0.2 },
  },
  {
    id: 'grok-41-fast',
    name: 'grok-41-fast',
    displayName: 'Grok 4.1 Fast',
    description: 'xAI\'s agentic tool-calling model with image analysis',
    color: '#1DA1F2', // Twitter Blue
    supportsVision: true,
    privacy: 'anonymized',
    pricing: { input: 0.5, output: 1.25 },
  },
  {
    id: 'gemini-3-flash-preview',
    name: 'gemini-3-flash-preview',
    displayName: 'Gemini 3 Flash',
    description: 'High speed thinking model for agentic workflows',
    color: '#34A853', // Google Green
    supportsVision: true,
    privacy: 'anonymized',
    pricing: { input: 0.7, output: 3.75 },
  },
  {
    id: 'minimax-m21',
    name: 'minimax-m21',
    displayName: 'MiniMax M2.1',
    description: 'Lightweight state-of-the-art model with vision',
    color: '#8B5CF6', // Purple
    supportsVision: true,
    privacy: 'anonymized',
    pricing: { input: 0.4, output: 1.6 },
  },
];

// Default models for multi-model comparison (most cost-effective)
export const DEFAULT_COMPARISON_MODELS = [
  'mistral-31-24b',
  'google-gemma-3-27b-it',
  'grok-41-fast',
  'gemini-3-flash-preview',
];

// Formatting model (text-only, for JSON formatting)
export const FORMATTING_MODEL = 'qwen3-4b';

// Venice API configuration
export const VENICE_API_CONFIG = {
  baseURL: 'https://api.venice.ai/api/v1',
  apiKeyEnv: 'VENICE_API_KEY',
  extractionTimeout: 120000, // 2 minutes
  formattingTimeout: 180000, // 3 minutes
  defaultTemperature: 0.3,
  extractionMaxTokens: 4000,
  formattingMaxTokens: 16000,
};

/**
 * Get all available vision models
 */
export const getVisionModels = (): VeniceVisionModel[] => {
  return VENICE_VISION_MODELS.filter(m => m.supportsVision);
};

/**
 * Get default models for comparison
 */
export const getDefaultComparisonModels = (): VeniceVisionModel[] => {
  return VENICE_VISION_MODELS.filter(m =>
    DEFAULT_COMPARISON_MODELS.includes(m.id)
  );
};

/**
 * Get a specific model by ID
 */
export const getModelById = (modelId: string): VeniceVisionModel | undefined => {
  return VENICE_VISION_MODELS.find(m => m.id === modelId);
};

/**
 * Check if Venice API is configured
 */
export const isVeniceConfigured = (): boolean => {
  const apiKey = process.env[VENICE_API_CONFIG.apiKeyEnv];
  return !!apiKey && apiKey.trim().length > 0;
};
