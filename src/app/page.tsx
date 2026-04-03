"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { clearTokens, getAccessToken } from "@/services/api";
import { useTasks } from "@/hooks/useTasks";
import TaskCard from "@/components/TaskCard";
import TaskModal from "@/components/TaskModal";
import { Task, TaskInput } from "@/types/task";
import { Plus, Search, LogOut, Filter, Activity, ChevronLeft, ChevronRight } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const { tasks, loading, error, pagination, currentLimit, goToPage, changeLimit, fetchTasks, addTask, updateTask, deleteTask, toggleStatus } = useTasks();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("ALL");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "error" }[]>([]);

  useEffect(() => {
    // Basic auth check
    if (!getAccessToken()) {
      router.push("/login");
    }
  }, [router]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleSave = async (taskInput: TaskInput) => {
    let success = false;
    if (taskToEdit) {
      success = await updateTask(taskToEdit.id, taskInput);
      if (success) showToast("Task updated successfully!");
      else showToast("Failed to update task", "error");
    } else {
      success = await addTask(taskInput);
      if (success) showToast("Task created successfully!");
      else showToast("Failed to create task", "error");
    }
    return success;
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      const success = await deleteTask(id);
      if (success) showToast("Task deleted successfully!");
      else showToast("Failed to delete task", "error");
    }
  };

  const handleToggle = async (id: string, currentStatus: string) => {
    const success = await toggleStatus(id, currentStatus);
    if (success) showToast("Status updated successfully!");
    else showToast("Failed to update status", "error");
  };

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    clearTokens();
    router.push("/login");
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        t.title.toLowerCase().includes(searchLower) ||
        (t.description && t.description.toLowerCase().includes(searchLower));
      
      const matchesFilter = filter === "ALL" || t.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg px-4 py-3 shadow-lg transition-all animate-in slide-in-from-right-5 text-white ${
              toast.type === "success" ? "bg-slate-800" : "bg-red-600"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
              <Activity className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 hidden sm:block">TaskFlow</h1>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Your Tasks</h2>
            <p className="text-sm text-slate-500">Manage your daily goals and objectives.</p>
          </div>
          
          <button
            onClick={() => {
              setTaskToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            New Task
          </button>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <div className="flex shrink-0 items-center gap-2">
            <Filter className="h-5 w-5 text-slate-400 hidden sm:block" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">All Tasks</option>
              <option value="PENDING">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Done</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        {error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center text-red-600">
            <p>{error}</p>
            <button 
              onClick={() => fetchTasks(pagination.page)} 
              className="mt-3 text-sm font-medium hover:underline"
            >
              Try again
            </button>
          </div>
        ) : loading && tasks.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <Activity className="h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No tasks found</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              {search || filter !== "ALL" 
                ? "Try adjusting your search or filter settings." 
                : "Get started by creating your first task."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleStatus={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!error && (
          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            {/* Limit selector */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <span className="text-sm text-slate-500 font-medium">Per page:</span>
              <button
                onClick={() => changeLimit(-1)}
                disabled={currentLimit <= 1 || loading}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-lg font-bold transition hover:bg-primary hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                −
              </button>
              <span className="min-w-[2rem] text-center text-sm font-bold text-slate-900">{currentLimit}</span>
              <button
                onClick={() => changeLimit(1)}
                disabled={currentLimit >= 50 || loading}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-lg font-bold transition hover:bg-primary hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>

              <span className="text-sm text-slate-600">
                Page{" "}
                <span className="font-semibold text-slate-900">{pagination.page}</span>
                {" "}of{" "}
                <span className="font-semibold text-slate-900">{pagination.totalPages || 1}</span>
                <span className="ml-2 text-slate-400">({pagination.total} tasks)</span>
              </span>

              <button
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setTaskToEdit(null); }}
        onSave={handleSave}
        onDelete={async (id) => {
          const success = await deleteTask(id);
          if (success) showToast("Task deleted successfully!");
          else showToast("Failed to delete task", "error");
          return success;
        }}
        taskToEdit={taskToEdit}
      />
    </div>
  );
}
