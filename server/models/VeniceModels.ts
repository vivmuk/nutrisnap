export interface VeniceModel {
  id: string;
  name: string;
  description: string;
  supportsVision: boolean;
  traits?: string[];
}

export const VENICE_MODELS: VeniceModel[] = [
  {
    id: "google-gemma-3-27b-it",
    name: "Google Gemma 3 27B Instruct",
    description: "High reasoning capabilities, supports vision. Best for detailed analysis.",
    supportsVision: true,
    traits: ["default_vision"]
  },
  {
    id: "mistral-31-24b",
    name: "Venice Medium (Mistral 3.1 24B)",
    description: "Balanced performance and speed, supports vision.",
    supportsVision: true
  },
  {
    id: "grok-41-fast",
    name: "Grok 4.1 Fast",
    description: "Fast inference with vision support.",
    supportsVision: true
  },
  {
    id: "gemini-3-pro-preview",
    name: "Gemini 3 Pro Preview",
    description: "Advanced reasoning and vision capabilities.",
    supportsVision: true
  }
];

export const DEFAULT_VISION_MODEL = "google-gemma-3-27b-it";
export const FALLBACK_VISION_MODEL = "mistral-31-24b";

export function getAvailableVisionModels(): VeniceModel[] {
  return VENICE_MODELS.filter(m => m.supportsVision);
}

export function getModelById(id: string): VeniceModel | undefined {
  return VENICE_MODELS.find(m => m.id === id);
}

