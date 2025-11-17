import React, { useState } from 'react';
import { NutritionalReport } from '../types';

interface ManualAddFormProps {
    onAdd: (report: NutritionalReport) => void;
    onCancel: () => void;
}

const ManualAddForm: React.FC<ManualAddFormProps> = ({ onAdd, onCancel }) => {
    const [name, setName] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const parsedCalories = parseInt(calories) || 0;
        const parsedProtein = parseInt(protein) || 0;
        const parsedCarbs = parseInt(carbs) || 0;
        const parsedFat = parseInt(fat) || 0;

        // Create a minimal NutritionalReport object
        const manualReport: NutritionalReport = {
            dishName: name,
            totalCalories: parsedCalories,
            macroNutrients: {
                protein: parsedProtein,
                carbohydrates: { total: parsedCarbs, fiber: 0, sugars: 0 },
                fat: { total: parsedFat, saturated: 0, unsaturated: 0 },
            },
            microNutrients: { vitamins: 'N/A', minerals: 'N/A' },
            items: [{
                name: name,
                calories: parsedCalories,
                weightGrams: 0,
                macronutrients: {
                    protein: parsedProtein,
                    carbohydrates: { total: parsedCarbs, fiber: 0, sugars: 0 },
                    fat: { total: parsedFat, saturated: 0, unsaturated: 0 },
                }
            }],
            notes: ['Manually added item.'],
            analysis: {
                visualObservations: 'N/A',
                portionEstimate: 'N/A',
                confidence: 100,
                confidenceNarrative: 'Manually added by user.',
                cautions: [],
            },
        };
        onAdd(manualReport);
    };

    return (
        <div className="w-full p-4 md:p-8 bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-2xl animate-slide-in-up">
            <h3 className="text-xl font-medium text-center text-gray-200 mb-6">Add Food Manually</h3>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-400">Food Name</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="calories" className="block text-sm font-medium text-gray-400">Calories (kcal)</label>
                        <input type="number" id="calories" value={calories} onChange={e => setCalories(e.target.value)} required className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                </div>
                 <div className="grid grid-cols-3 gap-4">
                     <div>
                        <label htmlFor="protein" className="block text-sm font-medium text-gray-400">Protein (g)</label>
                        <input type="number" id="protein" value={protein} onChange={e => setProtein(e.target.value)} required className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                     <div>
                        <label htmlFor="carbs" className="block text-sm font-medium text-gray-400">Carbs (g)</label>
                        <input type="number" id="carbs" value={carbs} onChange={e => setCarbs(e.target.value)} required className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                     <div>
                        <label htmlFor="fat" className="block text-sm font-medium text-gray-400">Fat (g)</label>
                        <input type="number" id="fat" value={fat} onChange={e => setFat(e.target.value)} required className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                     <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Cancel</button>
                    <button type="submit" className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors">Add to Log</button>
                </div>
            </form>
        </div>
    );
};

export default ManualAddForm;
