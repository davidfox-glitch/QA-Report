import React, { useState, useEffect } from 'react';
import { useStore, TestRow, FunctionalityStatus, TestingStatus, Priority } from './store/useStore';
import { exportToExcel } from './utils/exporters';

// Components
import { Filters } from './components/dashboard/Filters';
import { BulkActions } from './components/dashboard/BulkActions';
import { PrintReportView } from './components/dashboard/PrintReportView';

import { LoginView } from './components/auth/LoginView';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { DashboardView } from './components/dashboard/DashboardView';
import { TableView } from './components/table/TableView';
import { KanbanView } from './components/kanban/KanbanView';
import { TimelineView } from './components/timeline/TimelineView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { UserManagementView } from './components/users/UserManagementView';

// Dialogs
import { Dialog } from './components/ui/Dialog';
import { RowModal } from './components/table/RowModal';
import { NotesSidebar } from './components/notes/NotesSidebar';
import { ProjectSettingsModal } from './components/dashboard/ProjectSettingsModal';
import { AddFieldForm, ManageFieldsView } from './components/dashboard/CustomFieldDialogs';
import { ReportGeneratorModal } from './components/dashboard/ReportGeneratorModal';
import { SmartImportModal } from './components/dashboard/SmartImportModal';

// Icons
import {
  LayoutDashboard,
  LayoutGrid,
  Kanban,
  CalendarRange,
  BarChart3,
  Users,
  Moon,
  Sun,
  Settings,
  Plus,
  Download,
  Upload,
  Briefcase,
  Layers,
  Bell,
  Check,
  CheckSquare,
  AlertCircle,
  LogOut
} from 'lucide-react';

export default function App() {
  const {
    rows,
    settings,
    currentView,
    darkMode,
    selectedRowIds,
    customFieldsDef,
    notifications,
    lastAiSummary,
    setCurrentView,
    toggleDarkMode,
    toggleSelectRow,
    toggleSelectAllRows,
    clearSelection,
    deleteRow,
    deleteMultipleRows,
    bulkUpdateStatus,
    updateRow,
    clearNotifications,
    markNotificationRead
  } = useStore();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [funcFilter, setFuncFilter] = useState('');
  const [testFilter, setTestFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [customFilters, setCustomFilters] = useState<Record<string, string>>({});

  const setCustomFilter = (cfId: string, val: string) => {
    setCustomFilters((prev) => ({ ...prev, [cfId]: val }));
  };

  // Modals state
  const [isAddRowOpen, setIsAddRowOpen] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [notesRowId, setNotesRowId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [isManageFieldsOpen, setIsManageFieldsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Apply dark mode on initial load
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Register Service Worker for push notifications
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('Service Worker registered', reg))
        .catch(err => console.error('Service Worker registration failed', err));
    }
  }, []);

  // Request Notification permission on app start
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission', permission);
      });
    }
  }, []);

  // Filter logic
  const filteredRows = rows.filter((row) => {
    // 1. Global Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const notesMatch = row.notes.some((n) => n.text.toLowerCase().includes(q));
      const textMatch =
        row.testPoint.toLowerCase().includes(q) ||
        row.moduleName.toLowerCase().includes(q) ||
        row.url.toLowerCase().includes(q) ||
        row.howToTest.toLowerCase().includes(q) ||
        row.expectedResult.toLowerCase().includes(q) ||
        row.actualResult.toLowerCase().includes(q) ||
        row.priority.toLowerCase().includes(q) ||
        row.testingStatus.toLowerCase().includes(q) ||
        row.functionalityStatus.toLowerCase().includes(q) ||
        (row.assignedUser && row.assignedUser.toLowerCase().includes(q));

      if (!textMatch && !notesMatch) return false;
    }

    // 2. Dropdown filters
    if (funcFilter && row.functionalityStatus !== funcFilter) return false;
    if (testFilter && row.testingStatus !== testFilter) return false;
    if (priorityFilter && row.priority !== priorityFilter) return false;

    // 3. Custom Field filters
    for (const [cfId, cfVal] of Object.entries(customFilters)) {
      if (cfVal) {
        const rowVal = row.customFields[cfId];
        if (rowVal === undefined || !String(rowVal).toLowerCase().includes(cfVal.toLowerCase())) {
          return false;
        }
      }
    }

    return true;
  });

  const [session, setSession] = useState<Session | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'Admin' | 'User'>('User');
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [invitedEmails, setInvitedEmails] = useState<string[]>(['dawoodhashmi2006@gmail.com']);
  const [isCheckingInvite, setIsCheckingInvite] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCurrentUserRole(session?.user?.user_metadata?.role || 'User');
      setAuthInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setCurrentUserRole(session?.user?.user_metadata?.role || 'User');
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch invited emails dynamically
  useEffect(() => {
    const fetchInvites = async () => {
      const { data, error } = await supabase.from('invited_users').select('email');
      if (data && !error) {
        setInvitedEmails(prev => {
          const emails = data.map(row => row.email);
          return Array.from(new Set([...prev, ...emails]));
        });
      }
      setIsCheckingInvite(false);
    };
    fetchInvites();
  }, []);

  // Block users who are not on the invited list
  useEffect(() => {
    if (!isCheckingInvite && session && session.user?.email) {
      const userEmail = session.user.email;
      if (!invitedEmails.includes(userEmail)) {
        setIsBlocked(true);
        // Sign them out and show the blocked UI for 5 seconds before kicking to login
        supabase.auth.signOut().then(() => {
          setTimeout(() => {
            setIsBlocked(false);
          }, 5000);
        });
      }
    }
  }, [session, invitedEmails, isCheckingInvite]);
  // Role-Based Route Protection Logic
  React.useEffect(() => {
    // If a standard User tries to access protected views, redirect to dashboard
    if (currentUserRole !== 'Admin' && (currentView === 'timeline' || currentView === 'users')) {
      setCurrentView('dashboard');
    }
  }, [currentView, currentUserRole, setCurrentView]);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (window.location.pathname === '/login' && !session) {
    return <LoginView />;
  }

  if (!authInitialized) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  // If the user is logged in but not invited, show a blocked page
  if (isBlocked) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">You’re not invited</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          This site is invitation‑only. Please contact the admin (<a href="mailto:dawoodhashmi2006@gmail.com" className="text-indigo-600 hover:underline">dawoodhashmi2006@gmail.com</a>) for access.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Sign Out
        </button>
      </div>
    );
  }

  if (!session) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Banner Header */}
      <header className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between flex-wrap gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
            {settings.clientLogo ? (
              <img src={settings.clientLogo} alt="Client Logo" className="h-9 w-9 rounded-xl object-contain border border-slate-200 dark:border-slate-800" />
            ) : (
              <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                <Briefcase className="h-4.5 w-4.5 text-white" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
                  {settings.projectName}
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30">
                  Pro
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Company: <span className="font-semibold text-slate-700 dark:text-slate-350">{settings.clientName}</span>
              </p>
            </div>
          </div>

          {/* Core View Switcher tabs */}
          <nav className="flex items-center space-x-1 bg-slate-150/80 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-850 p-0.5 rounded-xl">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentView === 'dashboard'
                  ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentView === 'table'
                  ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setCurrentView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentView === 'kanban'
                  ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentView === 'analytics'
                  ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Analytics</span>
            </button>
            {/* Admin-Only Navigation Links */}
            {currentUserRole === 'Admin' && (
              <>
                <button
                  onClick={() => setCurrentView('timeline')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    currentView === 'timeline'
                      ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
                  }`}
                >
                  <CalendarRange className="h-3.5 w-3.5" />
                  <span>Timeline</span>
                </button>
                <button
                  onClick={() => setCurrentView('users')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    currentView === 'users'
                      ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Team</span>
                </button>
              </>
            )}
          </nav>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative flex items-center justify-center p-2 text-slate-500 dark:text-slate-400 bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-full transition-all ${
                  isNotificationsOpen ? 'ring-2 ring-indigo-500/20' : ''
                }`}
                title="Activity Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900 shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications panel dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2.5 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Alert Logs</span>
                    <button
                      onClick={clearNotifications}
                      className="text-[9px] font-bold text-slate-400 hover:text-rose-550"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-[10px] text-slate-400 text-center py-4">No recent activity logs.</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            setIsNotificationsOpen(false);
                          }}
                          className={`p-2 rounded-xl text-[10px] transition-all cursor-pointer ${
                            n.read 
                              ? 'bg-slate-50/20 dark:bg-slate-950/10 text-slate-500' 
                              : 'bg-indigo-500/5 dark:bg-indigo-500/10 border-l-2 border-indigo-500 font-medium'
                          }`}
                        >
                          <p className="leading-snug">{n.message}</p>
                          <span className="text-[8px] text-slate-400 block mt-1">{n.timestamp}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Smart Import Wizard */}
            <button
              onClick={() => setIsImportWizardOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-all"
            >
              <Upload className="h-3.5 w-3.5" />
              Import Sheet
            </button>

            {/* Settings Trigger */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center justify-center p-2 text-slate-500 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
              title="Project Settings"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center p-2 text-slate-500 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Generate Report */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/10 hover:shadow-lg transition-all"
            >
              Generate Report
            </button>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
              }}
              className="flex items-center justify-center p-2 text-rose-500 hover:text-rose-600 bg-rose-50/50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 border border-rose-100 dark:border-rose-900/50 rounded-xl transition-all"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>

            {/* Add Entry */}
            <button
              onClick={() => {
                setEditingRowId(null);
                setIsAddRowOpen(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm hover:shadow transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Test Point
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Table filters only show up inside the Table view */}
        {currentView === 'table' && (
          <Filters
            search={search}
            setSearch={setSearch}
            funcFilter={funcFilter}
            setFuncFilter={setFuncFilter}
            testFilter={testFilter}
            setTestFilter={setTestFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            customFieldsDef={customFieldsDef}
            customFilters={customFilters}
            setCustomFilter={setCustomFilter}
            onAddField={() => setIsAddFieldOpen(true)}
            onManageFields={() => setIsManageFieldsOpen(true)}
          />
        )}

        {/* Active View Router */}
        <div className="min-h-[400px]">
          {currentView === 'dashboard' && <DashboardView />}

          {currentView === 'table' && (
            <TableView
              rows={filteredRows}
              selectedRowIds={selectedRowIds}
              customFieldsDef={customFieldsDef}
              toggleSelectRow={toggleSelectRow}
              toggleSelectAllRows={toggleSelectAllRows}
              onEditRow={(id) => setEditingRowId(id)}
              onDeleteRow={deleteRow}
              onOpenNotes={(id) => setNotesRowId(id)}
              onQuickUpdate={updateRow}
            />
          )}

          {currentView === 'kanban' && (
            <KanbanView
              rows={filteredRows}
              onEditRow={(id) => setEditingRowId(id)}
              onOpenNotes={(id) => setNotesRowId(id)}
              onQuickUpdate={updateRow}
            />
          )}

          {currentView === 'timeline' && (
            <TimelineView
              rows={filteredRows}
              onEditRow={(id) => setEditingRowId(id)}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              rows={filteredRows}
            />
          )}

          {currentView === 'users' && <UserManagementView />}
        </div>
      </main>

      {/* Bulk Operations Sticky Footer */}
      <BulkActions
        selectedCount={selectedRowIds.length}
        onClear={clearSelection}
        onDeleteSelected={() => {
          if (confirm(`Delete ${selectedRowIds.length} selected pages?`)) {
            deleteMultipleRows(selectedRowIds);
          }
        }}
        onBulkUpdate={(func, test, prio) => bulkUpdateStatus(selectedRowIds, func, test, prio)}
        onExportSelected={() => {
          const exportRows = rows.filter((r) => selectedRowIds.includes(r.id));
          exportToExcel(exportRows, settings, customFieldsDef);
        }}
      />

      {/* -------------------------------------------------- */}
      {/* DIALOG WINDOWS MODAL OVERLAYS */}
      {/* -------------------------------------------------- */}

      {/* 1. Add Entry Dialog */}
      <Dialog
        isOpen={isAddRowOpen}
        onClose={() => setIsAddRowOpen(false)}
        title="Create Test Point"
        size="lg"
      >
        <RowModal onClose={() => setIsAddRowOpen(false)} />
      </Dialog>

      {/* 2. Edit Entry Dialog */}
      <Dialog
        isOpen={!!editingRowId}
        onClose={() => setEditingRowId(null)}
        title="Modify Test Specifications"
        size="lg"
      >
        {editingRowId && (
          <RowModal
            rowId={editingRowId}
            onClose={() => setEditingRowId(null)}
          />
        )}
      </Dialog>

      {/* 3. Notes timeline Drawer Dialog */}
      <Dialog
        isOpen={!!notesRowId}
        onClose={() => setNotesRowId(null)}
        title="QA Notes Timeline & AI Assistant"
        size="2xl"
      >
        {notesRowId && (
          <NotesSidebar
            rowId={notesRowId}
            onClose={() => setNotesRowId(null)}
          />
        )}
      </Dialog>

      {/* 4. Project Settings Config Dialog */}
      <Dialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Project Settings"
        size="md"
      >
        <ProjectSettingsModal onClose={() => setIsSettingsOpen(false)} />
      </Dialog>

      {/* 5. Custom Column Add Dialog */}
      <Dialog
        isOpen={isAddFieldOpen}
        onClose={() => setIsAddFieldOpen(false)}
        title="Add Custom Column"
        size="sm"
      >
        <AddFieldForm onClose={() => setIsAddFieldOpen(false)} />
      </Dialog>

      {/* 6. Manage Custom Columns Dialog */}
      <Dialog
        isOpen={isManageFieldsOpen}
        onClose={() => setIsManageFieldsOpen(false)}
        title="Manage Custom Columns"
        size="sm"
      >
        <ManageFieldsView onClose={() => setIsManageFieldsOpen(false)} />
      </Dialog>

      {/* 7. Generate Reports / Exports config Dialog */}
      <Dialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Generate QA Reports"
        size="lg"
      >
        <ReportGeneratorModal
          onClose={() => setIsExportOpen(false)}
          filteredRows={filteredRows}
        />
      </Dialog>

      {/* 8. Smart Spreadsheet Importer Wizard Dialog */}
      <Dialog
        isOpen={isImportWizardOpen}
        onClose={() => setIsImportWizardOpen(false)}
        title="Smart Spreadsheet Importer"
        size="md"
      >
        <SmartImportModal onClose={() => setIsImportWizardOpen(false)} />
      </Dialog>

      {/* -------------------------------------------------- */}
      {/* PRINT REPORT GENERATOR DOCK ELEMENT (OFF-SCREEN) */}
      {/* -------------------------------------------------- */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '850px' }}>
        <PrintReportView
          rows={filteredRows}
          settings={settings}
          customFieldsDef={customFieldsDef}
          lastAiSummary={lastAiSummary}
        />
      </div>

    </div>
  );
}
