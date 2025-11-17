import { LoggedFoodItem, NutritionalReport } from '../types';
import { formatISO } from 'date-fns';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const getLogs = async (date?: string): Promise<LoggedFoodItem[]> => {
  try {
    const url = date 
      ? `${API_BASE_URL}/api/food-logs?date=${date}`
      : `${API_BASE_URL}/api/food-logs`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.statusText}`);
    }

    const logs = await response.json();
    // Transform MongoDB documents to LoggedFoodItem format
    return logs.map((log: any) => ({
      ...log.report,
      id: log._id || log.id,
      date: formatISO(new Date(log.date)),
    }));
  } catch (error) {
    console.error("Failed to fetch food logs from API", error);
    return [];
  }
};

export const addFoodLog = async (report: NutritionalReport, date: Date): Promise<LoggedFoodItem> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/food-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        report,
        date: formatISO(date),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to save log: ${response.statusText}`);
    }

    const savedLog = await response.json();
    return {
      ...savedLog.report,
      id: savedLog._id || savedLog.id,
      date: formatISO(new Date(savedLog.date)),
    };
  } catch (error) {
    console.error("Failed to save food log to API", error);
    throw error;
  }
};

export const deleteFoodLog = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/food-logs/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete log: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Failed to delete food log from API", error);
    throw error;
  }
};
