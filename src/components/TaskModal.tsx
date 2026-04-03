import { useState, useEffect } from 'react';
import { Task, TaskInput } from '@/types/task';
import { X, Trash2 } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskInput) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
  taskToEdit?: Task | null;
}

export default function TaskModal({ isOpen, onClose, onSave, onDelete, taskToEdit }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('PENDING');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status as any);
    } else {
      setTitle('');
      setDescription('');
      setStatus('PENDING');
    }
    setConfirmDelete(false);
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await onSave({ title, description, status });
    setLoading(false);
    if (success) onClose();
  };

  const handleDelete = async () => {
    if (!taskToEdit || !onDelete) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    const success = await onDelete(taskToEdit.id);
    setDeleting(false);
    if (success) onClose();
  };

  const statusColors = {
    PENDING: 'bg-slate-100 text-slate-600',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">
              {taskToEdit ? 'Edit Task' : 'New Task'}
            </h2>
            {taskToEdit && (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[taskToEdit.status]}`}>
                {taskToEdit.status.replace('_', ' ')}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Title <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="What needs to be done?"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[110px] resize-y rounded-lg border border-slate-300 p-3 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Add more details..."
            />
          </div>

          {/* Status - shown always so users can set it on create too */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
            <div className="flex gap-2">
              {(['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition-all ${
                    status === s
                      ? s === 'PENDING'
                        ? 'border-slate-400 bg-slate-100 text-slate-700'
                        : s === 'IN_PROGRESS'
                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                        : 'border-green-400 bg-green-50 text-green-700'
                      : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'
                  }`}
                >
                  {s === 'PENDING' ? 'To Do' : s === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
            {/* Delete (edit mode only) */}
            {taskToEdit && onDelete ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600 font-medium">Confirm delete?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-70"
                  >
                    {deleting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Task
                </button>
              )
            ) : (
              <div />
            )}

            {/* Save / Cancel */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-70"
              >
                {loading ? 'Saving...' : taskToEdit ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
