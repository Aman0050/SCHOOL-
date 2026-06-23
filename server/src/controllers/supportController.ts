import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../errors/AppError';

const dbRaw = new PrismaClient();

// ==================== TENANT SUPPORT TICKETS ====================

export const getTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const tickets = await dbRaw.supportTicket.findMany({
      where: { tenantId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { messages: true } }
      }
    });
    res.json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

export const createTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;
    const { title, description, category, priority } = req.body;

    if (!title || !description) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Title and description are required');
    }

    const ticket = await dbRaw.$transaction(async (tx) => {
      const t = await tx.supportTicket.create({
        data: {
          tenantId,
          title,
          description,
          category: category || 'TECHNICAL',
          priority: priority || 'MEDIUM',
          status: 'OPEN',
        }
      });

      await tx.ticketMessage.create({
        data: {
          ticketId: t.id,
          senderId: userId,
          content: description
        }
      });

      return t;
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

export const getTicketMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;

    const ticket = await dbRaw.supportTicket.findFirst({
      where: { id, tenantId },
      include: {
        messages: {
          include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) throw new AppError(404, 'NOT_FOUND', 'Ticket not found');

    res.json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

export const replyToTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;
    const { content } = req.body;

    if (!content) throw new AppError(400, 'VALIDATION_ERROR', 'Message content is required');

    const ticket = await dbRaw.supportTicket.findFirst({ where: { id, tenantId } });
    if (!ticket) throw new AppError(404, 'NOT_FOUND', 'Ticket not found');

    const message = await dbRaw.$transaction(async (tx) => {
      const msg = await tx.ticketMessage.create({
        data: {
          ticketId: id,
          senderId: userId,
          content
        },
        include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } }
      });

      await tx.supportTicket.update({
        where: { id },
        data: { updatedAt: new Date(), status: 'IN_PROGRESS' }
      });

      return msg;
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};
