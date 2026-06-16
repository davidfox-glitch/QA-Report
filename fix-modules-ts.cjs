const fs = require('fs');

const fixFile = (path, replaceFn) => {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, 'utf8');
  content = replaceFn(content);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Fixed', path);
};

// AnalyticsView.tsx
fixFile('src/components/analytics/AnalyticsView.tsx', c => c.replace(/row\.moduleName/g, "(modules.find(m => m.id === row.moduleId)?.name || 'General')"));

// ArchiveView.tsx
fixFile('src/components/dashboard/ArchiveView.tsx', c => c.replace(/row\.attachments/g, '[]').replace(/row\.moduleName/g, "(modules.find(m => m.id === row.moduleId)?.name || 'General')"));

// PrintReportView.tsx
fixFile('src/components/dashboard/PrintReportView.tsx', c => c.replace(/row\.url/g, "''").replace(/row\.moduleName/g, "(modules.find(m => m.id === row.moduleId)?.name || 'General')"));

// TrashView.tsx
fixFile('src/components/dashboard/TrashView.tsx', c => c.replace(/row\.moduleName/g, "(modules.find(m => m.id === row.moduleId)?.name || 'General')"));

// NotesSidebar.tsx
fixFile('src/components/notes/NotesSidebar.tsx', c => c.replace(/activeRow\.moduleName/g, "(modules.find(m => m.id === activeRow.moduleId)?.name || 'General')"));

// aiSummary.ts
fixFile('src/utils/aiSummary.ts', c => c.replace(/r\.moduleName/g, "(modules.find(m => m.id === r.moduleId)?.name || 'General')").replace(/row\.moduleName/g, "(modules.find(m => m.id === row.moduleId)?.name || 'General')"));

// exporters.ts
fixFile('src/utils/exporters.ts', c => c.replace(/row\.moduleName/g, "(modules.find(m => m.id === row.moduleId)?.name || 'General')"));

// importers.ts
fixFile('src/utils/importers.ts', c => c.replace(/moduleName: raw\.moduleName \|\| raw\['Module'\] \|\| '',/g, "moduleId: raw.moduleName || raw['Module'] || '',").replace(/r\.moduleName/g, "r.moduleId"));

console.log('Done!');
