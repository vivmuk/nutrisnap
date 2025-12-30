import React, { useState } from 'react';
import { ModelAnalysisResult, NutritionalReport } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ModelComparisonPanelProps {
  results: ModelAnalysisResult[];
  currentImage: string | null;
  onSelectResult: (report: NutritionalReport) => void;
  onCancel: () => void;
  totalTimeMs: number;
}

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const ExclamationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
  </svg>
);

const MiniPieChart: React.FC<{ protein: number; carbs: number; fat: number; color: string }> = ({ protein, carbs, fat, color }) => {
  const data = [
    { name: 'Protein', value: protein },
    { name: 'Carbs', value: carbs },
    { name: 'Fat', value: fat },
  ];

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B'];

  return (
    <ResponsiveContainer width="100%" height={80}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={20}
          outerRadius={35}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-gray-800 px-2 py-1 rounded text-xs text-white">
                  {payload[0].name}: {payload[0].value}g
                </div>
              );
            }
            return null;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

const ModelResultCard: React.FC<{
  result: ModelAnalysisResult;
  isSelected: boolean;
  onSelect: () => void;
  onSave: () => void;
}> = ({ result, isSelected, onSelect, onSave }) => {
  const { nutritionReport, displayName, color, analysisTimeMs, confidence, status, error } = result;
  const isError = status === 'error';

  return (
    <div
      className={`relative rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
        isSelected
          ? 'border-brand-primary bg-brand-primary/5 shadow-lg shadow-brand-primary/20'
          : isError
          ? 'border-red-700/50 bg-red-900/20 opacity-60'
          : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
      }`}
      onClick={!isError ? onSelect : undefined}
    >
      {/* Header with model name */}
      <div
        className="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between"
        style={{ backgroundColor: isError ? 'rgba(127, 29, 29, 0.3)' : `${color}15` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="font-semibold text-white">{displayName}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <ClockIcon className="w-3.5 h-3.5" />
            {(analysisTimeMs / 1000).toFixed(1)}s
          </span>
          {!isError && (
            <span
              className={`px-2 py-0.5 rounded-full font-medium ${
                confidence >= 85
                  ? 'bg-green-900/50 text-green-300'
                  : confidence >= 70
                  ? 'bg-yellow-900/50 text-yellow-300'
                  : 'bg-red-900/50 text-red-300'
              }`}
            >
              {confidence}%
            </span>
          )}
        </div>
      </div>

      {isError ? (
        <div className="p-4 text-center">
          <ExclamationIcon className="w-8 h-8 mx-auto text-red-400 mb-2" />
          <p className="text-red-300 text-sm font-medium">Analysis Failed</p>
          <p className="text-red-400/70 text-xs mt-1">{error || 'Unknown error'}</p>
        </div>
      ) : (
        <>
          {/* Main content */}
          <div className="p-4">
            {/* Dish name and calories */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-white truncate" title={nutritionReport.dishName}>
                {nutritionReport.dishName}
              </h3>
              <p className="text-3xl font-extrabold text-brand-primary mt-1">
                {nutritionReport.totalCalories}
                <span className="text-sm font-normal text-gray-400 ml-1">kcal</span>
              </p>
            </div>

            {/* Macros with mini pie chart */}
            <div className="flex items-center gap-4">
              <div className="w-24">
                <MiniPieChart
                  protein={nutritionReport.macroNutrients.protein}
                  carbs={nutritionReport.macroNutrients.carbohydrates.total}
                  fat={nutritionReport.macroNutrients.fat.total}
                  color={color}
                />
              </div>
              <div className="flex-1 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-400">Protein</span>
                  <span className="text-white font-medium">{nutritionReport.macroNutrients.protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">Carbs</span>
                  <span className="text-white font-medium">{nutritionReport.macroNutrients.carbohydrates.total}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-400">Fat</span>
                  <span className="text-white font-medium">{nutritionReport.macroNutrients.fat.total}g</span>
                </div>
              </div>
            </div>

            {/* Items count */}
            {nutritionReport.items.length > 0 && (
              <div className="mt-4 text-xs text-gray-400">
                <span className="font-medium text-gray-300">{nutritionReport.items.length}</span> items detected:
                <span className="ml-1 text-gray-500">
                  {nutritionReport.items.slice(0, 3).map(i => i.name).join(', ')}
                  {nutritionReport.items.length > 3 && '...'}
                </span>
              </div>
            )}
          </div>

          {/* Selection indicator and button */}
          <div className="px-4 pb-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSave();
              }}
              disabled={!isSelected}
              className={`w-full py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                isSelected
                  ? 'bg-gradient-to-r from-brand-primary to-green-500 text-white hover:from-brand-secondary hover:to-green-400'
                  : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSelected ? (
                <>
                  <CheckIcon className="w-5 h-5" />
                  Save This Result
                </>
              ) : (
                'Click to Select'
              )}
            </button>
          </div>
        </>
      )}

      {/* Selected indicator */}
      {isSelected && !isError && (
        <div className="absolute top-2 right-2">
          <div className="bg-brand-primary rounded-full p-1">
            <CheckIcon className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

const ModelComparisonPanel: React.FC<ModelComparisonPanelProps> = ({
  results,
  currentImage,
  onSelectResult,
  onCancel,
  totalTimeMs,
}) => {
  const [selectedModelId, setSelectedModelId] = useState<string | null>(
    results.find(r => r.status === 'success')?.modelId || null
  );

  const successfulResults = results.filter(r => r.status === 'success');
  const failedResults = results.filter(r => r.status === 'error');

  const handleSave = (result: ModelAnalysisResult) => {
    // Add image to the report before saving
    const reportWithImage = {
      ...result.nutritionReport,
      image: currentImage || undefined,
    };
    onSelectResult(reportWithImage);
  };

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Header */}
      <div className="text-center p-6 bg-gray-800/50 rounded-2xl">
        <div className="flex items-center justify-center gap-2 mb-2">
          <SparklesIcon className="w-8 h-8 text-brand-primary" />
          <h2 className="text-2xl font-bold text-white">Multi-Model Analysis</h2>
        </div>
        <p className="text-gray-400">
          Compare results from {successfulResults.length} AI model{successfulResults.length !== 1 ? 's' : ''} and choose the best analysis
        </p>
        <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            Total time: {(totalTimeMs / 1000).toFixed(1)}s
          </span>
          {failedResults.length > 0 && (
            <span className="text-red-400">
              {failedResults.length} model{failedResults.length !== 1 ? 's' : ''} failed
            </span>
          )}
        </div>

        {/* Image preview */}
        {currentImage && (
          <div className="mt-4 flex justify-center">
            <img
              src={currentImage}
              alt="Food being analyzed"
              className="max-w-full h-auto max-h-40 rounded-lg shadow-lg border-2 border-gray-700"
            />
          </div>
        )}
      </div>

      {/* Comparison tips */}
      <div className="bg-indigo-900/20 border border-indigo-700/50 rounded-xl p-4">
        <h4 className="font-semibold text-indigo-300 mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
          Comparison Tips
        </h4>
        <ul className="text-sm text-gray-400 space-y-1 ml-7 list-disc">
          <li>Compare total calorie estimates between models</li>
          <li>Check if the detected items match what you see</li>
          <li>Consider confidence scores - higher is more reliable</li>
          <li>Review the macro breakdown for reasonableness</li>
        </ul>
      </div>

      {/* Results grid */}
      <div className={`grid gap-4 ${
        results.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
        results.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
        results.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      }`}>
        {results.map((result) => (
          <ModelResultCard
            key={result.modelId}
            result={result}
            isSelected={selectedModelId === result.modelId}
            onSelect={() => setSelectedModelId(result.modelId)}
            onSave={() => handleSave(result)}
          />
        ))}
      </div>

      {/* Cancel button */}
      <div className="text-center pt-4">
        <button
          onClick={onCancel}
          className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300"
        >
          Analyze Another Meal
        </button>
      </div>
    </div>
  );
};

export default ModelComparisonPanel;
