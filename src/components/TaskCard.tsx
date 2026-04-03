import { Task } from '@/types/task';
import { CheckCircle2, Circle, Pencil, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onToggleStatus, onEdit, onDelete }: TaskCardProps) {
  const isDone = task.status === 'COMPLETED';

  return (
    <div className={`group relative rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${isDone ? 'bg-slate-50/50 border-slate-200' : 'bg-white border-slate-200'}`}>
      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggleStatus(task.id, task.status)}
          className={`mt-1 flex-shrink-0 transition-colors ${
            isDone ? 'text-primary hover:text-primary-hover' : 'text-slate-300 hover:text-primary'
          }`}
        >
          {isDone ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
        </button>

        <div className="flex-1 space-y-1">
          <h3
            className={`font-semibold text-lg transition-colors ${
              isDone ? 'text-slate-400 line-through' : 'text-slate-900'
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className={`text-sm ${isDone ? 'text-slate-400' : 'text-slate-600'}`}>
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {task.createdAt ? formatDistanceToNow(new Date(task.createdAt), { addSuffix: true }) : 'Recently'}
            </span>
            <div className="h-1 w-1 rounded-full bg-slate-300 mx-1" />
            <span
              className={`px-2 py-0.5 rounded-full font-medium ${
                task.status === 'COMPLETED'
                  ? 'bg-green-100 text-green-700'
                  : task.status === 'IN_PROGRESS'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {task.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onEdit(task)}
            className="rounded-lg p-2 text-slate-400 outline-none transition-colors hover:bg-slate-100 hover:text-slate-700 focus:bg-slate-100 focus:text-slate-700"
            aria-label="Edit Task"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="rounded-lg p-2 text-slate-400 outline-none transition-colors hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600"
            aria-label="Delete Task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
