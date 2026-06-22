import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { supabase } from '../../lib/supabase';
import { ChevronDown, Plus, Briefcase, Bell, Search, Settings } from 'lucide-react';

export const TopNavBar: React.FC = () => {
  const {
    settings,
    projects,
    clients,
    modules,
    rows,
    activeProjectId,
    activeClientId,
    currentView,
    setCurrentView,
    notifications,
    setIsAddRowOpen,
    setIsSettingsOpen,
  } = useStore();

  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // We should ideally get session and currentUserRole from App, but we can also manage it here 
  // or fetch from supabase if needed. For simplicity, we'll assume Admin if not provided.
  const currentUserRole = 'Admin'; // Hardcoding to Admin based on our App.tsx change
  const ADMIN_ROLES = ['Admin', 'Manager', 'Boss', 'QA Lead', 'QA Engineer', 'QA', 'Project Manager'];
  const isAdmin = ADMIN_ROLES.includes(currentUserRole);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-surface-container/60 backdrop-blur-xl border-b border-white/10 h-16 flex justify-center items-center">
      <div className="w-full max-w-container-max flex justify-between items-center px-margin-mobile md:px-margin-desktop relative">
        <div className="flex items-center gap-8">
          <div className="relative">
            <span 
              onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
              className="text-headline-md font-headline-md font-bold text-primary tracking-tight cursor-pointer flex items-center gap-2"
            >
              {projects.find(p => p.id === activeProjectId)?.name || settings.projectName || 'QAFlow'}
              <ChevronDown className="w-4 h-4 text-primary/70" />
            </span>
            
            {/* Workspace Dropdown */}
            {isWorkspaceDropdownOpen && (
              <div className="absolute top-full left-0 mt-4 w-72 bg-surface-container-highest border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                <div className="flex flex-col max-h-[60vh] overflow-y-auto p-2 space-y-1">
                  <div className="p-2 text-label-caps text-on-surface-variant uppercase tracking-widest border-b border-white/5 mb-1">
                    Your Workspaces
                  </div>
                  {projects.filter(p => isAdmin || rows.some(r => r.assignedUsers?.includes('admin@qaflow.com') && modules.find(m => m.id === r.moduleId)?.projectId === p.id)).map(project => {
                    const client = clients.find(c => c.id === project.clientId);
                    const isActive = activeProjectId === project.id;
                    return (
                      <button
                        key={project.id}
                        onClick={() => {
                          useStore.getState().setActiveClient(project.clientId);
                          useStore.getState().setActiveProject(project.id);
                          useStore.getState().setActiveModule(null);
                          setIsWorkspaceDropdownOpen(false);
                          setCurrentView('dashboard');
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${isActive ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-surface-container flex items-center justify-center border border-white/5">
                            <Briefcase className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`} />
                          </div>
                          <div className="text-left">
                            <div className={`text-body-sm font-semibold ${isActive ? 'text-primary' : 'text-on-surface'}`}>{project.name}</div>
                            <div className="text-[10px] text-on-surface-variant">{client?.name}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => setCurrentView('dashboard')} className={currentView === 'dashboard' ? "text-primary font-bold border-b-2 border-primary pb-1 font-body-lg" : "text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 font-body-lg"}>Dashboard</button>
            <button onClick={() => setCurrentView('table')} className={currentView === 'table' ? "text-primary font-bold border-b-2 border-primary pb-1 font-body-lg" : "text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 font-body-lg"}>Table</button>
            <button onClick={() => setCurrentView('kanban')} className={currentView === 'kanban' ? "text-primary font-bold border-b-2 border-primary pb-1 font-body-lg" : "text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 font-body-lg"}>Kanban</button>
            <button onClick={() => setCurrentView('analytics')} className={currentView === 'analytics' ? "text-primary font-bold border-b-2 border-primary pb-1 font-body-lg" : "text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 font-body-lg"}>Analytics</button>
            <button onClick={() => setCurrentView('archive')} className={currentView === 'archive' ? "text-primary font-bold border-b-2 border-primary pb-1 font-body-lg" : "text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 font-body-lg"}>Archive</button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-surface-container-low border border-white/10 rounded-lg px-3 py-1.5 gap-2">
            <Search className="text-on-surface-variant w-4 h-4" />
            <input className="bg-transparent border-none focus:ring-0 text-body-sm text-on-surface w-48 p-0" placeholder="Search documentation..." type="text"/>
          </div>
          
          <button onClick={() => setIsAddRowOpen(true)} className="bg-primary hover:opacity-90 text-on-primary-container px-4 py-1.5 rounded-lg font-bold text-body-sm transition-all flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Test Point
          </button>
          
          <div className="flex items-center gap-3 ml-2">
            <div className="relative">
              <Bell onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="w-5 h-5 text-on-surface-variant cursor-pointer hover:text-primary transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-error text-[8px] font-bold text-on-error ring-2 ring-surface">
                  {unreadCount}
                </span>
              )}
            </div>
            
            <Settings onClick={() => setIsSettingsOpen(true)} className="w-5 h-5 text-on-surface-variant cursor-pointer hover:text-primary transition-colors" />
            
            <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/30 cursor-pointer">
              <img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyFM2mue7cKAS-jeY0lS1uGXtm-dDIAaYnXh2DB7paBuHpsmJNOEj8oPG0bcXcgS0-GLnhac3tsZoXQMnLnWcEsjudPNXO1kjFiD4ilbYsDUnWHCosvtgXy8U1OqLjfl_BXkz9D83eReCBqgPeSAtT4TfMzaAEoddPO_mxGbBIEWQqSkWKmORfdX9vMCfgMNmbS-jSvxgPYXsR_qz-3tqoOxOrJoq7iNavoifAlWgiDdPCEJMIUYCLROL6AivV-dvexnqHzPw53K_3"/>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
