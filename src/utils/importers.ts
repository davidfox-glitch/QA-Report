import * as XLSX from 'xlsx';
import { TestRow, FunctionalityStatus, TestingStatus, Priority, CustomFieldDef } from '../store/useStore';

// Helper to normalize strings for comparison
const normalizeHeader = (header: string): string => {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Maps spreadsheet headers to internal data structure key/field names
const detectColumnMapping = (headers: string[]): { fieldMappings: Record<string, string>, customFieldHeaders: string[] } => {
  const fieldMappings: Record<string, string> = {};
  const customFieldHeaders: string[] = [];

  const mappings: Record<string, string[]> = {
    testPoint: ['testpoint', 'testcase', 'point', 'description', 'title', 'test'],
    moduleName: ['modulename', 'module', 'feature', 'page', 'pagename', 'section'],
    url: ['url', 'pagelink', 'link', 'address', 'path'],
    howToTest: ['howtotest', 'steps', 'teststeps', 'method', 'procedure'],
    expectedResult: ['expectedresult', 'expected', 'resultexpected', 'outcome'],
    actualResult: ['actualresult', 'actual', 'resultactual', 'bugdetails'],
    functionalityStatus: ['functionality', 'functionalitystatus', 'devstatus', 'progress'],
    testingStatus: ['status', 'testingstatus', 'qa', 'qastatus', 'teststatus'],
    priority: ['priority', 'level', 'urgency', 'severity']
  };

  headers.forEach((header) => {
    const normalized = normalizeHeader(header);
    let matchedField = '';

    for (const [field, synonyms] of Object.entries(mappings)) {
      if (synonyms.includes(normalized) || normalized === field.toLowerCase()) {
        matchedField = field;
        break;
      }
    }

    if (matchedField) {
      fieldMappings[header] = matchedField;
    } else {
      customFieldHeaders.push(header);
    }
  });

  return { fieldMappings, customFieldHeaders };
};

// Parse value to fit standard FunctionalityStatus options
const mapFunctionalityStatus = (val: string): FunctionalityStatus => {
  const norm = normalizeHeader(val);
  if (norm.includes('working') && !norm.includes('part')) return 'Working';
  if (norm.includes('part') || norm.includes('some')) return 'Partially Working';
  if (norm.includes('not') || norm.includes('fail') || norm.includes('broken')) return 'Not Working';
  return 'Pending';
};

// Parse value to fit standard TestingStatus options
const mapTestingStatus = (val: string): TestingStatus => {
  const norm = normalizeHeader(val);
  if (norm.includes('pass') || norm.includes('ok') || norm.includes('success')) return 'Passed';
  if (norm.includes('fail') || norm.includes('bug') || norm.includes('error')) return 'Failed';
  if (norm.includes('progress') || norm.includes('run')) return 'In Progress';
  return 'Pending';
};

// Parse value to fit standard Priority options
const mapPriority = (val: string): Priority => {
  const norm = normalizeHeader(val);
  if (norm.includes('critical') || norm.includes('blocker')) return 'Critical';
  if (norm.includes('high') || norm.includes('h1')) return 'High';
  if (norm.includes('low') || norm.includes('p3')) return 'Low';
  return 'Medium'; // default
};

export const parseSpreadsheet = (
  file: File
): Promise<{ rows: TestRow[]; customFields: CustomFieldDef[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('File reading resulted in empty data'));
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (rawData.length === 0) {
          reject(new Error('No data found in spreadsheet'));
          return;
        }

        let headerRowIndex = 0;
        for (let i = 0; i < rawData.length; i++) {
          if (rawData[i] && rawData[i].length > 0) {
            headerRowIndex = i;
            break;
          }
        }

        const headers = rawData[headerRowIndex].map((h) => String(h).trim());
        const { fieldMappings, customFieldHeaders } = detectColumnMapping(headers);

        const newCustomFields: CustomFieldDef[] = customFieldHeaders.map((header) => ({
          id: `cf-${normalizeHeader(header)}-${Date.now()}`,
          name: header,
          type: 'text'
        }));

        const rows: TestRow[] = [];
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

        for (let i = headerRowIndex + 1; i < rawData.length; i++) {
          const rowData = rawData[i];
          if (!rowData || rowData.length === 0) continue;

          if (rowData.every(cell => cell === null || cell === undefined || String(cell).trim() === '')) {
            continue;
          }

          const newRow: TestRow = {
            id: `row-${Date.now()}-${i}`,
            testPoint: '',
            moduleName: '',
            url: '',
            howToTest: '',
            expectedResult: '',
            actualResult: '',
            functionalityStatus: 'Pending',
            testingStatus: 'Pending',
            priority: 'Medium',
            notes: [],
            attachments: [],
            customFields: {},
            lastUpdated: nowStr
          };

          headers.forEach((header, colIndex) => {
            const val = rowData[colIndex];
            const valStr = val !== undefined && val !== null ? String(val).trim() : '';
            const internalField = fieldMappings[header];

            if (internalField) {
              if (internalField === 'testPoint') {
                newRow.testPoint = valStr;
              } else if (internalField === 'moduleName') {
                newRow.moduleName = valStr;
              } else if (internalField === 'url') {
                newRow.url = valStr;
              } else if (internalField === 'howToTest') {
                newRow.howToTest = valStr;
              } else if (internalField === 'expectedResult') {
                newRow.expectedResult = valStr;
              } else if (internalField === 'actualResult') {
                newRow.actualResult = valStr;
              } else if (internalField === 'functionalityStatus') {
                newRow.functionalityStatus = mapFunctionalityStatus(valStr);
              } else if (internalField === 'testingStatus') {
                newRow.testingStatus = mapTestingStatus(valStr);
              } else if (internalField === 'priority') {
                newRow.priority = mapPriority(valStr);
              }
            } else {
              const cfDef = newCustomFields.find((cf) => cf.name === header);
              if (cfDef && valStr) {
                newRow.customFields[cfDef.id] = valStr;
              }
            }
          });

          // Fallback moduleName or testPoint
          if (newRow.testPoint || newRow.moduleName) {
            if (!newRow.testPoint) newRow.testPoint = 'Unnamed Test Point';
            if (!newRow.moduleName) newRow.moduleName = 'General Module';
            rows.push(newRow);
          }
        }

        resolve({ rows, customFields: newCustomFields });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('FileReader error occurred'));
    reader.readAsBinaryString(file);
  });
};
