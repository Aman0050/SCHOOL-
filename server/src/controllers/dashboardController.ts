import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboardService';
import { logger } from '../utils/logger';

export const dashboardController = {
  async getOverview(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

      const data = await dashboardService.getDashboardOverview(tenantId);
      res.json(data);
    } catch (error) {
      logger.error('Error fetching dashboard overview', { error });
      res.status(500).json({ error: 'Failed to fetch dashboard overview' });
    }
  },

  async getExecutiveKpis(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

      const data = await dashboardService.getExecutiveKpis(tenantId);
      res.json(data);
    } catch (error) {
      logger.error('Error fetching executive KPIs', { error });
      res.status(500).json({ error: 'Failed to fetch executive KPIs' });
    }
  },

  async getHealthScore(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

      const data = await dashboardService.getSchoolHealthScore(tenantId);
      res.json(data);
    } catch (error) {
      logger.error('Error fetching health score', { error });
      res.status(500).json({ error: 'Failed to fetch health score' });
    }
  },

  async getOperations(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

      const data = await dashboardService.getOperations(tenantId);
      res.json(data);
    } catch (error) {
      logger.error('Error fetching operations', { error });
      res.status(500).json({ error: 'Failed to fetch operations' });
    }
  },

  async getActivityFeed(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

      const data = await dashboardService.getActivityFeed(tenantId);
      res.json(data);
    } catch (error) {
      logger.error('Error fetching activity feed', { error });
      res.status(500).json({ error: 'Failed to fetch activity feed' });
    }
  },

  async getUpcomingEvents(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

      const data = await dashboardService.getUpcomingEvents(tenantId);
      res.json(data);
    } catch (error) {
      logger.error('Error fetching upcoming events', { error });
      res.status(500).json({ error: 'Failed to fetch upcoming events' });
    }
  }
};
