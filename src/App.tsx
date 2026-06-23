import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { exportToExcel } from './utils/exporters';

// Components
import { Filters } from './components/dashboard/Filters';
import { BulkActions } from './components/dashboard/BulkActions';
import { PrintReportView } from './components/dashboard/PrintReportView';

import { LoginView } from './components/auth/LoginView';
import { LandingView } from './components/landing/LandingView';
import { supabase, syncChannel } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { DashboardView } from './components/dashboard/DashboardView';
import { TableView } from './components/table/TableView';
import { KanbanView } from './components/kanban/KanbanView';
import { ImageAssignmentsView } from './components/image-assignments/ImageAssignmentsView';
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
import { DocumentationDashboard } from './components/dashboard/DocumentationDashboard';
import { ArchiveView } from './components/dashboard/ArchiveView';
import { TrashView } from './components/dashboard/TrashView';
import { DetailsModal } from './components/table/DetailsModal';
import { CreateWorkspaceModal } from './components/dashboard/CreateWorkspaceModal';
import { ChatbotWidget } from './components/chat/ChatbotWidget';

// Icons
import {
  LayoutDashboard,
  LayoutGrid,
  Kanban,
  CalendarRange,
  BarChart3,
  Users,
  Archive,
  Trash2,
  BookOpen,
  Moon,
  Sun,
  Settings,
  Plus,
  Upload,
  Bell,
  LogOut,
  ChevronDown,
  Briefcase,
  Image as ImageIcon
} from 'lucide-react';

export default function App() {
  const {
    rows,
    settings,
    projects,
    clients,
    modules,
    activeProjectId,
    setActiveClient,
    setActiveProject,
    setActiveModule,
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
    trashRow,
    trashMultipleRows,
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

  // Local UI State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [isManageFieldsOpen, setIsManageFieldsOpen] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);

  const setCustomFilter = (cfId: string, val: string) => {
    setCustomFilters((prev) => ({ ...prev, [cfId]: val }));
  };

  // Modals state (now from Zustand store)
  const {
    isAddRowOpen,
    setIsAddRowOpen,
    editingRowId,
    setEditingRowId,
    notesRowId,
    setNotesRowId,
    isSettingsOpen,
    setIsSettingsOpen,
    isExportOpen,
    setIsExportOpen,
    isImportWizardOpen,
    setIsImportWizardOpen,
  } = useStore();

  const [detailsRow, setDetailsRow] = useState<any | null>(null);
  const [filesRowId, setFilesRowId] = useState<string | null>(null);

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
        row.howToTest.toLowerCase().includes(q) ||
        row.expectedResult.toLowerCase().includes(q) ||
        row.actualResult.toLowerCase().includes(q) ||
        row.priority.toLowerCase().includes(q) ||
        row.testingStatus.toLowerCase().includes(q) ||
        row.functionalityStatus.toLowerCase().includes(q) ||
        (row.assignedUsers && row.assignedUsers.some(u => u.toLowerCase().includes(q)));

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
  const [currentUserRole, setCurrentUserRole] = useState<string>('User');
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [invitedEmails, setInvitedEmails] = useState<string[]>(['dawoodhashmi2006@gmail.com']);
  const [isCheckingInvite, setIsCheckingInvite] = useState(true);

  // Sync state across different connected users via Supabase Broadcast
  useEffect(() => {
    syncChannel
      .on('broadcast', { event: 'state-update' }, (payload) => {
        if (payload.payload) {
          useStore.setState(payload.payload);
          localStorage.setItem('qaflow_pro_state', JSON.stringify(payload.payload));
        }
      })
      .on('broadcast', { event: 'request-state' }, () => {
        syncChannel.send({
          type: 'broadcast',
          event: 'state-update',
          payload: useStore.getState()
        });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          syncChannel.send({
            type: 'broadcast',
            event: 'request-state',
            payload: {}
          });
        }
      });
      
    // Handle local storage updates across tabs in the same browser
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'qaflow_pro_state' && e.newValue) {
        useStore.setState(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCurrentUserRole(session?.user?.user_metadata?.role || 'User');
      setAuthInitialized(true);
      if (session && window.location.pathname === '/login') {
        window.location.replace('/');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setCurrentUserRole(session?.user?.user_metadata?.role || 'User');
      if (session && window.location.pathname === '/login') {
        window.location.replace('/');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch invited emails dynamically
  useEffect(() => {
    const fetchInvites = async () => {
      const { data, error } = await supabase.from('users').select('email');
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
        // Wait 5 seconds, then sign out and redirect to Google
        setTimeout(() => {
          supabase.auth.signOut().then(() => {
            window.location.href = 'https://www.google.com';
          });
        }, 5000);
      }
    }
  }, [session, invitedEmails, isCheckingInvite]);
  const isQA = ['QA Lead', 'QA Engineer', 'QA'].includes(currentUserRole);
  const isManagerOrBoss = ['Manager', 'Boss', 'Project Manager', 'Admin'].includes(currentUserRole);
  const isDeveloper = ['Developer'].includes(currentUserRole);
  const isAdmin = isManagerOrBoss || isQA;

  const canSeeTimeline = isManagerOrBoss || isQA;
  const canSeeTeam = isManagerOrBoss || isQA;
  const canSeeImages = isDeveloper || isQA || isManagerOrBoss;
  const canSeeDocs = isQA;

  // Role-Based Route Protection Logic
  React.useEffect(() => {
    if (currentView === 'timeline' && !canSeeTimeline) setCurrentView('dashboard');
    if (currentView === 'users' && !canSeeTeam) setCurrentView('dashboard');
    if (currentView === 'image-assignments' && !canSeeImages) setCurrentView('dashboard');
    if (currentView === 'docs' && !canSeeDocs) setCurrentView('dashboard');
  }, [currentView, canSeeTimeline, canSeeTeam, canSeeImages, canSeeDocs]);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!authInitialized) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  // If the user is logged in but not invited, show a blocked page
  if (isBlocked) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-3xl font-bold text-red-600 dark:text-red-500 mb-4">You are not invited. Please contact Dawood.</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          This site is invitation‑only. Redirecting you away...
        </p>
      </div>
    );
  }

  if (!session) {
    if (window.location.pathname === '/' || window.location.pathname === '/landing') {
      return <LandingView />;
    }
    return <LoginView />;
  }

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const activeClient = clients.find((c) => c.id === activeProject?.clientId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Banner Header */}
      <header className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur sticky top-0 z-30">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
          
          {/* Brand Logo & Name (Left) */}
          <div className="flex-1 flex justify-start min-w-fit">
            <div className="flex items-center space-x-3">
              <div className="cursor-pointer" onClick={() => setCurrentView('dashboard')}>
                {settings.clientLogo ? (
                  <img src={settings.clientLogo} alt="Client Logo" className="h-9 w-9 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
                ) : (
                  <img src="/logo.jpeg" alt="QAFlow Pro" className="h-9 w-9 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shadow-lg shadow-indigo-500/20" />
                )}
              </div>
              
              <div className="relative">
                <div 
                  className="flex items-center space-x-2 cursor-pointer group"
                  onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
                >
                  <h1 className="text-sm font-extrabold font-display tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                    {activeProject?.name || settings.projectName || 'QAFlow'}
                  </h1>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                  
                  {isAdmin && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsCreateWorkspaceOpen(true); }}
                      className="flex items-center justify-center h-5 w-5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors ml-1"
                      title="Create New Workspace"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Company: <span className="font-semibold text-slate-700 dark:text-slate-350">{activeClient?.name || settings.clientName}</span>
                </p>

                {/* Workspace Dropdown */}
                {isWorkspaceDropdownOpen && (
                  <div className="absolute top-full left-0 mt-3 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 z-50 overflow-hidden">
                    <div className="flex flex-col max-h-[60vh] overflow-y-auto p-2 space-y-1">
                      <div className="px-2 py-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/60 mb-1">
                        Your Workspaces
                      </div>
                      {projects.filter(p => isAdmin || rows.some(r => r.assignedUsers?.includes('admin@qaflow.com') && modules.find(m => m.id === r.moduleId)?.projectId === p.id)).map(project => {
                        const client = clients.find(c => c.id === project.clientId);
                        const isActive = activeProjectId === project.id;
                        return (
                          <button
                            key={project.id}
                            onClick={() => {
                              setActiveClient(project.clientId);
                              setActiveProject(project.id);
                              setActiveModule(null);
                              setIsWorkspaceDropdownOpen(false);
                              setCurrentView('dashboard');
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${isActive ? 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${isActive ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-200 dark:border-indigo-800' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                                <Briefcase className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
                              </div>
                              <div className="text-left">
                                <div className={`text-xs font-bold ${isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`}>{project.name}</div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{client?.name}</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Core View Switcher tabs (Center) */}
          <div className="order-last lg:order-none w-full lg:w-auto overflow-x-auto whitespace-nowrap scroll-hide flex justify-start lg:justify-center mt-2 lg:mt-0 pb-1 lg:pb-0">
            <nav className="flex items-center space-x-0.5 bg-slate-150/80 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-850 p-0.5 rounded-xl w-max">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                currentView === 'dashboard'
                  ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
              }`}
            >
              <LayoutDashboard className="h-3 w-3" />
              <span className="hidden xl:inline">Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentView('table')}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                currentView === 'table'
                  ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
              }`}
            >
              <LayoutGrid className="h-3 w-3" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setCurrentView('kanban')}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                currentView === 'kanban'
                  ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
              }`}
            >
              <Kanban className="h-3 w-3" />
              <span>Kanban</span>
            </button>
            {canSeeImages && (
              <button
                onClick={() => setCurrentView('image-assignments')}
                className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  currentView === 'image-assignments'
                    ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
                }`}
              >
                <ImageIcon className="h-3 w-3" />
                <span>Images</span>
              </button>
            )}
            {canSeeDocs && (
              <button
                onClick={() => setCurrentView('docs')}
                className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  currentView === 'docs'
                    ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
                }`}
              >
                <BookOpen className="h-3 w-3" />
                <span>Docs</span>
              </button>
            )}
            <button
              onClick={() => setCurrentView('analytics')}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                currentView === 'analytics'
                  ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
              }`}
            >
              <BarChart3 className="h-3 w-3" />
              <span>Analytics</span>
            </button>
            {canSeeTimeline && (
              <button
                onClick={() => setCurrentView('timeline')}
                className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  currentView === 'timeline'
                    ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
                }`}
              >
                <CalendarRange className="h-3 w-3" />
                <span>Timeline</span>
              </button>
            )}
            {canSeeTeam && (
              <button
                onClick={() => setCurrentView('users')}
                className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  currentView === 'users'
                    ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
                }`}
              >
                <Users className="h-3 w-3" />
                <span>Team</span>
              </button>
            )}
            <button
              onClick={() => setCurrentView('archive')}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                currentView === 'archive'
                  ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
              }`}
            >
              <Archive className="h-3 w-3" />
              <span>Archive</span>
            </button>
            <button
              onClick={() => setCurrentView('trash')}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                currentView === 'trash'
                  ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
              }`}
            >
              <Trash2 className="h-3 w-3" />
              <span>Trash</span>
            </button>
            </nav>
          </div>

          {/* Action Buttons Toolbar (Right) */}
          <div className="flex-1 flex items-center justify-end gap-2.5 min-w-fit">
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
                <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-900/20 dark:shadow-slate-950/50 z-50 overflow-hidden backdrop-blur-xl">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-2">
                      <Bell className="h-3.5 w-3.5 text-indigo-500" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={clearNotifications}
                      className="text-[9px] font-bold text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    >
                      Clear All
                    </button>
                  </div>

                  {/* Notification List */}
                  <div className="space-y-px max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 px-4">
                        <Bell className="h-8 w-8 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">All caught up!</p>
                        <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5">No recent notifications</p>
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const isAssignment = n.type === 'assignment';
                        const isGeneral = n.type === 'general';
                        return (
                          <div
                            key={n.id}
                            onClick={() => { markNotificationRead(n.id); setIsNotificationsOpen(false); }}
                            className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                              !n.read ? 'bg-indigo-50/60 dark:bg-indigo-500/5' : ''
                            }`}
                          >
                            {/* Icon */}
                            <div className={`mt-0.5 shrink-0 h-7 w-7 rounded-xl flex items-center justify-center ${
                              isAssignment ? 'bg-violet-100 dark:bg-violet-900/30' :
                              isGeneral ? 'bg-sky-100 dark:bg-sky-900/30' :
                              'bg-slate-100 dark:bg-slate-800'
                            }`}>
                              <Bell className={`h-3.5 w-3.5 ${
                                isAssignment ? 'text-violet-600 dark:text-violet-400' :
                                isGeneral ? 'text-sky-600 dark:text-sky-400' :
                                'text-slate-400'
                              }`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs leading-snug ${n.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
                                {n.message}
                              </p>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 block">{n.timestamp}</span>
                            </div>

                            {/* Unread dot */}
                            {!n.read && (
                              <div className="mt-1.5 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Smart Import Wizard */}
            <button
              onClick={() => setIsImportWizardOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-all"
            >
              <Upload className="h-3 w-3" />
              Import
            </button>

            {/* Settings Trigger */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center justify-center p-1.5 text-slate-500 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
              title="Project Settings"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center p-1.5 text-slate-500 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>

            {/* Generate Report */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/10 hover:shadow-lg transition-all"
            >
              Generate Report
            </button>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
              }}
              className="flex items-center justify-center p-1.5 text-rose-500 hover:text-rose-600 bg-rose-50/50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 border border-rose-100 dark:border-rose-900/50 rounded-xl transition-all"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
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
            onAddTestPoint={() => { setEditingRowId(null); setIsAddRowOpen(true); }}
          />
        )}

        {/* Active View Router */}
        <div className="min-h-[400px]">
          {currentView === 'dashboard' && <DashboardView rows={filteredRows} />}

          {currentView === 'table' && (
            <TableView
              rows={filteredRows}
              selectedRowIds={selectedRowIds}
              customFieldsDef={customFieldsDef}
              toggleSelectRow={toggleSelectRow}
              toggleSelectAllRows={toggleSelectAllRows}
              onEditRow={(id) => setEditingRowId(id)}
              onDeleteRow={trashRow}
              onOpenNotes={(id) => setNotesRowId(id)}
              onQuickUpdate={updateRow}
              onOpenDetails={setDetailsRow}
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
          {currentView === 'image-assignments' && <ImageAssignmentsView />}
          {currentView === 'docs' && <DocumentationDashboard />}
          {currentView === 'archive' && <ArchiveView />}
          {currentView === 'trash' && <TrashView />}
        </div>
      </main>

      {/* Bulk Operations Sticky Footer */}
      <BulkActions
        selectedCount={selectedRowIds.length}
        onClear={clearSelection}
        onDeleteSelected={() => {
          if (confirm(`Move ${selectedRowIds.length} selected items to trash?`)) {
            trashMultipleRows(selectedRowIds);
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
      

      <DetailsModal row={detailsRow} onClose={() => setDetailsRow(null)} />

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

      {/* Create Workspace Modal */}
      <Dialog
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
        title="Create Workspace"
        size="md"
      >
        <CreateWorkspaceModal onClose={() => setIsCreateWorkspaceOpen(false)} />
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

      <ChatbotWidget />
    </div>
  );
}
