import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { ProjectSettings, useStore } from '../../store/useStore';
import { Image, Upload, AlertCircle, Bot, Sparkles, Paintbrush } from 'lucide-react';

interface ProjectSettingsModalProps {
  onClose: () => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({ onClose }) => {
  const { settings, updateSettings } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProjectSettings>({
    defaultValues: settings
  });

  const logoValue = watch('clientLogo');
  const aiProviderValue = watch('aiProvider');

  const onSubmit = (data: ProjectSettings) => {
    updateSettings(data);
    onClose();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setValue('clientLogo', event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setValue('clientLogo', '');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      {/* Project details section */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1">
          General Settings
        </h4>
        
        {/* Project Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Project Name
          </label>
          <input
            type="text"
            {...register('projectName', { required: 'Project name is required' })}
            className="w-full px-3 py-2 text-sm bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
          />
          {errors.projectName && (
            <p className="text-[10px] text-rose-500 flex items-center gap-1 mt-0.5">
              <AlertCircle className="h-3 w-3" /> {errors.projectName.message}
            </p>
          )}
        </div>

        {/* Company / Client Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Company Name
          </label>
          <input
            type="text"
            {...register('clientName', { required: 'Company name is required' })}
            className="w-full px-3 py-2 text-sm bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
          />
          {errors.clientName && (
            <p className="text-[10px] text-rose-500 flex items-center gap-1 mt-0.5">
              <AlertCircle className="h-3 w-3" /> {errors.clientName.message}
            </p>
          )}
        </div>

        {/* Project Description */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Project Description
          </label>
          <textarea
            {...register('projectDescription')}
            rows={2}
            className="w-full px-3 py-2 text-sm bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
            placeholder="Brief description showing on reports..."
          />
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-850" />

      {/* AI Integrations settings section */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1">
          <Bot className="h-3.5 w-3.5" /> AI Engine Setup
        </h4>
        
        {/* Provider selection */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            AI Provider
          </label>
          <select
            {...register('aiProvider')}
            className="w-full px-3 py-2 text-sm bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
          >
            <option value="gemini">Google Gemini AI</option>
            <option value="openai">OpenAI GPT Engine</option>
          </select>
        </div>

        {/* API Key */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {aiProviderValue === 'gemini' ? 'Gemini API Key' : 'OpenAI API Key'}
          </label>
          <input
            type="password"
            {...register('apiKey')}
            placeholder={aiProviderValue === 'gemini' ? 'AIzaSy...' : 'sk-proj-...'}
            className="w-full px-3 py-2 text-sm bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100 font-mono"
          />
          <p className="text-[9px] text-slate-400">
            Leave blank to use the secure dynamic local summary engine instead.
          </p>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-850" />

      {/* Branding & styling controls */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1">
          <Paintbrush className="h-3.5 w-3.5" /> Brand Customization
        </h4>

        {/* Company logo upload */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Company Logo / Branding Icon
          </label>
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center overflow-hidden shrink-0">
              {logoValue ? (
                <img src={logoValue} alt="Logo preview" className="h-full w-full object-contain" />
              ) : (
                <Image className="h-6 w-6 text-slate-400 dark:text-slate-500" />
              )}
            </div>
            <div className="flex flex-col space-y-1.5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-100/50 dark:hover:bg-indigo-950/40 rounded-xl transition-all"
                >
                  <Upload className="h-3 w-3" />
                  Upload Image
                </button>
                {logoValue && (
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/15 rounded-xl transition-all"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-[9px] text-slate-400 dark:text-slate-500">
                Supports PNG, JPEG, SVG or WebP.
              </p>
            </div>
          </div>
        </div>

        {/* Branding header and color options */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Report Primary Color
            </label>
            <input
              type="color"
              {...register('reportBranding.primaryColor')}
              className="w-full h-9 p-0.5 rounded-xl bg-transparent border border-slate-200 dark:border-slate-800 cursor-pointer"
            />
          </div>

          <div className="space-y-1 flex flex-col justify-end pb-1">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                {...register('reportBranding.showLogo')}
                className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500/30 h-4 w-4 cursor-pointer"
              />
              <span>Display Logo on PDF</span>
            </label>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            PDF Report Brand Header Template
          </label>
          <input
            type="text"
            {...register('reportBranding.headerTemplate')}
            className="w-full px-3 py-2 text-sm bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-2 border-t border-slate-200/50 dark:border-slate-800/50 pt-4 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm hover:shadow transition-all"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};
