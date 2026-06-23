import { prisma } from '../config/db';

export const integrityEngine = {
  /**
   * Run a complete fast-scan for all data integrity issues across a tenant
   */
  async runFastScan(tenantId: string) {
    console.log(`[Integrity Engine] Starting fast scan for tenant: ${tenantId}`);
    
    // Clear old resolved anomalies
    await prisma.dataAnomaly.deleteMany({
      where: { tenantId, status: 'RESOLVED' }
    });

    const anomalies = [];

    // 1. Detect Orphaned Parent Relations (ParentStudent records where student or parent is soft-deleted or missing)
    const orphanParents = await prisma.$queryRaw<any[]>`
      SELECT "id", "parentId", "studentId" 
      FROM "ParentStudent" 
      WHERE "studentId" NOT IN (SELECT "id" FROM "User" WHERE "role" = 'STUDENT')
         OR "parentId" NOT IN (SELECT "id" FROM "User" WHERE "role" = 'PARENT');
    `;
    for (const orphan of orphanParents) {
      anomalies.push({
        tenantId,
        module: 'PARENT',
        severity: 'HIGH',
        issueType: 'ORPHAN',
        description: `Orphaned Parent-Student mapping found`,
        referenceId: orphan.id,
        referenceTable: 'ParentStudent',
        resolution: 'Delete the mapping or reassign to a valid User',
      });
    }

    // 2. Detect Duplicate Admission Numbers
    const duplicateAdmissions = await prisma.$queryRaw<any[]>`
      SELECT "admissionNumber", COUNT(*) as count 
      FROM "Admission" 
      WHERE "tenantId" = ${tenantId}
      GROUP BY "admissionNumber" 
      HAVING COUNT(*) > 1;
    `;
    for (const dup of duplicateAdmissions) {
      anomalies.push({
        tenantId,
        module: 'STUDENT',
        severity: 'HIGH',
        issueType: 'DUPLICATE',
        description: `Duplicate Admission Number: ${dup.admissionNumber}`,
        referenceTable: 'Admission',
        resolution: 'Update the admission number to ensure uniqueness',
      });
    }

    // 3. Detect Missing Classes for Active Students
    const studentsWithoutClass = await prisma.$queryRaw<any[]>`
      SELECT u."id", u."email" 
      FROM "User" u
      LEFT JOIN "StudentEnrollment" e ON u."id" = e."studentId" AND e."status" = 'ACTIVE'
      WHERE u."tenantId" = ${tenantId} 
        AND u."role" = 'STUDENT' 
        AND u."isActive" = true 
        AND e."id" IS NULL;
    `;
    for (const student of studentsWithoutClass) {
      anomalies.push({
        tenantId,
        module: 'ACADEMIC',
        severity: 'MEDIUM',
        issueType: 'ORPHAN',
        description: `Active student without an active class enrollment`,
        referenceId: student.id,
        referenceTable: 'User',
        resolution: 'Assign the student to an academic class',
      });
    }

    // 4. Detect Fee Ledgers without Valid Assignments
    const invalidFees = await prisma.$queryRaw<any[]>`
      SELECT fl."id" 
      FROM "FinancialLedger" fl
      LEFT JOIN "User" u ON fl."studentId" = u."id"
      WHERE fl."tenantId" = ${tenantId} AND u."id" IS NULL;
    `;
    for (const fee of invalidFees) {
      anomalies.push({
        tenantId,
        module: 'FEE',
        severity: 'HIGH',
        issueType: 'ORPHAN',
        description: `Fee ledger entry attached to a deleted or non-existent student`,
        referenceId: fee.id,
        referenceTable: 'FinancialLedger',
        resolution: 'Archive or delete the orphan ledger entry',
      });
    }

    // 5. Timetable Conflicts (Teacher double-booked)
    const timetableConflicts = await prisma.$queryRaw<any[]>`
      SELECT "teacherId", "dayOfWeek", "startTime", COUNT(*) as count
      FROM "TimetablePeriod"
      WHERE "tenantId" = ${tenantId} AND "teacherId" IS NOT NULL
      GROUP BY "teacherId", "dayOfWeek", "startTime"
      HAVING COUNT(*) > 1;
    `;
    for (const conflict of timetableConflicts) {
      anomalies.push({
        tenantId,
        module: 'TIMETABLE',
        severity: 'HIGH',
        issueType: 'CONSTRAINT_VIOLATION',
        description: `Teacher is double-booked on Day ${conflict.dayOfWeek} at ${conflict.startTime}`,
        referenceId: conflict.teacherId,
        referenceTable: 'TimetablePeriod',
        resolution: 'Modify the timetable to remove the overlap',
      });
    }

    // Save all detected anomalies to the database
    if (anomalies.length > 0) {
      await prisma.dataAnomaly.createMany({
        data: anomalies,
      });
    }

    // Calculate Health Score
    // Formula: Max 100. Deduct 5 for HIGH, 2 for MEDIUM, 0.5 for LOW
    let penalty = 0;
    for (const anomaly of anomalies) {
      if (anomaly.severity === 'HIGH') penalty += 5;
      else if (anomaly.severity === 'MEDIUM') penalty += 2;
      else penalty += 0.5;
    }
    const score = Math.max(0, 100 - penalty);

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { healthScore: score }
    });

    console.log(`[Integrity Engine] Scan complete. Found ${anomalies.length} anomalies. Score: ${score}`);
    return { anomaliesCount: anomalies.length, score };
  }
};
