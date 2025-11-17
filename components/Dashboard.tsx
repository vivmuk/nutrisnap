import React, { useMemo } from 'react';
import useFoodLog from '../hooks/useFoodLog';
import { format, addDays, isToday } from 'date-fns';
import MacroChart from './MacroChart';

interface DashboardProps {
  foodLog: ReturnType<typeof useFoodLog>;
  onSwitchToAnalyzer: () => void;
}

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
);


const DateNavigator: React.FC<{ currentDate: Date, setCurrentDate: (date: Date) => void }> = ({ currentDate, setCurrentDate }) => {
    return (
        <div className="flex items-center justify-center space-x-4 mb-6">
            <button onClick={() => setCurrentDate(addDays(currentDate, -1))} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">&lt;</button>
            <h2 className="text-xl font-semibold text-center">{isToday(currentDate) ? 'Today' : format(currentDate, 'MMM d, yyyy')}</h2>
            <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors" disabled={isToday(currentDate)}>&gt;</button>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ foodLog, onSwitchToAnalyzer }) => {
    const { logs, currentDate, setCurrentDate, logsForCurrentDate, deleteFoodLog } = foodLog;

    const dailyTotals = useMemo(() => {
        return logsForCurrentDate.reduce((acc, log) => {
            acc.calories += log.totalCalories;
            acc.protein += log.macroNutrients.protein;
            acc.carbs += log.macroNutrients.carbohydrates.total;
            acc.fat += log.macroNutrients.fat.total;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }, [logsForCurrentDate]);

    const CALORIE_GOAL = 2000;
    const calorieProgress = Math.min((dailyTotals.calories / CALORIE_GOAL) * 100, 100);

    return (
        <div className="space-y-6 animate-fade-in">
            <DateNavigator currentDate={currentDate} setCurrentDate={setCurrentDate} />
            
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-gray-800/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path className="text-gray-700" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-brand-primary" strokeWidth="3" strokeDasharray={`${calorieProgress}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                             <span className="text-3xl font-bold">{dailyTotals.calories}</span>
                            <span className="text-sm text-gray-400 block">kcal</span>
                        </div>
                    </div>
                     <p className="mt-2 text-sm text-gray-400">Goal: {CALORIE_GOAL} kcal</p>
                </div>
                 <div className="md:col-span-2 bg-gray-800/50 p-6 rounded-2xl flex justify-around items-center">
                    <div className="text-center">
                        <p className="text-2xl font-bold">{dailyTotals.protein}g</p>
                        <p className="text-gray-400">Protein</p>
                    </div>
                     <div className="text-center">
                        <p className="text-2xl font-bold">{dailyTotals.carbs}g</p>
                        <p className="text-gray-400">Carbs</p>
                    </div>
                     <div className="text-center">
                        <p className="text-2xl font-bold">{dailyTotals.fat}g</p>
                        <p className="text-gray-400">Fat</p>
                    </div>
                </div>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Daily Log</h3>
                <button onClick={onSwitchToAnalyzer} className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-sm">
                    <PlusIcon className="w-4 h-4"/>
                    Add Meal
                </button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {logsForCurrentDate.length > 0 ? logsForCurrentDate.map(log => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                          <div>
                              <p className="font-medium text-gray-200">{log.dishName}</p>
                              <p className="text-sm text-gray-400">{log.totalCalories} kcal &bull; {log.macroNutrients.protein}P/{log.macroNutrients.carbohydrates.total}C/{log.macroNutrients.fat.total}F</p>
                          </div>
                          <button onClick={async () => {
                            try {
                              await deleteFoodLog(log.id);
                            } catch (error) {
                              console.error('Failed to delete food log:', error);
                            }
                          }} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                              <TrashIcon className="w-5 h-5"/>
                          </button>
                      </div>
                  )) : (
                      <div className="text-center py-8 text-gray-500">
                          <p>No meals logged for this day.</p>
                          <p className="text-sm">Add a meal to get started!</p>
                      </div>
                  )}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <MacroChart logs={logs} currentDate={currentDate} dataKey="protein" unit="g" name="Protein" fillColor="#10B981" />
                <MacroChart logs={logs} currentDate={currentDate} dataKey="carbs" unit="g" name="Carbohydrates" fillColor="#3B82F6" />
                <MacroChart logs={logs} currentDate={currentDate} dataKey="fat" unit="g" name="Fat" fillColor="#F59E0B" />
            </div>
        </div>
    );
};

export default Dashboard;
