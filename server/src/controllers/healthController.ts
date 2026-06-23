import { Request, Response, NextFunction } from 'express';
import { integrityEngine } from '../services/integrityEngine';
import { prisma } from '../config/db';

export const getHealthDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { healthScore: true }
    });

    const anomalies = await prisma.dataAnomaly.findMany({
      where: { tenantId, status: 'OPEN' },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: {
        score: tenant?.healthScore || 100,
        anomalies,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const runFastScan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const result = await integrityEngine.runFastScan(tenantId);

    res.status(200).json({
      success: true,
      message: 'Fast scan completed',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const resolveAnomaly = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;

    await prisma.dataAnomaly.update({
      where: { id, tenantId },
      data: { status: 'RESOLVED', resolvedAt: new Date() }
    });

    res.status(200).json({ success: true, message: 'Anomaly marked as resolved' });
  } catch (error) {
    next(error);
  }
};
