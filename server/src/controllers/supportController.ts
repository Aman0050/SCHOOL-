import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { getIO } from '../lib/socketManager';

export const createTicket = async (req: Request, res: Response) => {
  try {
    const { title, description, category, priority } = req.body;
    const userId = req.user!.id;
    const tenantId = req.user!.tenantId;

    const ticket = await prisma.supportTicket.create({
      data: {
        title,
        description,
        category,
        priority,
        tenantId,
        messages: {
          create: {
            content: description,
            senderId: userId
          }
        },
        activities: {
          create: {
            userId,
            action: 'CREATED',
            details: 'Ticket created by user'
          }
        }
      },
      include: {
        messages: true
      }
    });

    // Notify admins via communication queue
    const io = getIO();
    io.to(`role:${tenantId}:SCHOOL_ADMIN`).emit('ticket_created', ticket);
    
    // Attempt to queue a real email job (fire and forget)
    import('../workers/communicationQueue').then(({ communicationQueue }) => {
      communicationQueue.add('send-email', {
        to: 'admin@school.com',
        subject: `New Support Ticket: ${title}`,
        body: `A new ticket has been opened: ${description}`,
        tenantId
      }).catch(console.error);
    }).catch(console.error);

    res.status(201).json({ success: true, data: ticket });
  } catch (error: any) {
    console.error('Create ticket error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTickets = async (req: Request, res: Response) => {
  try {
    const { role, tenantId, id: userId } = req.user!;
    
    let tickets;
    if (role === 'SUPER_ADMIN') {
      tickets = await prisma.supportTicket.findMany({
        orderBy: { updatedAt: 'desc' },
        include: { tenant: { select: { name: true } }, assignedTo: { select: { firstName: true, lastName: true } } }
      });
    } else if (role === 'SCHOOL_ADMIN' || role === 'SUPPORT_AGENT') {
      tickets = await prisma.supportTicket.findMany({
        where: { tenantId },
        orderBy: { updatedAt: 'desc' },
        include: { assignedTo: { select: { firstName: true, lastName: true } } }
      });
    } else {
      tickets = await prisma.supportTicket.findMany({
        where: { tenantId, messages: { some: { senderId: userId } } },
        orderBy: { updatedAt: 'desc' }
      });
    }

    res.json({ success: true, data: tickets });
  } catch (error: any) {
    console.error('Get tickets error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTicketDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        messages: { include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } }, orderBy: { createdAt: 'asc' } },
        activities: { include: { user: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' } },
        attachments: true,
        assignedTo: { select: { firstName: true, lastName: true } }
      }
    });

    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedToId } = req.body;
    const userId = req.user!.id;

    const data: any = {};
    if (status) data.status = status;
    if (priority) data.priority = priority;
    if (assignedToId !== undefined) data.assignedToId = assignedToId;

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data,
    });

    await prisma.ticketActivity.create({
      data: {
        ticketId: id,
        userId,
        action: 'UPDATED',
        details: `Updated ticket properties: ${JSON.stringify(data)}`
      }
    });

    const io = getIO();
    io.to(`tenant:${ticket.tenantId}`).emit('ticket_updated', ticket);

    res.json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user!.id;

    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        senderId: userId,
        content
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true } }
      }
    });

    const io = getIO();
    io.to(`ticket:${id}`).emit('new_message', message);

    res.status(201).json({ success: true, data: message });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getKnowledgeBase = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    let articles;

    if (query) {
      articles = await prisma.knowledgeBaseArticle.findMany({
        where: {
          OR: [
            { title: { contains: String(query), mode: 'insensitive' } },
            { content: { contains: String(query), mode: 'insensitive' } },
            { category: { contains: String(query), mode: 'insensitive' } }
          ]
        },
        orderBy: { viewCount: 'desc' }
      });
    } else {
      articles = await prisma.knowledgeBaseArticle.findMany({
        orderBy: { viewCount: 'desc' },
        take: 20
      });
    }

    res.json({ success: true, data: articles });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSupportDashboardStats = async (req: Request, res: Response) => {
  try {
    const { tenantId, role } = req.user!;
    const filter = role === 'SUPER_ADMIN' ? {} : { tenantId };

    const openTickets = await prisma.supportTicket.count({ where: { ...filter, status: 'OPEN' } });
    const inProgressTickets = await prisma.supportTicket.count({ where: { ...filter, status: 'IN_PROGRESS' } });
    const resolvedTickets = await prisma.supportTicket.count({ where: { ...filter, status: 'RESOLVED' } });

    res.json({
      success: true,
      data: {
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
