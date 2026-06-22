import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { communicationQueue } from '../workers/communicationQueue';

// @desc    Get Communication Dashboard Stats
// @route   GET /api/communication/stats
// @access  Private (Admin/Principal)
export const getCommunicationStats = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const totalLogs = await prisma.communicationLog.count({ where: { tenantId } });
    const delivered = await prisma.communicationLog.count({ where: { tenantId, status: 'DELIVERED' } });
    const failed = await prisma.communicationLog.count({ where: { tenantId, status: 'FAILED' } });
    const read = await prisma.communicationLog.count({ where: { tenantId, status: 'READ' } });
    
    // Group by channel
    const channels = await prisma.communicationLog.groupBy({
      by: ['channel'],
      where: { tenantId },
      _count: { channel: true }
    });

    res.status(200).json({
      success: true,
      data: {
        totalSentToday: totalLogs, // Mocking "today" for simplicity
        deliveryRate: totalLogs > 0 ? ((delivered + read) / totalLogs) * 100 : 0,
        failedMessages: failed,
        readRate: totalLogs > 0 ? (read / totalLogs) * 100 : 0,
        channelBreakdown: channels
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new Campaign
// @route   POST /api/communication/campaigns
// @access  Private
export const createCampaign = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { name, type, channels, audience } = req.body;

    const campaign = await prisma.communicationCampaign.create({
      data: {
        tenantId,
        name,
        type,
        channels,
        audience,
        status: 'SCHEDULED',
        scheduledAt: new Date()
      }
    });

    // In a real system, a separate Campaign Worker would process the audience JSON,
    // fetch target users, and push individual jobs into the communicationQueue.
    // For this demonstration, we'll mock creating 5 target users and queueing them.
    
    for (let i = 0; i < 5; i++) {
      const log = await prisma.communicationLog.create({
        data: {
          tenantId,
          campaignId: campaign.id,
          userId: req.user!.id, // Mocking sending to self
          channel: channels[0] || 'WHATSAPP',
          status: 'PENDING'
        }
      });

      // Push to BullMQ
      await communicationQueue.add('send-message', {
        logId: log.id,
        channel: log.channel,
        target: 'mock_number',
        content: `Campaign: ${campaign.name}`
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 }
      });
    }

    res.status(201).json({
      success: true,
      data: campaign,
      message: 'Campaign scheduled and messages queued.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Campaigns
// @route   GET /api/communication/campaigns
// @access  Private
export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    
    const campaigns = await prisma.communicationCampaign.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: campaigns });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
