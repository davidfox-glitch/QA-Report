import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Folder, FolderOpen, LayoutTemplate, Briefcase, FileText, ChevronRight, ChevronDown, BarChart2 } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    clients,
    projects,
    modules,
    activeClientId,
    activeProjectId,
    activeModuleId,
    setActiveClient,
    setActiveProject,
    setActiveModule,
    setCurrentView,
  } = useStore();

  const [expandedClients, setExpandedClients] = useState<Record<string, boolean>>({});
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  const toggleClient = (id: string) => {
    setExpandedClients(prev => ({ ...prev, [id]: !prev[id] }));
    setActiveClient(id);
    setActiveProject(null);
    setActiveModule(null);
  };

  const toggleProject = (id: string, clientId: string) => {
    setExpandedProjects(prev => ({ ...prev, [id]: !prev[id] }));
    setActiveClient(clientId);
    setActiveProject(id);
    setActiveModule(null);
    setCurrentView('dashboard');
  };

  const selectModule = (moduleId: string, projectId: string, clientId: string) => {
    setActiveClient(clientId);
    setActiveProject(projectId);
    setActiveModule(moduleId);
    setCurrentView('table');
  };

  const selectMasterReport = (projectId: string, clientId: string) => {
    setActiveClient(clientId);
    setActiveProject(projectId);
    setActiveModule(null);
    setCurrentView('dashboard'); // Assuming dashboard acts as master report when module is null
  };

  return (
    <div className="w-72 flex-shrink-0 h-[calc(100vh-4rem)] overflow-y-auto bg-slate-900/40 backdrop-blur-xl border-r border-white/5 shadow-2xl sticky top-16 scrollbar-hide">
      <div className="p-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 pl-2">Navigation</h2>
        
        <div className="space-y-2">
          {clients.map(client => {
            const isClientExpanded = expandedClients[client.id];
            const clientProjects = projects.filter(p => p.clientId === client.id);
            const isActiveClient = activeClientId === client.id;

            return (
              <div key={client.id} className="space-y-1">
                <button
                  onClick={() => toggleClient(client.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 ${
                    isActiveClient ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span className="font-semibold text-sm truncate">{client.name}</span>
                  </div>
                  {isClientExpanded ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
                </button>

                {isClientExpanded && (
                  <div className="pl-4 space-y-1 mt-1 border-l border-slate-700/50 ml-4">
                    {clientProjects.map(project => {
                      const isProjectExpanded = expandedProjects[project.id];
                      const projectModules = modules.filter(m => m.projectId === project.id);
                      const isActiveProject = activeProjectId === project.id;

                      return (
                        <div key={project.id} className="space-y-1">
                          <button
                            onClick={() => toggleProject(project.id, client.id)}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-all duration-300 ${
                              isActiveProject && !activeModuleId ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isProjectExpanded ? <FolderOpen className="w-3.5 h-3.5 text-indigo-400" /> : <Folder className="w-3.5 h-3.5" />}
                              <span className="font-medium text-[13px] truncate">{project.name}</span>
                            </div>
                            {isProjectExpanded ? <ChevronDown className="w-3.5 h-3.5 opacity-50" /> : <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                          </button>

                          {isProjectExpanded && (
                            <div className="pl-3 space-y-1 mt-1">
                              {projectModules.map(module => {
                                const isActiveModule = activeModuleId === module.id;
                                return (
                                  <button
                                    key={module.id}
                                    onClick={() => selectModule(module.id, project.id, client.id)}
                                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 ${
                                      isActiveModule ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/20 shadow-[0_0_10px_rgba(217,70,239,0.1)]' : 'text-slate-500 hover:bg-slate-800/30 hover:text-slate-300'
                                    }`}
                                  >
                                    <LayoutTemplate className="w-3.5 h-3.5" />
                                    <span className="text-xs truncate">{module.name}</span>
                                  </button>
                                );
                              })}
                              
                              {/* Master Report Button */}
                              <button
                                onClick={() => selectMasterReport(project.id, client.id)}
                                className={`w-full flex items-center gap-2 px-3 py-1.5 mt-2 rounded-md transition-all duration-200 ${
                                  isActiveProject && !activeModuleId ? 'bg-gradient-to-r from-indigo-600/30 to-fuchsia-600/30 text-white border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300'
                                }`}
                              >
                                <BarChart2 className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold uppercase tracking-wider">Master Report</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {clientProjects.length === 0 && (
                      <div className="px-3 py-2 text-xs text-slate-600 italic">No projects found.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {clients.length === 0 && (
            <div className="px-3 py-4 text-sm text-slate-500 text-center border border-dashed border-slate-700/50 rounded-xl">
              No clients defined yet. Create one in Settings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
