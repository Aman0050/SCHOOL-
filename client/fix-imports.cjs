const fs = require('fs');

const files = [
  'src/features/examinations/components/ExamSetup.tsx',
  'src/features/examinations/components/MarksEntryUI.tsx',
  'src/features/fees/api/feeApi.ts',
  'src/features/fees/components/FeeCategories.tsx',
  'src/features/fees/components/FeeCollection.tsx',
  'src/features/fees/components/FeeStructures.tsx',
  'src/features/fees/components/FineManagement.tsx',
  'src/features/fees/components/StudentFeeProfile.tsx',
  'src/features/super-admin/SuperAdminLayout.tsx',
  'src/features/super-admin/SuperDashboard.tsx',
  'src/features/super-admin/api/superAdminApi.ts',
  'src/features/examinations/api/examApi.ts',
  'src/features/parent-portal/api/parentApi.ts',
  'src/features/parent-portal/HomeworkView.tsx',
  'src/features/parent-portal/CommunicationCenter.tsx',
  'src/features/parent-portal/DashboardHome.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+\.types)['"]/g, 'import type { $1 } from \'$2\'');
    fs.writeFileSync(file, content);
    console.log('Fixed ' + file);
  }
});
