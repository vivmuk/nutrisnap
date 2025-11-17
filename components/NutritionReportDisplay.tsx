import React from 'react';
import { NutritionalReport } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface NutritionReportDisplayProps {
  report: NutritionalReport;
  onAddToLog: (report: NutritionalReport) => void;
  onCancel: () => void;
}

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
);
const CautionIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
);
const ChartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" /></svg>
);


const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-700 p-2 border border-gray-600 rounded-md shadow-lg">
        <p className="label text-white">{`${payload[0].name} : ${payload[0].value}g`}</p>
      </div>
    );
  }
  return null;
};


const NutritionReportDisplay: React.FC<NutritionReportDisplayProps> = ({ report, onAddToLog, onCancel }) => {
  const { totalCalories, macroNutrients, dishName, items, notes, analysis, image } = report;
  
  const macroData = [
    { name: 'Protein', value: macroNutrients.protein },
    { name: 'Carbs', value: macroNutrients.carbohydrates.total },
    { name: 'Fat', value: macroNutrients.fat.total },
  ];

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B'];

  return (
    <div className="space-y-6 animate-slide-in-up">
      <div className="text-center p-6 bg-gray-800/50 rounded-2xl">
        <h2 className="text-3xl font-bold text-white">{dishName}</h2>
        <p className="text-7xl font-extrabold text-brand-primary mt-2">{totalCalories}</p>
        <p className="text-gray-400">Total Estimated Calories</p>
        {image && (
          <div className="mt-6 flex justify-center">
            <img 
              src={image} 
              alt={dishName}
              className="max-w-full h-auto max-h-64 rounded-lg shadow-lg border-2 border-gray-700"
            />
          </div>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 p-6 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2"><ChartIcon className="w-6 h-6 text-brand-primary"/>Macronutrient Breakdown</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie data={macroData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                        {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2 text-sm">
                <p><strong>Protein:</strong> {macroNutrients.protein}g</p>
                <p><strong>Carbohydrates:</strong> {macroNutrients.carbohydrates.total}g (Fiber: {macroNutrients.carbohydrates.fiber}g, Sugars: {macroNutrients.carbohydrates.sugars}g)</p>
                <p><strong>Fat:</strong> {macroNutrients.fat.total}g (Saturated: {macroNutrients.fat.saturated}g, Unsaturated: {macroNutrients.fat.unsaturated}g)</p>
            </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-2xl">
          <h3 className="text-xl font-semibold mb-4 text-white">Food Items</h3>
          <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {items.map((item, index) => (
              <li key={index} className="flex justify-between items-baseline p-3 bg-gray-700/50 rounded-lg">
                <span className="font-medium text-gray-200">{item.name}</span>
                <span className="font-bold text-brand-light">{item.calories} kcal</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="bg-gray-800/50 p-6 rounded-2xl">
        <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2"><InfoIcon className="w-6 h-6 text-blue-400"/>Expert Analysis</h3>
        <div className="space-y-4 text-gray-300">
            <p><strong>Visual Observations:</strong> {analysis.visualObservations}</p>
            <p><strong>Portion Estimate:</strong> {analysis.portionEstimate}</p>
            <div>
              <strong>Confidence:</strong> {analysis.confidence}%
              <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${analysis.confidence}%` }}></div>
              </div>
            </div>
            <p className="text-sm text-gray-400 italic"><strong>Reasoning:</strong> {analysis.confidenceNarrative}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 p-6 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 text-white">Nutritional Insights</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
                {notes.map((note, index) => <li key={index}>{note}</li>)}
            </ul>
        </div>
        <div className="bg-yellow-900/40 border border-yellow-700 p-6 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 text-yellow-200 flex items-center gap-2"><CautionIcon className="w-6 h-6"/>Allergens & Cautions</h3>
            {analysis.cautions.length > 0 ? (
                <ul className="list-disc list-inside space-y-2 text-yellow-300">
                    {analysis.cautions.map((caution, index) => <li key={index}>{caution}</li>)}
                </ul>
            ) : <p className="text-yellow-300">No specific allergens or cautions identified.</p>}
        </div>
      </div>

      <div className="text-center pt-6 flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => onAddToLog(report)}
          className="bg-gradient-to-r from-brand-primary to-green-400 hover:from-brand-secondary hover:to-brand-primary text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300"
        >
          Add to Daily Log
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300"
        >
          Analyze Another Meal
        </button>
      </div>
    </div>
  );
};

export default NutritionReportDisplay;
