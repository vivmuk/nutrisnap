import React, { useMemo } from 'react';
import { LoggedFoodItem } from '../types';
import { format, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MacroChartProps {
    logs: LoggedFoodItem[];
    currentDate: Date;
    dataKey: 'protein' | 'carbs' | 'fat';
    unit: string;
    name: string;
    fillColor: string;
}

const CustomTooltip = ({ active, payload, label, unit, name }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-700 p-2 border border-gray-600 rounded-md shadow-lg">
        <p className="label text-gray-300 font-semibold">{`${label}`}</p>
        <p className="intro text-white">{`${name}: ${payload[0].value}${unit}`}</p>
      </div>
    );
  }
  return null;
};

const MacroChart: React.FC<MacroChartProps> = ({ logs, currentDate, dataKey, unit, name, fillColor }) => {
    const data = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            const date = subDays(currentDate, 6 - i);
            const dateKey = format(date, 'yyyy-MM-dd');
            const dayLogs = logs.filter(log => log.date.startsWith(dateKey));
            
            let totalValue = 0;
            if (dataKey === 'protein') {
                totalValue = dayLogs.reduce((sum, log) => sum + (log.macroNutrients?.protein || 0), 0);
            } else if (dataKey === 'carbs') {
                totalValue = dayLogs.reduce((sum, log) => sum + (log.macroNutrients?.carbohydrates?.total || 0), 0);
            } else if (dataKey === 'fat') {
                totalValue = dayLogs.reduce((sum, log) => sum + (log.macroNutrients?.fat?.total || 0), 0);
            }
            
            return {
                name: format(date, 'EEE'),
                [dataKey]: totalValue
            };
        });
    }, [logs, currentDate, dataKey]);

    return (
        <div className="bg-gray-800/50 p-4 rounded-2xl">
            <h3 className="text-lg font-semibold mb-4 text-white text-center">{name} Intake</h3>
            <div className="h-60">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                        <XAxis dataKey="name" stroke="#9CA3AF"/>
                        <YAxis stroke="#9CA3AF" unit={unit}/>
                        <Tooltip content={<CustomTooltip unit={unit} name={name} />} cursor={{fill: 'rgba(107, 114, 128, 0.2)'}}/>
                        <Bar dataKey={dataKey} name={name} fill={fillColor} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MacroChart;
