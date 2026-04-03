import { useState, useEffect, useCallback } from 'react';
import { taskService } from '@/services/api';
import { Task, TaskInput } from '@/types/task';

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [currentLimit, setCurrentLimit] = useState(10);

  const fetchTasks = useCallback(async (page = 1, limit = 10) => {
    if (typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await taskService.getTasks(page, limit);
      setTasks(res.data?.data || []);
      if (res.data?.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(1, 10);
  }, [fetchTasks]);

  const goToPage = (page: number) => {
    fetchTasks(page, currentLimit);
  };

  const changeLimit = (delta: number) => {
    const newLimit = Math.max(1, Math.min(50, currentLimit + delta));
    setCurrentLimit(newLimit);
    fetchTasks(1, newLimit);
  };

  const addTask = async (task: TaskInput) => {
    try {
      await taskService.createTask(task);
      await fetchTasks(pagination.page, currentLimit);
      return true;
    } catch {
      return false;
    }
  };

  const updateTask = async (id: string, task: Partial<TaskInput>) => {
    try {
      await taskService.updateTask(id, task);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...task } : t)) as Task[]);
      return true;
    } catch {
      return false;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      const newPage = tasks.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      await fetchTasks(newPage, currentLimit);
      return true;
    } catch {
      return false;
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await taskService.toggleTaskStatus(id, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus as any } : t)));
      return true;
    } catch {
      return false;
    }
  };

  return { tasks, loading, error, pagination, currentLimit, goToPage, changeLimit, fetchTasks, addTask, updateTask, deleteTask, toggleStatus };
};
