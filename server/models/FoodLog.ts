import mongoose, { Schema, Document } from 'mongoose';
import { NutritionalReport } from '../types.js';

export interface IFoodLog extends Document {
  userId?: string; // Optional for future multi-user support
  date: Date;
  report: NutritionalReport;
  createdAt: Date;
  updatedAt: Date;
}

const MacroNutrientsSchema = new Schema({
  protein: { type: Number, required: true },
  carbohydrates: {
    total: { type: Number, required: true },
    fiber: { type: Number, required: true },
    sugars: { type: Number, required: true },
  },
  fat: {
    total: { type: Number, required: true },
    saturated: { type: Number, required: true },
    unsaturated: { type: Number, required: true },
  },
}, { _id: false });

const MicroNutrientsSchema = new Schema({
  vitamins: { type: String, required: true },
  minerals: { type: String, required: true },
}, { _id: false });

const FoodItemSchema = new Schema({
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  weightGrams: { type: Number, required: true },
  macronutrients: { type: MacroNutrientsSchema, required: true },
}, { _id: false });

const AnalysisSchema = new Schema({
  visualObservations: { type: String, required: true },
  portionEstimate: { type: String, required: true },
  confidence: { type: Number, required: true },
  confidenceNarrative: { type: String, required: true },
  cautions: { type: [String], required: true },
}, { _id: false });

const NutritionalReportSchema = new Schema({
  dishName: { type: String, required: true },
  totalCalories: { type: Number, required: true },
  macroNutrients: { type: MacroNutrientsSchema, required: true },
  microNutrients: { type: MicroNutrientsSchema, required: true },
  items: { type: [FoodItemSchema], required: true },
  notes: { type: [String], required: true },
  analysis: { type: AnalysisSchema, required: true },
}, { _id: false });

const FoodLogSchema = new Schema({
  userId: { type: String, index: true },
  date: { type: Date, required: true, index: true },
  report: { type: NutritionalReportSchema, required: true },
}, {
  timestamps: true,
});

export const FoodLog = mongoose.model<IFoodLog>('FoodLog', FoodLogSchema);

