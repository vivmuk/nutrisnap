import { Router, Request, Response } from 'express';
import { FoodLog } from '../models/FoodLog.js';
import { NutritionalReport } from '../types.js';
import { startOfDay, endOfDay } from 'date-fns';

const router = Router();

// Get all food logs (optionally filtered by date)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    
    let query: any = {};
    
    if (date) {
      const targetDate = new Date(date as string);
      const start = startOfDay(targetDate);
      const end = endOfDay(targetDate);
      query.date = { $gte: start, $lte: end };
    }

    const logs = await FoodLog.find(query).sort({ date: -1 });
    res.json(logs);
  } catch (error: any) {
    console.error('Error fetching food logs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch food logs',
      message: error.message 
    });
  }
});

// Add a new food log
router.post('/', async (req: Request, res: Response) => {
  try {
    const { report, date }: { report: NutritionalReport; date?: string } = req.body;

    if (!report) {
      return res.status(400).json({ error: 'Report is required' });
    }

    const logDate = date ? new Date(date) : new Date();
    
    const foodLog = new FoodLog({
      date: logDate,
      report,
    });

    const savedLog = await foodLog.save();
    res.status(201).json(savedLog);
  } catch (error: any) {
    console.error('Error saving food log:', error);
    res.status(500).json({ 
      error: 'Failed to save food log',
      message: error.message 
    });
  }
});

// Delete a food log
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const deletedLog = await FoodLog.findByIdAndDelete(id);
    
    if (!deletedLog) {
      return res.status(404).json({ error: 'Food log not found' });
    }

    res.json({ message: 'Food log deleted successfully', id });
  } catch (error: any) {
    console.error('Error deleting food log:', error);
    res.status(500).json({ 
      error: 'Failed to delete food log',
      message: error.message 
    });
  }
});

// Get food log by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const log = await FoodLog.findById(id);
    
    if (!log) {
      return res.status(404).json({ error: 'Food log not found' });
    }

    res.json(log);
  } catch (error: any) {
    console.error('Error fetching food log:', error);
    res.status(500).json({ 
      error: 'Failed to fetch food log',
      message: error.message 
    });
  }
});

export { router as foodLogsRouter };

