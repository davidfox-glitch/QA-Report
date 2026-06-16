import re
import os

filepath = 'src/store/useStore.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add new Interfaces
interfaces = """export interface Client {
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

export interface CustomFieldDef {"""

content = content.replace("export interface CustomFieldDef {", interfaces)

# 2. Update TestRow
content = content.replace("moduleName: string;", "moduleId: string;")

# 3. Add to DashboardState
dashboard_state_additions = """
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

  addClient: (client: Omit<Client, 'id'>) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  addModule: (module: Omit<Module, 'id'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  updateModule: (id: string, updates: Partial<Module>) => void;
  deleteClient: (id: string) => void;
  deleteProject: (id: string) => void;
  deleteModule: (id: string) => void;

  // Test rows (items) data
"""
content = content.replace("// Test rows (items) data", dashboard_state_additions.strip())

# 4. Modify defaultRows to use moduleId instead of moduleName
content = content.replace("moduleName: 'Authentication - Login',", "moduleId: 'module-1',")
content = content.replace("moduleName: 'Social Manager - Analytics',", "moduleId: 'module-2',")
content = content.replace("moduleName: 'Published Posts Feed',", "moduleId: 'module-3',")
content = content.replace("moduleName: 'Custom Field System',", "moduleId: 'module-4',")

# 5. Add default initial data before create()
initial_data_code = """
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
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load local storage state', e);
  }
  return null;
};
"""
# Replace existing loadLocalStorageState
content = re.sub(r"const loadLocalStorageState = \(\) => \{.*?\n\};\n", initial_data_code.strip() + "\n", content, flags=re.DOTALL)

# 6. Add to the saveState block inside create
save_state_additions = """
        currentView: updatedState.currentView || currentState.currentView,
        clients: updatedState.clients || currentState.clients,
        projects: updatedState.projects || currentState.projects,
        modules: updatedState.modules || currentState.modules,
        activeClientId: updatedState.activeClientId !== undefined ? updatedState.activeClientId : currentState.activeClientId,
        activeProjectId: updatedState.activeProjectId !== undefined ? updatedState.activeProjectId : currentState.activeProjectId,
        activeModuleId: updatedState.activeModuleId !== undefined ? updatedState.activeModuleId : currentState.activeModuleId,
"""
content = content.replace("currentView: updatedState.currentView || currentState.currentView,", save_state_additions.strip())

# 7. Add to the initial returned state inside create
initial_state_additions = """
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

    addClient: (client) => setAndPersist((state) => ({ clients: [...state.clients, { ...client, id: `client-${Date.now()}` }] })),
    addProject: (project) => setAndPersist((state) => ({ projects: [...state.projects, { ...project, id: `proj-${Date.now()}` }] })),
    addModule: (module) => setAndPersist((state) => ({ modules: [...state.modules, { ...module, id: `mod-${Date.now()}` }] })),

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
"""
content = content.replace("currentView: savedState?.currentView || 'dashboard',", initial_state_additions.strip())

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Modification complete.")
