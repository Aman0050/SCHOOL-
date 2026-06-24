import { Request, Response, NextFunction } from 'express';
import { exportQueue } from '../workers/exportQueue';
import { communicationQueue } from '../workers/communicationQueue';

export const getJobStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Check export queue
    let job = await exportQueue.getJob(id);
    
    // Check communication queue
    if (!job) {
      job = await communicationQueue.getJob(id);
    }
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    const state = await job.getState();
    const progress = job.progress;
    const failedReason = job.failedReason;
    const returnvalue = job.returnvalue;
    
    res.json({
      success: true,
      data: {
        id: job.id,
        state,
        progress,
        failedReason,
        returnvalue
      }
    });
  } catch (error) {
    next(error);
  }
};
