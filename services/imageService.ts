
import { NutritionalReport } from '../types';

interface ImagePart {
  data: string; // base64 encoded string
  mimeType: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const analyzeImage = async (image: ImagePart): Promise<NutritionalReport> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as NutritionalReport;
  } catch (error: any) {
    console.error("Error calling Venice API:", error);
    throw new Error(error.message || "Failed to get a valid response from the AI nutritionist.");
  }
};

