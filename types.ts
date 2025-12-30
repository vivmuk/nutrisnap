
export interface MacroNutrients {
  protein: number;
  carbohydrates: {
    total: number;
    fiber: number;
    sugars: number;
  };
  fat: {
    total: number;
    saturated: number;
    unsaturated: number;
  };
}

export interface MicroNutrients {
    vitamins: string;
    minerals: string;
}

export interface FoodItem {
  name: string;
  calories: number;
  weightGrams: number;
  macronutrients: MacroNutrients;
}

export interface Analysis {
  visualObservations: string;
  portionEstimate: string;
  confidence: number;
  confidenceNarrative: string;
  cautions: string[];
}

export interface NutritionalReport {
  dishName: string;
  totalCalories: number;
  macroNutrients: MacroNutrients;
  microNutrients: MicroNutrients;
  items: FoodItem[];
  notes: string[];
  analysis: Analysis;
  image?: string; // base64 encoded image (optional, for manual entries)
}

export interface LoggedFoodItem extends NutritionalReport {
    id: string;
    date: string; // ISO string
}

// Multi-model analysis types
export interface ModelAnalysisResult {
  modelId: string;
  modelName: string;
  displayName: string;
  color: string;
  nutritionReport: NutritionalReport;
  analysisTimeMs: number;
  confidence: number;
  status: 'success' | 'error';
  error?: string;
}

export interface MultiModelAnalysisResponse {
  results: ModelAnalysisResult[];
  totalTimeMs: number;
  successCount: number;
  errorCount: number;
}
