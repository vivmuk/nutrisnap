import { useState, useEffect, useMemo } from 'react';
import { LoggedFoodItem, NutritionalReport } from '../types';
import * as logService from '../services/logService';
import { format, startOfDay } from 'date-fns';

const useFoodLog = () => {
  const [logs, setLogs] = useState<LoggedFoodItem[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(startOfDay(new Date()));
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    loadLogsForDate(currentDate);
  }, [currentDate]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const allLogs = await logService.getLogs();
      setLogs(allLogs);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLogsForDate = async (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setLoading(true);
    try {
      const dateLogs = await logService.getLogs(dateKey);
      // Update logs for the current date while preserving others
      setLogs(prevLogs => {
        const otherLogs = prevLogs.filter(log => !log.date.startsWith(dateKey));
        return [...otherLogs, ...dateLogs];
      });
    } catch (error) {
      console.error('Failed to load logs for date:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFoodLog = async (report: NutritionalReport) => {
    try {
      const newLog = await logService.addFoodLog(report, currentDate);
      setLogs(prevLogs => [...prevLogs, newLog]);
    } catch (error) {
      console.error('Failed to add food log:', error);
      throw error;
    }
  };
  
  const deleteFoodLog = async (id: string) => {
    try {
      await logService.deleteFoodLog(id);
      setLogs(prevLogs => prevLogs.filter(log => log.id !== id));
    } catch (error) {
      console.error('Failed to delete food log:', error);
      throw error;
    }
  };
  
  const logsForCurrentDate = useMemo(() => {
     const dateKey = format(currentDate, 'yyyy-MM-dd');
     return logs.filter(log => log.date.startsWith(dateKey));
  }, [logs, currentDate]);

  return {
    logs,
    currentDate,
    setCurrentDate,
    addFoodLog,
    deleteFoodLog,
    logsForCurrentDate,
    loading,
    refreshLogs: loadLogs,
  };
};

export default useFoodLog;
