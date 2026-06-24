const fs = require('fs');
let content = fs.readFileSync('prisma/schema.prisma', 'utf-8');

const replacements = [
  {
    target: '  @@unique([userId, date, classId])\n}',
    replace: '  @@unique([userId, date, classId])\n  @@index([tenantId])\n  @@index([userId])\n  @@index([date])\n}'
  },
  {
    target: '  @@unique([parentId, studentId])\n}',
    replace: '  @@unique([parentId, studentId])\n  @@index([tenantId])\n  @@index([parentId])\n  @@index([studentId])\n}'
  },
  {
    target: '  @@unique([tenantId, receiptNumber])\n}',
    replace: '  @@unique([tenantId, receiptNumber])\n  @@index([tenantId])\n  @@index([studentId])\n  @@index([status])\n}'
  },
  {
    target: '  @@unique([studentId, feeStructureId, academicYear])\n}',
    replace: '  @@unique([studentId, feeStructureId, academicYear])\n  @@index([tenantId])\n  @@index([studentId])\n}'
  },
  {
    target: '  assignment StudentFeeAssignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)\n}',
    replace: '  assignment StudentFeeAssignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)\n\n  @@index([tenantId])\n  @@index([status])\n}'
  },
  {
    target: '  collection FeeCollection @relation(fields: [collectionId], references: [id], onDelete: Cascade)\n}',
    replace: '  collection FeeCollection @relation(fields: [collectionId], references: [id], onDelete: Cascade)\n\n  @@index([tenantId])\n  @@index([status])\n}'
  },
  {
    target: '  student User  @relation(fields: [studentId], references: [id], onDelete: Cascade)\n}',
    replace: '  student User  @relation(fields: [studentId], references: [id], onDelete: Cascade)\n\n  @@index([tenantId])\n  @@index([studentId])\n}'
  },
  {
    target: '  @@unique([examId, subjectId, studentId])\n}',
    replace: '  @@unique([examId, subjectId, studentId])\n  @@index([tenantId])\n  @@index([studentId])\n  @@index([examId])\n}'
  },
  {
    target: '  @@unique([examId, studentId, subjectId])\n}',
    replace: '  @@unique([examId, studentId, subjectId])\n  @@index([tenantId])\n  @@index([studentId])\n  @@index([examId])\n}'
  },
  {
    target: '  @@unique([examId, studentId])\n}',
    replace: '  @@unique([examId, studentId])\n  @@index([tenantId])\n  @@index([studentId])\n  @@index([examId])\n}'
  },
  {
    target: '  @@unique([teacherId, classId])\n}',
    replace: '  @@unique([teacherId, classId])\n  @@index([tenantId])\n  @@index([teacherId])\n}'
  },
  {
    target: '  teacher User?        @relation("TeacherTimetable", fields: [teacherId], references: [id])\n}',
    replace: '  teacher User?        @relation("TeacherTimetable", fields: [teacherId], references: [id])\n\n  @@index([tenantId])\n  @@index([teacherId])\n}'
  },
  {
    target: '  submissions HomeworkSubmission[]\n}',
    replace: '  submissions HomeworkSubmission[]\n\n  @@index([tenantId])\n  @@index([teacherId])\n}'
  }
];

let modified = false;
for (const r of replacements) {
  if (content.includes(r.target)) {
    content = content.replace(r.target, r.replace);
    modified = true;
    console.log("Replaced pattern for:", r.target.substring(0, 40).replace(/\n/g, ' '));
  } else {
    console.log("Pattern not found:", r.target.substring(0, 40).replace(/\n/g, ' '));
  }
}

if (modified) {
  fs.writeFileSync('prisma/schema.prisma', content);
  console.log("Successfully updated schema.prisma");
}
