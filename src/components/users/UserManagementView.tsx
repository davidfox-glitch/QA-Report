import React, { useState } from 'react';
import { useStore, User } from '../../store/useStore';
import { supabase } from '../../lib/supabase';
import { 
  Mail, 
  Plus, 
  Trash2,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Badge } from '../ui/Badge';
import { Dialog } from '../ui/Dialog';

export const UserManagementView: React.FC = () => {
  const { users, rows, addUser, deleteUser, updateRow, modules } = useStore();
  
  // Selection/editing states
  const [selectedUser, setSelectedUser] = useState<User | null>(users[0] || null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'QA Lead' | 'QA Engineer' | 'Developer' | 'Client' | 'Project Manager'>('QA Engineer');
  const [newUserAvatar, setNewUserAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80');

  // Filter rows assigned to selected user
  const assignedRows = rows.filter(r => r.assignedUsers?.includes(selectedUser?.name || ''));

  const [loading, setLoading] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    setLoading(true);
    
    // Step 1: Insert invite record into Supabase users table (ignore duplicates)
    const { data: insertedRows, error: insertError } = await supabase
      .from('users')
      .upsert([
        {
          email: newUserEmail,
          name: newUserName,
          role: newUserRole,
          avatar: newUserAvatar,
        },
      ], { onConflict: 'email', ignoreDuplicates: true })
      .select();

    if (insertError) {
      console.error('Error creating invite:', insertError.message);
      toast.error('Failed to create invite: ' + insertError.message);
      setLoading(false);
      return;
    }

    // If the email already existed, Supabase returns an empty array in `data` (with ignoreDuplicates: true)
    const isNewInvite = insertedRows && insertedRows.length > 0;
    if (!isNewInvite) {
      toast.error('This email has already been invited.');
      setLoading(false);
      return;
    }

    // Step 2: Send the invitation email via EmailJS (Frontend)
    try {
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            template_params: {
              to_email: newUserEmail,
              to_name: newUserName || 'User',
              role: newUserRole,
              app_url: window.location.origin,
            }
          })
        });

        if (!emailResponse.ok) {
          throw new Error('EmailJS returned ' + emailResponse.statusText);
        }
        toast.success(`Invitation email sent to ${newUserEmail}`);
      } else {
        toast.success(`User added to database! (To send emails, add EmailJS keys in .env)`);
      }
    } catch (emailErr: any) {
      console.warn('Invite saved but email failed to send:', emailErr?.message);
      toast.error(`Failed to send invitation via EmailJS: ${emailErr?.message}`);
    }

    // Step 3: Add to local Zustand store so the UI updates immediately
    const insertedUser = insertedRows?.[0];
    addUser({
      id: insertedUser?.id || `user-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      avatar: newUserAvatar
    });

    // Notify the inviter (current logged‑in user) that an invitation was sent
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      await supabase.from('notifications').insert([
        {
          user_id: user.id,
          title: `Invitation sent to ${newUserEmail}`,
          body: `${newUserName} invited ${newUserEmail} as ${newUserRole}.`,
        },
      ]);
    }

    setLoading(false);

    // Reset form
    setNewUserName('');
    setNewUserEmail('');
    setIsAddUserOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove user "${name}"? all assigned test points will be updated to unassigned.`)) {
      try {
        const userToDelete = users.find(u => u.id === id);
        if (userToDelete && userToDelete.email) {
          // Delete from Supabase first
          const { error } = await supabase.from('users').delete().eq('email', userToDelete.email);
          if (error) {
            console.error('Supabase user delete error:', error.message);
            toast.error('Failed to delete user from server');
            return;
          }
        }
      } catch (err) {
        console.error('Unexpected error deleting user:', err);
        toast.error('Unexpected error while deleting user');
        return;
      }
      // Then update local store
      deleteUser(id);
      // Clean up assigned rows
      rows.forEach(row => {
        if (row.assignedUsers?.includes(name)) {
          updateRow(row.id, { assignedUsers: row.assignedUsers.filter(u => u !== name) });
        }
      });
      if (selectedUser?.id === id) {
        setSelectedUser(users[0] || null);
      }
    }
  };

  return (
    <React.Fragment>
      <Toaster position="top-right" />
      <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">Team Directory</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage platform users, roles, and review task allocations.</p>
        </div>
        <button
          onClick={() => setIsAddUserOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md hover:shadow transition-all"
        >
          <Plus className="h-3.5 w-3.5" /> Invite User
        </button>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Users Directory list */}
        <div className="lg:col-span-2 glass-panel border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-850">
          {users.map((user) => {
            const userTasksCount = rows.filter(r => r.assignedUsers?.includes(user.name)).length;
            const isSelected = selectedUser?.id === user.id;

            return (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-4 flex items-center justify-between hover:bg-slate-50/40 dark:hover:bg-slate-900/10 cursor-pointer transition-all ${
                  isSelected ? 'bg-indigo-500/5 dark:bg-indigo-500/10 border-l-4 border-indigo-500 pl-3' : ''
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      {user.name}
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/30">
                        {user.role}
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                      <Mail className="h-2.5 w-2.5" /> {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">
                      {userTasksCount} Assigned
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-550 block">
                      {rows.filter(r => r.assignedUsers?.includes(user.name) && r.testingStatus === 'Passed').length} Passed
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(user.id, user.name);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-colors"
                    title="Remove User"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Selected User Profile & Task Assignments Card */}
        <div>
          {selectedUser ? (
            <div className="glass-panel border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 space-y-5">
              
              {/* Profile Bio */}
              <div className="text-center space-y-3 pb-4 border-b border-slate-200/50 dark:border-slate-850">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="h-20 w-20 rounded-full object-cover mx-auto border-4 border-indigo-500/10 shadow-md"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedUser.name}</h3>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block mt-1">{selectedUser.role}</span>
                  <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mt-1">
                    <Mail className="h-3 w-3" /> {selectedUser.email}
                  </span>
                </div>
              </div>

              {/* Task Performance statistics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-slate-200/60 dark:border-slate-800/65 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/10 text-center">
                  <span className="text-[9px] font-bold uppercase text-slate-400">Total Items</span>
                  <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-250 mt-1">{assignedRows.length}</h4>
                </div>
                <div className="border border-slate-200/60 dark:border-slate-800/65 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/10 text-center">
                  <span className="text-[9px] font-bold uppercase text-slate-400">QA Pass Rate</span>
                  <h4 className="text-base font-extrabold text-emerald-500 mt-1">
                    {assignedRows.length > 0 
                      ? `${Math.round((assignedRows.filter(r => r.testingStatus === 'Passed').length / assignedRows.length) * 100)}%`
                      : '0%'}
                  </h4>
                </div>
              </div>

              {/* Active Assigned Tasks list */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <UserCheck className="h-3 w-3" /> Active Assigned Tasks
                </h4>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {assignedRows.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-slate-200/50 dark:border-slate-800/40 rounded-xl">
                      <p className="text-[10px] text-slate-400">No active QA tasks assigned.</p>
                    </div>
                  ) : (
                    assignedRows.map(row => (
                      <div
                        key={row.id}
                        className="p-2.5 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/40 rounded-xl space-y-1.5 flex justify-between items-start"
                      >
                        <div className="space-y-0.5 max-w-[75%]">
                          <h5 className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">{row.testPoint}</h5>
                          <span className="text-[9px] text-slate-400 block truncate">{modules.find(m => m.id === row.moduleId)?.name || 'General Module'}</span>
                        </div>
                        <Badge type="testing" value={row.testingStatus} />
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-10 border border-dashed border-slate-250 dark:border-slate-800 text-center rounded-2xl bg-slate-50/10">
              <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-450">Please select a user to view allocations.</p>
            </div>
          )}
        </div>

      </div>
      </div>

    {/* Add User modal dialog */}
      <Dialog isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} title="Invite New Team Member" size="sm">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Name</label>
            <input
              type="text"
              required
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="e.g. Affan Ahmad"
              className="w-full px-3 py-2 text-sm bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
            <input
              type="email"
              required
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="affan@company.com"
              className="w-full px-3 py-2 text-sm bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Role</label>
              <select
                value={newUserRole}
                onChange={(e: any) => setNewUserRole(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
              >
                <option value="QA Lead">QA Lead</option>
                <option value="QA Engineer">QA Engineer</option>
                <option value="Developer">Developer</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Client">Client</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Avatar Set</label>
              <select
                value={newUserAvatar}
                onChange={(e) => setNewUserAvatar(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
              >
                <option value="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80">Avatar Male 1</option>
                <option value="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80">Avatar Female 1</option>
                <option value="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80">Avatar Male 2</option>
                <option value="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80">Avatar Female 2</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 border-t border-slate-200/50 dark:border-slate-800/50 pt-4 mt-6">
            <button
              type="button"
              onClick={() => setIsAddUserOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm transition-all ${
                loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow'
              }`}
            >
              {loading ? 'Sending Invite...' : 'Create Invite'}
            </button>
          </div>
        </form>
      
    </Dialog>
    </React.Fragment>
  );
};
