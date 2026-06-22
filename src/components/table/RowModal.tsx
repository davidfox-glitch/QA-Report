import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useStore, FunctionalityStatus, TestingStatus, Priority } from '../../store/useStore';
import { AlertCircle, Calendar, AlignLeft, UserCheck } from 'lucide-react';

interface RowModalProps {
  rowId?: string; // If provided, we are editing. If undefined, we are adding.
  onClose: () => void;
}

interface RowFormInput {
  testPoint: string;
  moduleId: string;
  howToTest: string;
  expectedResult: string;
  actualResult: string;
  functionalityStatus: FunctionalityStatus;
  testingStatus: TestingStatus;
  priority: Priority;
  assignedRole: string;
  assignedUsers: string[];
  startDate: string;
  releaseDate: string;
  customFields: Record<string, string | number>;
}

export const RowModal: React.FC<RowModalProps> = ({ rowId, onClose }) => {
  const { rows, addRow, updateRow, customFieldsDef, users, modules, activeModuleId } = useStore();

  const isEdit = !!rowId;
  const editingRow = rows.find((r) => r.id === rowId);

  const generateBugId = () => `BUG-${Math.floor(1000 + Math.random() * 9000)}`;

  const defaultValues: Partial<RowFormInput> = {
    testPoint: editingRow?.testPoint || '',
    moduleId: editingRow?.moduleId || activeModuleId || '',
    howToTest: editingRow?.howToTest || '',
    expectedResult: editingRow?.expectedResult || '',
    actualResult: editingRow?.actualResult || '',
    functionalityStatus: editingRow?.functionalityStatus || 'Pending',
    testingStatus: editingRow?.testingStatus || 'Pending',
    priority: editingRow?.priority || 'Medium',
    assignedRole: editingRow?.assignedRole || '',
    assignedUsers: editingRow?.assignedUsers || [],
    startDate: editingRow?.startDate || '',
    releaseDate: editingRow?.releaseDate || '',
    customFields: editingRow?.customFields || (customFieldsDef.some(f => f.id === 'cf-bug-id') ? { 'cf-bug-id': generateBugId() } : {})
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors }
  } = useForm<RowFormInput>({ defaultValues });

  const selectedRole = useWatch({ control, name: 'assignedRole' });
  const uniqueRoles = Array.from(new Set(users.map(u => u.role)));
  const filteredUsers = selectedRole ? users.filter(u => u.role === selectedRole) : users;

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all fields?")) {
      reset({
        testPoint: '',
        moduleId: activeModuleId || '',
        howToTest: '',
        expectedResult: '',
        actualResult: '',
        functionalityStatus: 'Pending',
        testingStatus: 'Pending',
        priority: 'Medium',
        assignedRole: '',
        assignedUsers: [],
        startDate: '',
        releaseDate: '',
        customFields: customFieldsDef.some(f => f.id === 'cf-bug-id') ? { 'cf-bug-id': generateBugId() } : {}
      });
    }
  };

  const onSubmit = (data: RowFormInput) => {
    const rowData = {
      testPoint: data.testPoint,
      moduleId: data.moduleId,
      howToTest: data.howToTest,
      expectedResult: data.expectedResult,
      actualResult: data.actualResult,
      functionalityStatus: data.functionalityStatus,
      testingStatus: data.testingStatus,
      priority: data.priority,
      assignedRole: data.assignedRole || undefined,
      assignedUsers: data.assignedUsers && data.assignedUsers.length > 0 ? data.assignedUsers : undefined,
      startDate: data.startDate || undefined,
      releaseDate: data.releaseDate || undefined,
      customFields: data.customFields
    };

    if (isEdit && rowId) {
      updateRow(rowId, rowData);
    } else {
      addRow(rowData);
      // Push notification to assigned users
      if (data.assignedUsers && data.assignedUsers.length > 0) {
        import('../../services/notifications').then(({ sendPush }) => {
          data.assignedUsers.forEach(user => {
            sendPush(user, 'New Test Point Assigned', `A new test point "${data.testPoint}" has been assigned to you.`);
          });
        });
      }
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Side: Standard Fields */}
        <div className="space-y-3">
          
          {/* Test Point */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Test Point / Test Case
            </label>
            <input
              type="text"
              {...register('testPoint', { required: 'Test point description is required' })}
              placeholder="e.g. Verify Login session token cookie secure flags"
              className="w-full px-3 py-2 text-sm bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
            />
            {errors.testPoint && (
              <p className="text-[10px] text-rose-500 flex items-center gap-1 mt-0.5">
                <AlertCircle className="h-3 w-3" /> {errors.testPoint.message}
              </p>
            )}
          </div>

          {/* Module */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Module
            </label>
            <select
              {...register('moduleId', { required: 'Module is required' })}
              className="w-full px-3 py-2 text-sm bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
            >
              <option value="">Select a Module</option>
              {modules.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {errors.moduleId && (
              <p className="text-[10px] text-rose-500 flex items-center gap-1 mt-0.5">
                <AlertCircle className="h-3 w-3" /> {errors.moduleId.message}
              </p>
            )}
          </div>

          {/* How to test */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              How To Test
            </label>
            <textarea
              {...register('howToTest')}
              rows={2}
              placeholder="Step-by-step instructions..."
              className="w-full px-3 py-2 text-sm bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
            />
          </div>

          {/* Expected vs Actual */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Expected Result
              </label>
              <textarea
                {...register('expectedResult', { required: 'Expected result is required' })}
                rows={2}
                placeholder="Describe correct functional behavior..."
                className="w-full px-3 py-2 text-sm bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
              />
              {errors.expectedResult && (
                <p className="text-[10px] text-rose-500 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="h-3 w-3" /> {errors.expectedResult.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Actual Result (Defect logs)
              </label>
              <textarea
                {...register('actualResult')}
                rows={2}
                placeholder="Describe actual bug output (if failing)..."
                className="w-full px-3 py-2 text-sm bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Statuses & Assignee */}
        <div className="space-y-3">
          
          {/* Status Selects Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Functionality */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Functionality Status
              </label>
              <select
                {...register('functionalityStatus')}
                className="w-full px-3 py-2 text-xs bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
              >
                <option value="Working">Working</option>
                <option value="Partially Working">Partially Working</option>
                <option value="Not Working">Not Working</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Testing Status */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Testing Status
              </label>
              <select
                {...register('testingStatus')}
                className="w-full px-3 py-2 text-xs bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Passed">Passed</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Priority */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Priority
              </label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 text-xs bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Assigned Role */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5 text-slate-400" /> Assigned Role
              </label>
              <select
                {...register('assignedRole')}
                onChange={(e) => {
                  register('assignedRole').onChange(e);
                  setValue('assignedUsers', []); // Clear users when role changes
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
              >
                <option value="">Any Role</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Assigned User */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5 text-slate-400" /> Assigned User
              </label>
              <div className="flex flex-col gap-2">
                {useWatch({ control, name: 'assignedUsers' })?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {useWatch({ control, name: 'assignedUsers' }).map((user: string) => (
                      <div key={user} className="flex items-center gap-1 text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
                        <span>{user}</span>
                        <button 
                          type="button"
                          onClick={() => {
                            const current = useWatch({ control, name: 'assignedUsers' }) as string[];
                            setValue('assignedUsers', current.filter(u => u !== user));
                          }}
                          className="text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      const current = useWatch({ control, name: 'assignedUsers' }) || [];
                      setValue('assignedUsers', Array.from(new Set([...current, e.target.value])));
                    }
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
                >
                  <option value="">Add Assignee...</option>
                  {filteredUsers
                    .filter(u => !(useWatch({ control, name: 'assignedUsers' }) || []).includes(u.name))
                    .map(u => (
                      <option key={u.id} value={u.name}>{u.name} ({u.email}) - {u.role}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Timeline Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" /> Start Date
              </label>
              <input
                type="date"
                {...register('startDate')}
                className="w-full px-3 py-2 text-xs bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" /> Release Date
              </label>
              <input
                type="date"
                {...register('releaseDate')}
                className="w-full px-3 py-2 text-xs bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Custom field schema list */}
          {customFieldsDef.length > 0 && (
            <div className="space-y-2 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 bg-slate-50/20 dark:bg-slate-900/10">
              <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <AlignLeft className="h-3 w-3" /> Custom Field Columns
              </h4>
              <div className="grid grid-cols-1 gap-2.5 max-h-[120px] overflow-y-auto pr-1">
                {customFieldsDef.map((field) => (
                  <div key={field.id} className="flex flex-col space-y-1">
                    <label className="text-[11px] font-semibold text-slate-655 dark:text-slate-400">
                      {field.name}
                    </label>
                    <input
                      type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                      {...register(`customFields.${field.id}`)}
                      placeholder={`Enter ${field.name}...`}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center border-t border-slate-200/50 dark:border-slate-800/50 pt-4 mt-6">
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors"
          title="Clear all fields"
        >
          <AlertCircle className="h-3.5 w-3.5" />
          Clear Fields
        </button>
        <div className="flex space-x-2">
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
            {isEdit ? 'Save Changes' : 'Create Entry'}
          </button>
        </div>
      </div>
    </form>
  );
};
