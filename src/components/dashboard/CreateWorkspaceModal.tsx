import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { X, Upload, Palette } from 'lucide-react';

interface CreateWorkspaceModalProps {
  onClose: () => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ onClose }) => {
  const { addClient, addProject, setActiveClient, setActiveProject, setActiveModule } = useStore();

  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [aiProvider, setAiProvider] = useState('Google Gemini AI');
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');

  const handleSave = () => {
    if (!projectName.trim() || !clientName.trim()) {
      alert("Project Name and Company Name are required.");
      return;
    }

    const clientId = `client-${Date.now()}`;
    const projectId = `proj-${Date.now()}`;

    addClient({
      id: clientId,
      name: clientName,
    });

    addProject({
      id: projectId,
      clientId: clientId,
      name: projectName,
      description: projectDescription
    });

    setActiveClient(clientId);
    setActiveProject(projectId);
    setActiveModule(null);

    // Also update global settings just in case it's used as fallback
    useStore.setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        projectName: projectName,
        clientName: clientName,
        projectDescription: projectDescription
      }
    }));

    onClose();
  };

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
      <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm px-6 py-4 border-b border-slate-800 flex items-center justify-between z-10">
        <h2 className="text-xl font-bold text-white">Create New Workspace</h2>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-8">
        {/* General Settings */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest border-l-2 border-indigo-500 pl-3">General Settings</h3>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. QAFlow"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Company Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Genus Tech Inc"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Project Description</label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
              placeholder="Comprehensive QA tracking..."
            />
          </div>
        </div>

        {/* AI Engine Setup */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 w-5 rounded bg-indigo-500/20 flex items-center justify-center">
              <span className="text-[10px]">🤖</span>
            </div>
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">AI Engine Setup</h3>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">AI Provider</label>
            <select
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            >
              <option>Google Gemini AI</option>
              <option>OpenAI GPT-4</option>
              <option>Anthropic Claude</option>
            </select>
            <p className="text-[10px] text-slate-500 mt-1">AI is powered by the secure dynamic local engine. No API key required.</p>
          </div>
        </div>

        {/* Brand Customization */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Brand Customization</h3>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Company Logo / Branding Icon</label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-slate-800 rounded-xl border border-dashed border-slate-600 flex items-center justify-center text-slate-500">
                Image
              </div>
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-sm font-semibold text-white transition-all flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Image
              </button>
            </div>
            <p className="text-[10px] text-slate-500">Supports PNG, JPEG, SVG or WebP.</p>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-slate-300">Report Primary Color</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-full h-10 bg-slate-800/50 border border-slate-700 rounded-xl cursor-pointer"
              />
              <label className="flex items-center gap-2 text-sm text-slate-300 whitespace-nowrap">
                <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500" />
                Display Logo on PDF
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-sm px-6 py-4 border-t border-slate-800 flex justify-end gap-3 z-10">
        <button
          onClick={onClose}
          className="px-5 py-2.5 text-sm font-bold text-slate-300 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
        >
          Create Workspace
        </button>
      </div>
    </div>
  );
};
