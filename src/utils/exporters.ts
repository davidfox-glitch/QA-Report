import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType, AlignmentType, BorderStyle } from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useStore, TestRow, ProjectSettings, CustomFieldDef, Module } from '../store/useStore';

// ----------------------------------------------------
// 1. EXCEL EXPORTER
// ----------------------------------------------------
export const exportToExcel = (rows: TestRow[], settings: ProjectSettings, customFieldsDef: CustomFieldDef[]) => {
  const { modules } = useStore.getState();
  const formattedRows = rows.map((row) => {
    const customFieldsData: Record<string, any> = {};
    customFieldsDef.forEach((def) => {
      customFieldsData[def.name] = row.customFields[def.id] || '';
    });

    const notesSummary = row.notes.map((n) => `[${n.timestamp}] ${n.text}`).join('\n');

    return {
      'Test Point': row.testPoint,
      'Module Name': modules.find(m => m.id === row.moduleId)?.name || 'General Module',
      'How To Test': row.howToTest,
      'Expected Result': row.expectedResult,
      'Actual Result': row.actualResult,
      'Functionality Status': row.functionalityStatus,
      'Testing Status': row.testingStatus,
      'Priority': row.priority,
      'Assigned Users': row.assignedUsers?.join(', ') || 'Unassigned',
      'Last Updated': row.lastUpdated,
      'Notes History': notesSummary,
      ...customFieldsData
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'QA Status Tracker');

  // Adjust column widths
  worksheet['!cols'] = [
    { wch: 30 }, // Test Point
    { wch: 20 }, // Module Name
    { wch: 30 }, // How To Test
    { wch: 30 }, // Expected
    { wch: 30 }, // Actual
    { wch: 18 }, // Functionality
    { wch: 15 }, // Testing Status
    { wch: 10 }, // Priority
    { wch: 15 }, // Assigned User
    { wch: 18 }, // Last Updated
    { wch: 40 }, // Notes
    { wch: 20 }  // Attachments
  ];

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  
  const url = window.URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${settings.projectName.replace(/\s+/g, '_')}_QA_Report.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};

// ----------------------------------------------------
// 2. DOCX EXPORTER (Executive Layout)
// ----------------------------------------------------
export const exportToDocx = async (
  rows: TestRow[],
  settings: ProjectSettings,
  customFieldsDef: CustomFieldDef[],
  aiSummaryResult?: {
    testingSummary: string;
    progressSummary: string;
    riskAssessment: string;
    pendingTasksSummary: string;
  }
) => {
  const { modules } = useStore.getState();
  const total = rows.length;
  const passed = rows.filter(r => r.testingStatus === 'Passed').length;
  const failed = rows.filter(r => r.testingStatus === 'Failed').length;
  const pending = rows.filter(r => r.testingStatus === 'Pending').length;
  const inProgress = rows.filter(r => r.testingStatus === 'In Progress').length;
  const completionRate = total > 0 ? Math.round(((passed + failed) / total) * 100) : 0;

  // Build the items tables
  const createItemTable = (filteredRows: TestRow[]) => {
    const tableHeaderCells = [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Test Case / Module', bold: true, color: 'FFFFFF' })] })], width: { size: 35, type: WidthType.PERCENTAGE }, shading: { fill: '4F46E5' } }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Dev Status', bold: true, color: 'FFFFFF' })] })], width: { size: 20, type: WidthType.PERCENTAGE }, shading: { fill: '4F46E5' } }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'QA Status', bold: true, color: 'FFFFFF' })] })], width: { size: 20, type: WidthType.PERCENTAGE }, shading: { fill: '4F46E5' } }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Priority', bold: true, color: 'FFFFFF' })] })], width: { size: 10, type: WidthType.PERCENTAGE }, shading: { fill: '4F46E5' } }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Assignee', bold: true, color: 'FFFFFF' })] })], width: { size: 15, type: WidthType.PERCENTAGE }, shading: { fill: '4F46E5' } })
    ];

    const tableRows = filteredRows.map((row) => {
      return new TableRow({
        children: [
          new TableCell({ children: [
            new Paragraph({ children: [new TextRun({ text: row.testPoint, bold: true })] }),
            new Paragraph({ children: [new TextRun({ text: `Module: ${modules.find((m: Module) => m.id === row.moduleId)?.name || 'General Module'}`, size: 18, color: '666666' })] })
          ] }),
          new TableCell({ children: [new Paragraph({ text: row.functionalityStatus })] }),
          new TableCell({ children: [new Paragraph({ text: row.testingStatus })] }),
          new TableCell({ children: [new Paragraph({ text: row.priority })] }),
          new TableCell({ children: [new Paragraph({ text: row.assignedUsers?.join(', ') || 'Unassigned' })] })
        ]
      });
    });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: 'D0D0D0' },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D0D0D0' },
        left: { style: BorderStyle.SINGLE, size: 1, color: 'D0D0D0' },
        right: { style: BorderStyle.SINGLE, size: 1, color: 'D0D0D0' },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
      },
      rows: [new TableRow({ children: tableHeaderCells }), ...tableRows]
    });
  };

  // Compile project notes
  const notesParagraphs: Paragraph[] = [];
  rows.filter(r => r.notes.length > 0).forEach((row) => {
    notesParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text: `${row.testPoint} (Module: ${modules.find((m: Module) => m.id === row.moduleId)?.name || 'General Module'})`, bold: true, size: 22 })],
        spacing: { before: 150, after: 50 }
      })
    );
    row.notes.forEach((note) => {
      notesParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: `[${note.timestamp}] `, color: '666666', size: 18 }),
            new TextRun({ text: note.text, size: 20 })
          ],
          bullet: { level: 0 }
        })
      );
    });
  });

  const docChildren: any[] = [
    // Branded Header Title Page
    new Paragraph({
      children: [new TextRun({ text: settings.projectName, bold: true, size: 48, color: '1E293B' })],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      children: [new TextRun({ text: `Enterprise QA Testing Audit Report`, bold: true, size: 28, color: '4F46E5' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 }
    }),
    new Paragraph({
      children: [new TextRun({ text: `Company: ${settings.clientName}`, size: 20, color: '475569' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    }),
    new Paragraph({
      children: [new TextRun({ text: `Date: ${new Date().toLocaleDateString()} • System Audit Summary`, size: 18, color: '64748B' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 }
    }),

    // Section 1: Project Information
    new Paragraph({
      children: [new TextRun({ text: '1. Project Information', bold: true, size: 28, color: '0F172A' })],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      children: [new TextRun({ text: settings.projectDescription || 'No description provided.', size: 20 })],
      spacing: { after: 200 }
    }),

    // Section 2 & 3: Testing Overview & Completion Percentage
    new Paragraph({
      children: [new TextRun({ text: '2. Testing Overview & Statistics', bold: true, size: 28, color: '0F172A' })],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `• Total Test Points Scheduled: `, bold: true }),
        new TextRun({ text: `${total}\n` }),
        new TextRun({ text: `• Verified passed cases: `, bold: true }),
        new TextRun({ text: `${passed} (${Math.round((passed/total)*100) || 0}%)\n` }),
        new TextRun({ text: `• Active reported defects: `, bold: true }),
        new TextRun({ text: `${failed} (${Math.round((failed/total)*100) || 0}%)\n` }),
        new TextRun({ text: `• Works in Progress: `, bold: true }),
        new TextRun({ text: `${inProgress}\n` }),
        new TextRun({ text: `• Pending audits: `, bold: true }),
        new TextRun({ text: `${pending}\n` }),
        new TextRun({ text: `• Audit Completion Rate: `, bold: true }),
        new TextRun({ text: `${completionRate}%\n` }),
      ],
      spacing: { after: 200 }
    }),

    // Section 4: Passed Items
    new Paragraph({
      children: [new TextRun({ text: '3. Passed Test Cases', bold: true, size: 24, color: '0F172A' })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 150, after: 100 }
    })
  ];

  const passedItems = rows.filter(r => r.testingStatus === 'Passed');
  if (passedItems.length > 0) {
    docChildren.push(createItemTable(passedItems));
  } else {
    docChildren.push(new Paragraph({ children: [new TextRun({ text: 'No test cases are currently passing.', italics: true })] }));
  }

  // Section 5: Failed Items
  docChildren.push(
    new Paragraph({
      children: [new TextRun({ text: '4. Failed Test Cases (Active Bugs)', bold: true, size: 24, color: '0F172A' })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 }
    })
  );

  const failedItems = rows.filter(r => r.testingStatus === 'Failed');
  if (failedItems.length > 0) {
    docChildren.push(createItemTable(failedItems));
  } else {
    docChildren.push(new Paragraph({ children: [new TextRun({ text: 'Zero active defects detected.', italics: true })] }));
  }

  // Section 6: Pending/In Progress
  docChildren.push(
    new Paragraph({
      children: [new TextRun({ text: '5. Pending & In-Progress Reviews', bold: true, size: 24, color: '0F172A' })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 }
    })
  );

  const pendingItems = rows.filter(r => r.testingStatus === 'Pending' || r.testingStatus === 'In Progress');
  if (pendingItems.length > 0) {
    docChildren.push(createItemTable(pendingItems));
  } else {
    docChildren.push(new Paragraph({ children: [new TextRun({ text: 'All test points have been fully resolved.', italics: true })] }));
  }

  // Section 7: Risk Assessment
  const criticalCount = rows.filter(r => r.priority === 'Critical' && r.testingStatus === 'Failed').length;
  const highCount = rows.filter(r => r.priority === 'High' && r.testingStatus === 'Failed').length;
  const riskStatus = criticalCount > 0 ? 'HIGH' : highCount > 0 ? 'MEDIUM' : 'LOW';

  docChildren.push(
    new Paragraph({
      children: [new TextRun({ text: '6. Risk Assessment', bold: true, size: 28, color: '0F172A' })],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Calculated Project Risk: `, bold: true }),
        new TextRun({ text: `${riskStatus}\n\n`, bold: true, color: riskStatus === 'HIGH' ? 'EF4444' : riskStatus === 'MEDIUM' ? 'F59E0B' : '10B981' }),
        new TextRun({ text: `The project status exhibits ${criticalCount} Critical and ${highCount} High priority failures. Deployment sprints should be adjusted to address core blockers.` })
      ],
      spacing: { after: 200 }
    })
  );

  // Section 8: Notes Timeline
  if (notesParagraphs.length > 0) {
    docChildren.push(
      new Paragraph({
        children: [new TextRun({ text: '7. Audit Review Comments', bold: true, size: 28, color: '0F172A' })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 }
      }),
      ...notesParagraphs
    );
  }

  // Section 9: AI Summary
  if (aiSummaryResult) {
    docChildren.push(
      new Paragraph({
        children: [new TextRun({ text: '8. AI Testing Insights Summary', bold: true, size: 28, color: '0F172A' })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Testing Summary:\n', bold: true }),
          new TextRun({ text: aiSummaryResult.testingSummary.replace(/[#*`]/g, '') + '\n\n' }),
          new TextRun({ text: 'Risk & Progress Overview:\n', bold: true }),
          new TextRun({ text: aiSummaryResult.riskAssessment.replace(/[#*`]/g, '') })
        ],
        spacing: { after: 200 }
      })
    );
  }

  // Section 10: Recommendations
  docChildren.push(
    new Paragraph({
      children: [new TextRun({ text: '9. Actionable Recommendations', bold: true, size: 28, color: '0F172A' })],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `1. Hotfix active bugs immediately to clear launch-critical criteria.\n` }),
        new TextRun({ text: `2. Allocate additional QA verification for pending backlog items.\n` }),
        new TextRun({ text: `3. Synchronize development and QA schedules on upcoming milestones.` })
      ],
      spacing: { after: 200 }
    })
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children: docChildren
    }]
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${settings.projectName.replace(/\s+/g, '_')}_QA_Report.docx`;
  a.click();
  window.URL.revokeObjectURL(url);
};

// ----------------------------------------------------
// 3. PDF EXPORTER (Optimized Canvas Pager)
// ----------------------------------------------------
export const exportToPdf = async (elementId: string, projectName: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Target printable element not found');
    return;
  }

  // Momentarily style element for high fidelity printing
  const originalStyle = element.getAttribute('style');
  element.setAttribute('style', 'color: #0f172a; background-color: #ffffff; padding: 24px; width: 800px; margin: 0;');

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    if (originalStyle) {
      element.setAttribute('style', originalStyle);
    } else {
      element.removeAttribute('style');
    }

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${projectName.replace(/\s+/g, '_')}_QA_Report.pdf`);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    if (originalStyle) element.setAttribute('style', originalStyle);
  }
};
