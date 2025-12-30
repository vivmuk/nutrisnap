
import { NutritionalReport, MultiModelAnalysisResponse } from '../types';

interface ImagePart {
  data: string; // base64 encoded string
  mimeType: string;
}

export interface VeniceModel {
  id: string;
  name: string;
  description: string;
  supportsVision: boolean;
  traits?: string[];
}

export interface MultiModelInfo {
  id: string;
  name: string;
  displayName: string;
  description: string;
  color: string;
  isConfigured: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const getAvailableModels = async (): Promise<VeniceModel[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/models`);
    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
};

/**
 * Get available models for multi-model analysis
 */
export const getMultiModelInfo = async (): Promise<{
  available: MultiModelInfo[];
  all: MultiModelInfo[];
  count: number;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze-multi/models`);
    if (!response.ok) {
      throw new Error('Failed to fetch multi-model info');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching multi-model info:', error);
    return { available: [], all: [], count: 0 };
  }
};

/**
 * Analyze image with a single model (legacy/fallback)
 */
export const analyzeImage = async (
  image: ImagePart,
  foodName?: string,
  modelId?: string,
  userCues?: string
): Promise<NutritionalReport> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes timeout

  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image, foodName, modelId, userCues }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as NutritionalReport;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      console.error("Request timeout - API took too long to respond");
      throw new Error("Request timed out. The image analysis is taking longer than expected. Please try again.");
    }

    console.error("Error calling Venice API:", error);
    throw new Error(error.message || "Failed to get a valid response from the AI nutritionist.");
  }
};

/**
 * Analyze image with multiple AI models in parallel
 */
export const analyzeImageMultiModel = async (
  image: ImagePart,
  foodName?: string,
  userCues?: string,
  selectedModels?: string[]
): Promise<MultiModelAnalysisResponse> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout for multi-model

  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze-multi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image, foodName, userCues, selectedModels }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as MultiModelAnalysisResponse;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      console.error("Request timeout - Multi-model analysis took too long");
      throw new Error("Request timed out. The multi-model analysis is taking longer than expected. Please try again.");
    }

    console.error("Error calling multi-model API:", error);
    throw new Error(error.message || "Failed to get responses from AI models.");
  }
};

