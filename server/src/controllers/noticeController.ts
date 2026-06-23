import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== NOTICES & CIRCULARS ====================

export const getNotices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, role } = (req as any).user;
    let audienceFilter: any = {};

    // Filter by audience based on the requester's role
    if (role === 'PARENT' || role === 'STUDENT') {
      audienceFilter = { targetAudiences: { hasSome: ['ALL', 'PARENTS', 'STUDENTS'] } };
    } else if (role === 'TEACHER') {
      audienceFilter = { targetAudiences: { hasSome: ['ALL', 'TEACHERS'] } };
    }

    const notices = await prisma.notice.findMany({
      where: {
        tenantId: (req as any).tenantId!,
        ...audienceFilter
      },
      include: { attachments: true },
      orderBy: { publishDate: 'desc' }
    });

    res.json({ success: true, data: notices });
  } catch (error) {
    next(error);
  }
};

export const createNotice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, type, priority, publishDate, targetAudiences, attachments } = req.body;

    const notice = await prisma.$transaction(async (tx) => {
      const n = await tx.notice.create({
        data: {
          tenantId: (req as any).tenantId!,
          title,
          content,
          type: type || 'NOTICE',
          priority: priority || 'MEDIUM',
          publishDate: publishDate ? new Date(publishDate) : new Date(),
          targetAudiences: targetAudiences || ['ALL']
        }
      });

      if (attachments && Array.isArray(attachments)) {
        await tx.noticeAttachment.createMany({
          data: attachments.map(url => ({
            tenantId: (req as any).tenantId!,
            noticeId: n.id,
            fileUrl: url,
            fileType: 'FILE'
          }))
        });
      }

      return n;
    });

    res.status(201).json({ success: true, data: notice });
  } catch (error) {
    next(error);
  }
};
