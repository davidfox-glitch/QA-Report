import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Upload, Trash2, ImageIcon, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export const ImageAssignmentsView: React.FC = () => {
  const { imageAssignments, addImageAssignment, deleteImageAssignment, users } = useStore();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [description, setDescription] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      toast.error('Please upload an image.');
      return;
    }
    if (!assignedUserId) {
      toast.error('Please assign to a user.');
      return;
    }

    addImageAssignment({
      imageUrl,
      description,
      assignedUserId,
    });

    toast.success('Image task assigned successfully!');
    setImageUrl('');
    setDescription('');
    setAssignedUserId('');
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-indigo-500" />
            Image Assignments
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Upload images, add descriptions, and assign them directly to team members.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <div className="glass-panel border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/50 pb-3">
              <Upload className="h-4 w-4 text-indigo-500" /> Create Assignment
            </h3>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              {/* Image Uploader */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Upload Image</label>
                {imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={imageUrl} alt="Upload preview" className="w-full h-40 object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:hover:bg-bray-800 dark:bg-slate-800/50 hover:bg-slate-100 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-slate-400" />
                      <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">SVG, PNG, JPG or GIF</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what needs to be done with this image..."
                  className="w-full px-3 py-2 text-sm bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100 min-h-[80px]"
                />
              </div>

              {/* Assignee */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Assign To</label>
                <div className="relative">
                  <select
                    value={assignedUserId}
                    onChange={(e) => setAssignedUserId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100 appearance-none"
                  >
                    <option value="">Select a user...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-colors text-sm mt-4"
              >
                <Send className="h-4 w-4" /> Assign Image
              </button>
            </form>
          </div>
        </div>

        {/* Gallery / List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {imageAssignments.length === 0 ? (
              <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20">
                <ImageIcon className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No images assigned yet.</p>
              </div>
            ) : (
              imageAssignments.map(assignment => {
                const assignedUser = users.find(u => u.id === assignment.assignedUserId);
                return (
                  <div key={assignment.id} className="glass-panel border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm group">
                    <div className="h-40 w-full bg-slate-100 dark:bg-slate-800 relative">
                      <img src={assignment.imageUrl} alt="Assignment" className="w-full h-full object-cover" />
                      <button
                        onClick={() => deleteImageAssignment(assignment.id)}
                        className="absolute top-2 right-2 p-1.5 bg-rose-500/90 text-white rounded-lg hover:bg-rose-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                        {assignment.description || <span className="italic text-slate-400">No description provided.</span>}
                      </p>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/50">
                        <div className="flex items-center gap-2">
                          <img src={assignedUser?.avatar || `https://ui-avatars.com/api/?name=${assignedUser?.name || '?'}`} alt="" className="h-6 w-6 rounded-full border border-slate-200 dark:border-slate-700" />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{assignedUser?.name || 'Unknown User'}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(assignment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
