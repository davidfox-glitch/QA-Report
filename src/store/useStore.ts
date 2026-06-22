import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type FunctionalityStatus = 'Working' | 'Partially Working' | 'Not Working' | 'Pending';
export type TestingStatus = 'Passed' | 'Failed' | 'Pending' | 'In Progress';
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Note {
  id: string;
  text: string;
  timestamp: string;
}

export interface Client {
  id: string;
  name: string;
  logo?: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description?: string;
}

export interface Module {
  id: string;
  projectId: string;
  name: string;
}

export interface CustomFieldDef {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date';
}

export interface TestRow {
  id: string;
  testPoint: string;
  moduleId: string;
  howToTest: string;
  expectedResult: string;
  actualResult: string;
  functionalityStatus: FunctionalityStatus;
  testingStatus: TestingStatus;
  priority: Priority;
  assignedRole?: string; // e.g. 'Developer' or 'QA Engineer'
  assignedUsers?: string[]; // Array of User Emails or Names
  notes: Note[];
  customFields: Record<string, string | number>;
  lastUpdated: string;
  startDate?: string;
  releaseDate?: string;
  deletedAt?: string;
}

export interface ProjectSettings {
  projectName: string;
  clientName: string; // Company Name
  clientLogo: string; // base64
  projectDescription: string;
  aiProvider: 'gemini' | 'openai';
  apiKey: string;
  reportBranding: {
    primaryColor: string;
    showLogo: boolean;
    headerTemplate: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'QA Lead' | 'QA Engineer' | 'Developer' | 'Client' | 'Project Manager';
  completedTests: number;
  inviteId?: string;
  isInvited: boolean;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'status_change' | 'assignment' | 'general';
}

export type ActiveView = 'dashboard' | 'table' | 'kanban' | 'timeline' | 'analytics' | 'users' | 'settings' | 'archive' | 'trash' | 'docs';

interface DashboardState {
  // Project settings
  settings: ProjectSettings;
  updateSettings: (settings: Partial<ProjectSettings>) => void;

  // View state
  currentView: ActiveView;
  setCurrentView: (view: ActiveView) => void;

  // Dark mode
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Selected items for bulk operations
  selectedRowIds: string[];
  toggleSelectRow: (id: string) => void;
  toggleSelectAllRows: (ids: string[]) => void;
  clearSelection: () => void;

  // Custom Fields Schema
  customFieldsDef: CustomFieldDef[];
  addCustomFieldDef: (name: string, type: 'text' | 'number' | 'date') => void;
  deleteCustomFieldDef: (id: string) => void;

  // Hierarchy
  clients: Client[];
  projects: Project[];
  modules: Module[];
  activeClientId: string | null;
  activeProjectId: string | null;
  activeModuleId: string | null;

  setActiveClient: (id: string | null) => void;
  setActiveProject: (id: string | null) => void;
  setActiveModule: (id: string | null) => void;

  addClient: (client: Client) => void;
  addProject: (project: Project) => void;
  addModule: (module: Module) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  updateModule: (id: string, updates: Partial<Module>) => void;
  deleteClient: (id: string) => void;
  deleteProject: (id: string) => void;
  deleteModule: (id: string) => void;

  // Test rows (items) data
  rows: TestRow[];
  addRow: (row: Omit<TestRow, 'id' | 'lastUpdated' | 'notes'>) => void;
  updateRow: (id: string, updates: Partial<TestRow>) => void;
  deleteRow: (id: string) => void;
  deleteMultipleRows: (ids: string[]) => void;
  bulkUpdateStatus: (ids: string[], functionality?: FunctionalityStatus, testing?: TestingStatus, priority?: Priority) => void;
  importRows: (newRows: TestRow[], fieldDefs?: CustomFieldDef[]) => void;

  // Lifecycle Management
  archivedRows: TestRow[];
  trashRows: TestRow[];
  activityLogs: any[];
  archiveRow: (id: string) => void;
  trashRow: (id: string) => void;
  trashMultipleRows: (ids: string[]) => void;
  restoreRow: (id: string) => void;
  hardDeleteRow: (id: string) => void;
  logActivity: (action: string, details?: string) => void;

  // Notes management
  addNote: (rowId: string, text: string) => void;
  updateNote: (rowId: string, noteId: string, text: string) => void;
  deleteNote: (rowId: string, noteId: string) => void;

  // Users management
  users: User[];
  addUser: (user: Omit<User, 'completedTests' | 'isInvited' | 'inviteId'> & { id?: string }) => void;
  deleteUser: (id: string) => void;
  deleteUserCascade: (id: string) => void;
  loadInvitedUsers: () => Promise<void>;

  // Notifications management
  notifications: Notification[];
  addNotification: (message: string, type: Notification['type']) => void;
  clearNotifications: () => void;
  markNotificationRead: (id: string) => void;

  // AI Summary caching
  lastAiSummary?: {
    testingSummary: string;
    progressSummary: string;
    riskAssessment: string;
    pendingTasksSummary: string;
  };
  setAiSummary: (summary: any) => void;

  // Global UI Modal States (for App Router migration)
  isAddRowOpen: boolean;
  setIsAddRowOpen: (open: boolean) => void;
  editingRowId: string | null;
  setEditingRowId: (id: string | null) => void;
  notesRowId: string | null;
  setNotesRowId: (id: string | null) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isExportOpen: boolean;
  setIsExportOpen: (open: boolean) => void;
  isImportWizardOpen: boolean;
  setIsImportWizardOpen: (open: boolean) => void;

}

// Initial Mock Users
const defaultUsers: User[] = [];

// Initial Mock Rows
const defaultRows: TestRow[] = [
  {
    id: 'row-1',
    testPoint: 'Verify Google Oauth Login Flow',
    moduleId: 'module-1',
    howToTest: 'Click on Google Login button. Enter credentials. Check redirection.',
    expectedResult: 'User should be authenticated successfully and redirected to dashboard.',
    actualResult: 'Redirects successfully, but session cookie lacks Secure attribute.',
    functionalityStatus: 'Partially Working',
    testingStatus: 'Failed',
    priority: 'Critical',
    assignedUsers: ['Affan Ahmad'],
    notes: [
      { id: 'note-1-1', text: 'Auth flow works, but security header review flagged cookie config.', timestamp: '2026-06-08 14:30' }
    ],
    customFields: {},
    lastUpdated: '2026-06-08 14:30',
    startDate: '2026-06-01',
    releaseDate: '2026-06-15'
  },
  {
    id: 'row-2',
    testPoint: 'Verify real-time updates in Analytics graph',
    moduleId: 'module-2',
    howToTest: 'Generate mock data trigger from backend. Verify UI updates automatically without reload.',
    expectedResult: 'Chart data increments by delta and updates smooth transitions.',
    actualResult: 'Endpoint returns 403 authorization failed on WebSockets connection.',
    functionalityStatus: 'Not Working',
    testingStatus: 'Failed',
    priority: 'High',
    assignedUsers: ['Sarah Connor'],
    notes: [
      { id: 'note-2-1', text: 'Discussed with backend dev, JWT authentication scopes are missing in WebSocket handshake.', timestamp: '2026-06-08 11:20' }
    ],
    customFields: {},
    lastUpdated: '2026-06-08 11:20',
    startDate: '2026-06-05',
    releaseDate: '2026-06-18'
  },
  {
    id: 'row-3',
    testPoint: 'Ensure published post matches scheduled metadata',
    moduleId: 'module-3',
    howToTest: 'Schedule a post for +5 mins. Allow publisher runner to execute. Confirm image and text.',
    expectedResult: 'Post appears in feed with exact scheduled parameters.',
    actualResult: 'Post published on time, metadata verified correctly.',
    functionalityStatus: 'Working',
    testingStatus: 'Passed',
    priority: 'Medium',
    assignedRole: 'Developer',
    assignedUsers: ['John Doe'],
    notes: [],
    customFields: {},
    lastUpdated: '2026-06-08 09:00',
    startDate: '2026-06-02',
    releaseDate: '2026-06-12'
  },
  {
    id: 'row-4',
    testPoint: 'Add custom field column sorting support',
    moduleId: 'module-4',
    howToTest: 'Click on Custom Column header. Confirm sorting ascends and descends properly.',
    expectedResult: 'Sort order shifts and table re-renders within 100ms.',
    actualResult: 'Not yet implemented.',
    functionalityStatus: 'Pending',
    testingStatus: 'Pending',
    priority: 'Medium',
    assignedUsers: ['Alice Smith'],
    notes: [],
    customFields: {},
    lastUpdated: '2026-06-08 08:30',
    startDate: '2026-06-10',
    releaseDate: '2026-06-25'
  }
];

const loadLocalStorageState = () => {
  try {
    const saved = localStorage.getItem('qaflow_pro_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      // MIGRATION SCRIPT
      if (!parsed.clients || parsed.clients.length === 0) {
        const defaultClientId = 'client-legacy-1';
        const defaultProjectId = 'project-legacy-1';
        
        parsed.clients = [{ id: defaultClientId, name: parsed.settings?.clientName || 'Default Client' }];
        parsed.projects = [{ id: defaultProjectId, clientId: defaultClientId, name: parsed.settings?.projectName || 'Default Project' }];
        
        const moduleMap: Record<string, string> = {};
        parsed.modules = [];
        let mIdx = 1;
        
        if (parsed.rows) {
          parsed.rows = parsed.rows.map((r: any) => {
            if (r.moduleName && !moduleMap[r.moduleName]) {
              const mId = `module-legacy-${mIdx++}`;
              moduleMap[r.moduleName] = mId;
              parsed.modules.push({ id: mId, projectId: defaultProjectId, name: r.moduleName });
            }
            const moduleId = r.moduleName ? moduleMap[r.moduleName] : undefined;
            const { moduleName, ...rest } = r;
            return { ...rest, moduleId };
          });
        }
        parsed.activeClientId = defaultClientId;
        parsed.activeProjectId = defaultProjectId;
        parsed.activeModuleId = parsed.modules.length > 0 ? parsed.modules[0].id : null;
      }
      
      // MIGRATION SCRIPT 2: Remove hardcoded dummy users if they exist
      if (parsed.users && Array.isArray(parsed.users)) {
        parsed.users = parsed.users.filter((u: any) => !['user-1', 'user-2', 'user-3', 'user-4'].includes(u.id));
      }

      return parsed;
    }
  } catch (e) {
    console.error('Failed to load local storage state', e);
  }
  return null;
};

const savedState = loadLocalStorageState();

export const useStore = create<DashboardState>((set, get) => {
    const saveState = async (updatedState: Partial<DashboardState>) => {
      const currentState = get();
      const newState = {
        settings: updatedState.settings || currentState.settings,
        currentView: updatedState.currentView || currentState.currentView,
        clients: updatedState.clients || currentState.clients,
        projects: updatedState.projects || currentState.projects,
        modules: updatedState.modules || currentState.modules,
        activeClientId: updatedState.activeClientId !== undefined ? updatedState.activeClientId : currentState.activeClientId,
        activeProjectId: updatedState.activeProjectId !== undefined ? updatedState.activeProjectId : currentState.activeProjectId,
        activeModuleId: updatedState.activeModuleId !== undefined ? updatedState.activeModuleId : currentState.activeModuleId,
        darkMode: updatedState.darkMode ?? currentState.darkMode,
        customFieldsDef: updatedState.customFieldsDef || currentState.customFieldsDef,
        rows: updatedState.rows || currentState.rows,
        archivedRows: updatedState.archivedRows || currentState.archivedRows,
        trashRows: updatedState.trashRows || currentState.trashRows,
        activityLogs: updatedState.activityLogs || currentState.activityLogs,
        users: updatedState.users || currentState.users,
        notifications: updatedState.notifications || currentState.notifications
      };
      // Save to localStorage for offline cache
      localStorage.setItem('qaflow_pro_state', JSON.stringify(newState));
      
      // Sync state across users using Supabase Broadcast
      try {
        const channel = supabase.channel('app-state-sync');
        await channel.send({
          type: 'broadcast',
          event: 'state-update',
          payload: newState
        });
      } catch (e) {
        console.error('Supabase broadcast error:', e);
      }
      
      return newState;
    };
    const setAndPersist = async (updater: (state: DashboardState) => Partial<DashboardState>) => {
      set((state) => {
        const updates = updater(state);
        return { ...state, ...updates };
      });
      // after state update, persist
      const updated = get();
      await saveState(updated);
    };
    // Backward‑compatible wrapper for existing calls
    const saveToLocal = async (nextState: Partial<DashboardState>) => {
      await setAndPersist(() => nextState);
    };
  return {
    settings: savedState?.settings || {
      projectName: 'QAFlow Pro Platform',
      clientName: 'Genus Tech Inc',
      clientLogo: '',
      projectDescription: 'Comprehensive QA tracking, automated workflows, and status analysis report for Genus platforms.',
      aiProvider: 'gemini',
      apiKey: '',
      reportBranding: {
        primaryColor: '#6366f1',
        showLogo: true,
        headerTemplate: 'QAFlow Pro Executive Testing Audit'
      }
    },
    currentView: savedState?.currentView || 'dashboard',
    clients: savedState?.clients || [{ id: 'client-1', name: 'Genus Tech Inc' }],
    projects: savedState?.projects || [{ id: 'project-1', clientId: 'client-1', name: 'QAFlow Pro Platform' }],
    modules: savedState?.modules || [
      { id: 'module-1', projectId: 'project-1', name: 'Authentication - Login' },
      { id: 'module-2', projectId: 'project-1', name: 'Social Manager - Analytics' },
      { id: 'module-3', projectId: 'project-1', name: 'Published Posts Feed' },
      { id: 'module-4', projectId: 'project-1', name: 'Custom Field System' }
    ],
    activeClientId: savedState?.activeClientId || 'client-1',
    activeProjectId: savedState?.activeProjectId || 'project-1',
    activeModuleId: savedState?.activeModuleId || null,

    setActiveClient: (id) => setAndPersist(() => ({ activeClientId: id, activeProjectId: null, activeModuleId: null })),
    setActiveProject: (id) => setAndPersist(() => ({ activeProjectId: id, activeModuleId: null })),
    setActiveModule: (id) => setAndPersist(() => ({ activeModuleId: id })),

    addClient: (client) => setAndPersist((state) => ({ clients: [...state.clients, client] })),
    addProject: (project) => setAndPersist((state) => ({ projects: [...state.projects, project] })),
    addModule: (module) => setAndPersist((state) => ({ modules: [...state.modules, module] })),

    updateClient: (id, updates) => setAndPersist((state) => ({ clients: state.clients.map(c => c.id === id ? { ...c, ...updates } : c) })),
    updateProject: (id, updates) => setAndPersist((state) => ({ projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p) })),
    updateModule: (id, updates) => setAndPersist((state) => ({ modules: state.modules.map(m => m.id === id ? { ...m, ...updates } : m) })),

    deleteClient: (id) => setAndPersist((state) => ({ 
      clients: state.clients.filter(c => c.id !== id),
      projects: state.projects.filter(p => p.clientId !== id),
      modules: state.modules.filter(m => {
        const proj = state.projects.find(p => p.id === m.projectId);
        return proj?.clientId !== id;
      })
    })),
    deleteProject: (id) => setAndPersist((state) => ({
      projects: state.projects.filter(p => p.id !== id),
      modules: state.modules.filter(m => m.projectId !== id)
    })),
    deleteModule: (id) => setAndPersist((state) => ({
      modules: state.modules.filter(m => m.id !== id)
    })),
    darkMode: savedState?.darkMode ?? true,
    selectedRowIds: [],
    customFieldsDef: savedState?.customFieldsDef || [
      { id: 'cf-bug-id', name: 'Bug ID', type: 'text' }
    ],
    rows: savedState?.rows || defaultRows,
    archivedRows: savedState?.archivedRows || [],
    trashRows: savedState?.trashRows || [],
    activityLogs: savedState?.activityLogs || [],
    users: savedState?.users || defaultUsers,
    notifications: savedState?.notifications || [
      { id: 'notif-1', message: 'Welcome to QAFlow Pro Testing Platform', timestamp: '2026-06-08 08:00', read: false, type: 'general' }
    ],

    updateSettings: (newSettings) => {
      setAndPersist((state) => ({ settings: { ...state.settings, ...newSettings } }));
    },

    setCurrentView: (view) => {
      setAndPersist((state) => ({ currentView: view }));
    },

    toggleDarkMode: () => {
      setAndPersist((state) => {
        const darkMode = !state.darkMode;
        if (darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { darkMode };
      });
    },

    toggleSelectRow: (id) => {
      set((state) => {
        const selectedRowIds = state.selectedRowIds.includes(id)
          ? state.selectedRowIds.filter((x) => x !== id)
          : [...state.selectedRowIds, id];
        return { selectedRowIds };
      });
    },

    toggleSelectAllRows: (ids) => {
      set((state) => {
        const allSelected = ids.every((id) => state.selectedRowIds.includes(id));
        const selectedRowIds = allSelected
          ? state.selectedRowIds.filter((id) => !ids.includes(id))
          : Array.from(new Set([...state.selectedRowIds, ...ids]));
        return { selectedRowIds };
      });
    },

    clearSelection: () => set({ selectedRowIds: [] }),

    addCustomFieldDef: (name, type) => {
      set((state) => {
        const id = `cf-${Date.now()}`;
        const customFieldsDef = [...state.customFieldsDef, { id, name, type }];
        const nextState = { ...state, customFieldsDef };
        saveToLocal(nextState);
        return { customFieldsDef };
      });
    },

    deleteCustomFieldDef: (id) => {
      set((state) => {
        const customFieldsDef = state.customFieldsDef.filter((x) => x.id !== id);
        const rows = state.rows.map((row) => {
          const customFields = { ...row.customFields };
          delete customFields[id];
          return { ...row, customFields };
        });
        const nextState = { ...state, customFieldsDef, rows };
        saveToLocal(nextState);
        return { customFieldsDef, rows };
      });
    },

    addRow: (newRow) => {
      set((state) => {
        const id = `row-${Date.now()}`;
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const newRowWithMeta = { ...newRow, id, lastUpdated: nowStr, notes: [], customFields: newRow.customFields || {} } as TestRow;
        const rows = [newRowWithMeta, ...state.rows];
        
        const activityLogs = [{ id: `log-${Date.now()}`, action: 'Created Task', details: `Added new test point: ${newRow.testPoint}`, timestamp: nowStr }, ...state.activityLogs];

        const notifications = [...state.notifications];
        if (newRow.assignedUsers && newRow.assignedUsers.length > 0) {
          notifications.unshift({
            id: `notif-${Date.now()}`,
            message: `New Test Point assigned to ${newRow.assignedUsers.join(', ')}`,
            timestamp: nowStr,
            read: false,
            type: 'assignment'
          });
        } else if (newRow.assignedRole) {
          notifications.unshift({
            id: `notif-${Date.now()}`,
            message: `New Test Point assigned to role: ${newRow.assignedRole}`,
            timestamp: nowStr,
            read: false,
            type: 'assignment'
          });
        }

        saveToLocal({ ...state, rows, activityLogs, notifications });
        return { rows, activityLogs, notifications };
      });
    },

    updateRow: (id, updates) => {
      set((state) => {
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
        let statusChangedMessage = '';
        let assignmentChangedMessage = '';

        const rows = state.rows.map((row) => {
          if (row.id === id) {
            if (updates.testingStatus && updates.testingStatus !== row.testingStatus) {
              statusChangedMessage = `Test Point "${row.testPoint}" changed testing status to "${updates.testingStatus}"`;
            }
            if (updates.assignedUsers && JSON.stringify(updates.assignedUsers) !== JSON.stringify(row.assignedUsers)) {
              assignmentChangedMessage = `Test Point "${row.testPoint}" assigned to ${updates.assignedUsers.join(', ')}`;
            }
            return { ...row, ...updates, lastUpdated: nowStr };
          }
          return row;
        });

        // Auto-archive logic
        const rowsToArchive = rows.filter(r => r.testingStatus === 'Passed' || r.functionalityStatus === 'Working');
        const activeRows = rows.filter(r => r.testingStatus !== 'Passed' && r.functionalityStatus !== 'Working');
        const newArchivedRows = [...state.archivedRows, ...rowsToArchive];
        
        const nextState = { ...state, rows: activeRows, archivedRows: newArchivedRows };
        let activeNotifs = [...state.notifications];

        if (rowsToArchive.length > 0) {
          rowsToArchive.forEach(r => {
             activeNotifs.unshift({
                id: `notif-${Date.now()}-${r.id}`,
                message: `Test Point "${r.testPoint}" automatically archived`,
                timestamp: nowStr,
                read: false,
                type: 'general' as const
             });
          });
        }

        if (statusChangedMessage) {
          activeNotifs = [
            {
              id: `notif-${Date.now()}-1`,
              message: statusChangedMessage,
              timestamp: nowStr,
              read: false,
              type: 'status_change' as const
            },
            ...activeNotifs
          ];
        }

        if (assignmentChangedMessage) {
          activeNotifs = [
            {
              id: `notif-${Date.now()}-2`,
              message: assignmentChangedMessage,
              timestamp: nowStr,
              read: false,
              type: 'assignment' as const
            },
            ...activeNotifs
          ];
        }

        saveToLocal({ ...nextState, notifications: activeNotifs });
        return { rows: activeRows, archivedRows: newArchivedRows, notifications: activeNotifs };
      });
    },

    deleteRow: (id) => {
      set((state) => {
        const rows = state.rows.filter((x) => x.id !== id);
        const selectedRowIds = state.selectedRowIds.filter((x) => x !== id);
        const nextState = { ...state, rows };
        saveToLocal(nextState);
        return { rows, selectedRowIds };
      });
    },

    deleteMultipleRows: (ids) => {
      set((state) => {
        const rows = state.rows.filter((x) => !ids.includes(x.id));
        const selectedRowIds = state.selectedRowIds.filter((x) => !ids.includes(x));
        const nextState = { ...state, rows };
        saveToLocal(nextState);
        return { rows, selectedRowIds };
      });
    },

    bulkUpdateStatus: (ids, functionality, testing, priority) => {
      set((state) => {
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const rows = state.rows.map((row) => {
          if (ids.includes(row.id)) {
            const updates: Partial<TestRow> = { lastUpdated: nowStr };
            if (functionality) updates.functionalityStatus = functionality;
            if (testing) updates.testingStatus = testing;
            if (priority) updates.priority = priority;
            return { ...row, ...updates };
          }
          return row;
        });
        const nextState = { ...state, rows };
        saveToLocal(nextState);
        return { rows };
      });
    },

    importRows: (newRows, newFieldDefs) => {
      set((state) => {
        const rows = [...newRows, ...state.rows];
        const customFieldsDef = newFieldDefs 
          ? [...state.customFieldsDef, ...newFieldDefs.filter((n) => !state.customFieldsDef.some((e) => e.name === n.name))]
          : state.customFieldsDef;
        const nextState = { ...state, rows, customFieldsDef };
        
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const activeNotifs = [
          {
            id: `notif-${Date.now()}`,
            message: `Successfully imported ${newRows.length} testing records from Excel/CSV`,
            timestamp: nowStr,
            read: false,
            type: 'general' as const
          },
          ...state.notifications
        ];

        saveToLocal({ ...nextState, notifications: activeNotifs });
        return { rows, customFieldsDef, notifications: activeNotifs };
      });
    },

    addNote: (rowId, text) => {
      set((state) => {
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const note: Note = {
          id: `note-${Date.now()}`,
          text,
          timestamp: nowStr
        };
        const rows = state.rows.map((row) => {
          if (row.id === rowId) {
            return {
              ...row,
              notes: [...row.notes, note],
              lastUpdated: nowStr
            };
          }
          return row;
        });
        const nextState = { ...state, rows };
        saveToLocal(nextState);
        return { rows };
      });
    },

    updateNote: (rowId, noteId, text) => {
      set((state) => {
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const rows = state.rows.map((row) => {
          if (row.id === rowId) {
            return {
              ...row,
              notes: row.notes.map((n) => n.id === noteId ? { ...n, text, timestamp: nowStr } : n),
              lastUpdated: nowStr
            };
          }
          return row;
        });
        const nextState = { ...state, rows };
        saveToLocal(nextState);
        return { rows };
      });
    },

    deleteNote: (rowId, noteId) => {
      set((state) => {
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const rows = state.rows.map((row) => {
          if (row.id === rowId) {
            return {
              ...row,
              notes: row.notes.filter((n) => n.id !== noteId),
              lastUpdated: nowStr
            };
          }
          return row;
        });
        const nextState = { ...state, rows };
        saveToLocal(nextState);
        return { rows };
      });
    },

    addUser: (newUser) => {
      set((state) => {
        const user: User = {
          ...newUser,
          id: newUser.id || `user-${Date.now()}`,
          completedTests: 0,
          isInvited: true,
          inviteId: undefined
        };
        const users = [...state.users, user];
        const nextState = { ...state, users };
        saveToLocal(nextState);
        return { users };
      });
    },
    deleteUser: async (id) => {
      const state = get();
      const removedUser = state.users.find((u) => u.id === id);
      
      if (removedUser && removedUser.email) {
        // Remove from database
        try {
          await supabase.from('users').delete().eq('email', removedUser.email);
        } catch (err) {
          console.error("Failed to delete from database", err);
        }
      }

      set((state) => {
        const users = state.users.filter((u) => u.id !== id);
        const userName = removedUser?.name;
        const rows = userName ? state.rows.map((r) => r.assignedUsers?.includes(userName) ? { ...r, assignedUsers: r.assignedUsers.filter(u => u !== userName) } : r) : state.rows;
        const notifications = state.notifications.filter((n) => !userName || !n.message.includes(userName));
        const nextState = { ...state, users, rows, notifications };
        saveToLocal(nextState);
        return { users, rows, notifications };
      });
    },
    deleteUserCascade: async (id) => {
      const state = get();
      const removedUser = state.users.find((u) => u.id === id);
      
      if (removedUser && removedUser.email) {
        // Remove from database
        try {
          await supabase.from('users').delete().eq('email', removedUser.email);
        } catch (err) {
          console.error("Failed to delete from database", err);
        }
      }

      set((state) => {
        const users = state.users.filter((u) => u.id !== id);
        const userName = removedUser?.name;
        const rows = userName ? state.rows.map((r) => r.assignedUsers?.includes(userName) ? { ...r, assignedUsers: r.assignedUsers.filter(u => u !== userName) } : r) : state.rows;
        const notifications = state.notifications.filter((n) => !userName || !n.message.includes(userName));
        const nextState = { ...state, users, rows, notifications };
        saveToLocal(nextState);
        return { users, rows, notifications };
      });
    },
    // Load invited users from Supabase
    loadInvitedUsers: async () => {
      // @ts-ignore
      const { data, error } = await supabase.from('invited_users').select('id, email, name');
      if (error) { console.error('Failed to load invited users', error); return; }
      set((state) => {
        const invitedMap = new Map(data.map((u: any) => [u.email, { inviteId: u.id, isInvited: true, name: u.name }]));
        const users = state.users.map((u) => {
          if (invitedMap.has(u.email)) {
            const inv = invitedMap.get(u.email)!;
            return { ...u, ...inv };
          }
          return { ...u, isInvited: false };
        });
        const nextState = { ...state, users };
        saveToLocal(nextState);
        return { users };
      });
    },
    addNotification: (message, type) => {
      set((state) => {
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const notifications = [
          { id: `notif-${Date.now()}`, message, timestamp: nowStr, read: false, type },
          ...state.notifications
        ];
        const nextState = { ...state, notifications };
        saveToLocal(nextState);
        return { notifications };
      });
    },
    clearNotifications: () => {
      set((state) => {
        const nextState = { ...state, notifications: [] };
        saveToLocal(nextState);
        return { notifications: [] };
      });
    },
    markNotificationRead: (id) => {
      set((state) => {
        const notifications = state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
        const nextState = { ...state, notifications };
        saveToLocal(nextState);
        return { notifications };
      });
    },
    setAiSummary: (summary) => {
      set((state) => {
        const nextState = { ...state, lastAiSummary: summary };
        saveToLocal(nextState);
        return { lastAiSummary: summary };
      });
    },

    logActivity: (action, details) => {
      set((state) => {
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const newLog = {
          id: `log-${Date.now()}`,
          action,
          details,
          timestamp: nowStr
        };
        const activityLogs = [newLog, ...state.activityLogs];
        saveToLocal({ ...state, activityLogs });
        return { activityLogs };
      });
    },

    archiveRow: (id) => {
      set((state) => {
        const rowToArchive = state.rows.find(r => r.id === id);
        if (!rowToArchive) return state;
        const rows = state.rows.filter(r => r.id !== id);
        const archivedRows: TestRow[] = [{...rowToArchive, testingStatus: 'Passed' as TestingStatus, functionalityStatus: 'Working' as FunctionalityStatus}, ...state.archivedRows];
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
        
        const activityLogs = [{ id: `log-${Date.now()}`, action: 'Archived Task', details: `Task ${rowToArchive.testPoint} archived`, timestamp: nowStr }, ...state.activityLogs];
        
        saveToLocal({ ...state, rows, archivedRows, activityLogs });
        return { rows, archivedRows, activityLogs };
      });
    },

    trashRow: (id) => {
      set((state) => {
        const rowInActive = state.rows.find(r => r.id === id);
        const rowInArchive = state.archivedRows.find(r => r.id === id);
        const targetRow = rowInActive || rowInArchive;
        if (!targetRow) return state;

        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const targetRowWithDeletedAt = { ...targetRow, deletedAt: new Date().toISOString() };

        const rows = state.rows.filter(r => r.id !== id);
        const archivedRows = state.archivedRows.filter(r => r.id !== id);
        const trashRows = [targetRowWithDeletedAt, ...state.trashRows];
        
        const activityLogs = [{ id: `log-${Date.now()}`, action: 'Moved to Trash', details: `Task ${targetRow.testPoint} moved to trash`, timestamp: nowStr }, ...state.activityLogs];

        saveToLocal({ ...state, rows, archivedRows, trashRows, activityLogs });
        return { rows, archivedRows, trashRows, activityLogs };
      });
    },

    trashMultipleRows: (ids) => {
      set((state) => {
        const rowsToTrash: TestRow[] = [];
        const nowIsoStr = new Date().toISOString();
        
        for (const id of ids) {
          const rowInActive = state.rows.find(r => r.id === id);
          const rowInArchive = state.archivedRows.find(r => r.id === id);
          const targetRow = rowInActive || rowInArchive;
          if (targetRow) {
            rowsToTrash.push({ ...targetRow, deletedAt: nowIsoStr });
          }
        }

        if (rowsToTrash.length === 0) return state;

        const nowStr = nowIsoStr.replace('T', ' ').substring(0, 16);
        const rows = state.rows.filter(r => !ids.includes(r.id));
        const archivedRows = state.archivedRows.filter(r => !ids.includes(r.id));
        const trashRows = [...rowsToTrash, ...state.trashRows];
        
        const activityLogs = [{ id: `log-${Date.now()}`, action: 'Moved to Trash', details: `${rowsToTrash.length} tasks moved to trash`, timestamp: nowStr }, ...state.activityLogs];

        // Also deselect the rows that were trashed
        const selectedRowIds = state.selectedRowIds.filter(id => !ids.includes(id));

        saveToLocal({ ...state, rows, archivedRows, trashRows, activityLogs, selectedRowIds });
        return { rows, archivedRows, trashRows, activityLogs, selectedRowIds };
      });
    },

    restoreRow: (id) => {
      set((state) => {
        const rowInTrash = state.trashRows.find(r => r.id === id);
        const rowInArchive = state.archivedRows.find(r => r.id === id);
        
        let rows = [...state.rows];
        let archivedRows = [...state.archivedRows];
        let trashRows = [...state.trashRows];
        let targetRow = null;

        if (rowInTrash) {
           targetRow = rowInTrash;
           trashRows = trashRows.filter(r => r.id !== id);
           rows = [targetRow, ...rows];
        } else if (rowInArchive) {
           targetRow = rowInArchive;
           archivedRows = archivedRows.filter(r => r.id !== id);
           targetRow.testingStatus = 'Pending';
           targetRow.functionalityStatus = 'Pending';
           rows = [targetRow, ...rows];
        }
        
        if (!targetRow) return state;
        
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const activityLogs = [{ id: `log-${Date.now()}`, action: 'Restored Task', details: `Task ${targetRow.testPoint} restored`, timestamp: nowStr }, ...state.activityLogs];

        saveToLocal({ ...state, rows, archivedRows, trashRows, activityLogs });
        return { rows, archivedRows, trashRows, activityLogs };
      });
    },

    hardDeleteRow: (id) => {
      set((state) => {
        const rowToDel = state.trashRows.find(r => r.id === id);
        if (!rowToDel) return state;
        
        const trashRows = state.trashRows.filter(r => r.id !== id);
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const activityLogs = [{ id: `log-${Date.now()}`, action: 'Permanently Deleted Task', details: `Task ${rowToDel.testPoint} permanently deleted`, timestamp: nowStr }, ...state.activityLogs];
        
        saveToLocal({ ...state, trashRows, activityLogs });
        return { trashRows, activityLogs };
      });
    },

    // Modal UI states
    isAddRowOpen: false,
    setIsAddRowOpen: (open) => set({ isAddRowOpen: open }),
    editingRowId: null,
    setEditingRowId: (id) => set({ editingRowId: id }),
    notesRowId: null,
    setNotesRowId: (id) => set({ notesRowId: id }),
    isSettingsOpen: false,
    setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),
    isExportOpen: false,
    setIsExportOpen: (open) => set({ isExportOpen: open }),
    isImportWizardOpen: false,
    setIsImportWizardOpen: (open) => set({ isImportWizardOpen: open })
  };
});
