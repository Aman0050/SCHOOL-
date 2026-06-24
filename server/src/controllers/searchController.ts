import { Request, Response } from 'express';
import prisma from '../config/db';
import { getOrSetCache } from '../config/redis';

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user;
    const q = req.query.q as string;

    if (!q || q.length < 2) {
      return res.json({ data: [] });
    }

    const searchQuery = q.trim();
    const cacheKey = `search:${tenantId}:${searchQuery.toLowerCase()}`;
    
    // Cache for 5 minutes
    const results = await getOrSetCache(cacheKey, 300, async () => {
      // Execute searches in parallel
      const [students, teachers, fees, exams] = await Promise.all([
        prisma.user.findMany({
          where: {
            tenantId,
            role: 'STUDENT',
            OR: [
              { firstName: { contains: searchQuery, mode: 'insensitive' } },
              { lastName: { contains: searchQuery, mode: 'insensitive' } },
              { admission: { admissionNumber: { contains: searchQuery, mode: 'insensitive' } } },
            ],
          },
          include: { admission: true, profile: true, enrollments: { include: { class: true } } },
          take: 5,
        }),
        prisma.user.findMany({
          where: {
            tenantId,
            role: 'TEACHER',
            OR: [
              { firstName: { contains: searchQuery, mode: 'insensitive' } },
              { lastName: { contains: searchQuery, mode: 'insensitive' } },
              { email: { contains: searchQuery, mode: 'insensitive' } },
            ],
          },
          include: { profile: true },
          take: 5,
        }),
        prisma.feeCollection.findMany({
          where: {
            tenantId,
            OR: [
              { receiptNumber: { contains: searchQuery, mode: 'insensitive' } },
              { student: { firstName: { contains: searchQuery, mode: 'insensitive' } } },
              { student: { lastName: { contains: searchQuery, mode: 'insensitive' } } },
            ],
          },
          include: { student: { select: { firstName: true, lastName: true } } },
          take: 5,
        }),
        prisma.exam.findMany({
          where: {
            tenantId,
            name: { contains: searchQuery, mode: 'insensitive' },
          },
          include: { class: true },
          take: 5,
        }),
      ]);

      const formattedResults = [
        ...students.map((s) => ({
          id: `stu-${s.id}`,
          type: 'student',
          title: `${s.firstName} ${s.lastName}`,
          subtitle: `${s.enrollments?.[0]?.class?.name || 'No Class'} • ${s.admission?.admissionNumber || 'No Adm No'}`,
          avatarUrl: s.profile?.avatarUrl,
          data: s.id,
        })),
        ...teachers.map((t) => ({
          id: `tch-${t.id}`,
          type: 'teacher',
          title: `${t.firstName} ${t.lastName}`,
          subtitle: `${t.email} • Staff Directory`,
          avatarUrl: t.profile?.avatarUrl,
          data: t.id,
        })),
        ...fees.map((f) => ({
          id: `fee-${f.id}`,
          type: 'fee',
          title: `Receipt ${f.receiptNumber}`,
          subtitle: `Payment by ${f.student.firstName} ${f.student.lastName} • ₹${f.amountPaid}`,
          data: f.id,
        })),
        ...exams.map((e) => ({
          id: `exm-${e.id}`,
          type: 'exam',
          title: e.name,
          subtitle: `${e.class?.name || 'Multiple Classes'} • ${e.examType}`,
          data: e.id,
        })),
      ];

      return formattedResults;
    });

    res.json({ data: results });
  } catch (error) {
    console.error('Global Search Error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
};
