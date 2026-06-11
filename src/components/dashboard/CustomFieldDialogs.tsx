import React from 'react';
import { useForm } from 'react-hook-form';
import { useStore } from '../../store/useStore';
import { Trash2, AlertCircle } from 'lucide-react';

// ----------------------------------------------------
// 1. ADD FIELD FORM
// ----------------------------------------------------
interface AddFieldFormProps {
  onClose: () => void;
}

interface AddFieldInput {
  name: string;
  type: 'text' | 'number' | 'date';
}

export const AddFieldForm: React.FC<AddFieldFormProps> = ({ onClose }) => {
  const { addCustomFieldDef } = useStore();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AddFieldInput>({
    defaultValues: { type: 'text' }
  });

  const onSubmit = (data: AddFieldInput) => {
    addCustomFieldDef(data.name, data.type);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Field Name */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Column Name
        </label>
        <input
          type="text"
          {...register('name', { required: 'Column name is required' })}
          placeholder="e.g. Version, Bug Count, QA Owner"
          className="w-full px-3 py-2 text-sm bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
        />
        {errors.name && (
          <p className="text-[10px] text-rose-500 flex items-center gap-1 mt-0.5">
            <AlertCircle className="h-3 w-3" /> {errors.name.message}
          </p>
        )}
      </div>

      {/* Field Type */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Column Type
        </label>
        <select
          {...register('type')}
          className="w-full px-3 py-2 text-sm bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
        >
          <option value="text">Text / String</option>
          <option value="number">Number</option>
          <option value="date">Date</option>
        </select>
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
          Create Column
        </button>
      </div>
    </form>
  );
};

// ----------------------------------------------------
// 2. MANAGE FIELDS VIEW
// ----------------------------------------------------
interface ManageFieldsViewProps {
  onClose: () => void;
}

export const ManageFieldsView: React.FC<ManageFieldsViewProps> = ({ onClose }) => {
  const { customFieldsDef, deleteCustomFieldDef } = useStore();

  return (
    <div className="space-y-4">
      {customFieldsDef.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">
          No custom columns created yet. Click "Add Custom Column" to create one.
        </p>
      ) : (
        <div className="border border-slate-200 dark:border-slate-800/60 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800/60">
          {customFieldsDef.map((field) => (
            <div
              key={field.id}
              className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-900/10 hover:bg-slate-100/30 dark:hover:bg-slate-900/20 transition-all"
            >
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {field.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                  Type: {field.type}
                </p>
              </div>

              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete column "${field.name}"? All cell data in this column will be permanently removed.`)) {
                    deleteCustomFieldDef(field.id);
                  }
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-colors"
                title="Delete Column"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end border-t border-slate-200/50 dark:border-slate-800/50 pt-4 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
