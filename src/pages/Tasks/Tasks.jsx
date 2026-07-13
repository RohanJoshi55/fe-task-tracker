import { useEffect, useState } from "react";
import { Loader2, Search, ListTodo } from "lucide-react";
import { toast } from "react-toastify";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import "./Tasks.css";

const Tasks = () => {
  const { token } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    totalPages: 1,
    totalTasks: 0,
  });

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    page: 1,
  });

  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      params.append("page", filters.page);

      const { data } = await api.get(`/tasks?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(data.tasks || []);
      setMeta({
        page: data.page,
        totalPages: data.totalPages,
        totalTasks: data.totalTasks,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters.status, filters.priority, filters.page]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
      page: 1,
    }));
  };

  return (
    <div className="dashboard-shell">
      <Navbar />

      <main className="tasks-main">
        <section className="tasks-header">
          <div>
            <span className="eyebrow">Task Management</span>
            <h1>All Tasks</h1>
            <p>View, filter, and track assigned finance team work.</p>
          </div>

          <div className="tasks-count">
            <ListTodo />
            <strong>{meta.totalTasks}</strong>
            <span>Total Tasks</span>
          </div>
        </section>

        <section className="task-filters">
          <div className="filter-title">
            <Search size={18} />
            Filters
          </div>

          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select name="priority" value={filters.priority} onChange={handleFilterChange}>
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </section>

        <section className="tasks-panel">
          {loading ? (
            <div className="loading-card">
              <Loader2 className="spin" />
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <h3>No tasks found</h3>
              <p>Try changing filters or create a new task.</p>
            </div>
          ) : (
            <div className="tasks-table-wrapper">
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Assigned To</th>
                    <th>Created By</th>
                    <th>Due Date</th>
                  </tr>
                </thead>

                <tbody>
                  {tasks.map((task) => (
                    <tr key={task._id}>
                      <td>
                        <strong>{task.title}</strong>
                        <span>{task.description || "No description"}</span>
                      </td>
                      <td>
                        <span className={`badge status-${task.status}`}>
                          {task.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge priority-${task.priority}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>{task.assignedTo?.name || "N/A"}</td>
                      <td>{task.createdBy?.name || "N/A"}</td>
                      <td>
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "No due date"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pagination">
            <button
              disabled={meta.page <= 1}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
              }
            >
              Previous
            </button>

            <span>
              Page {meta.page} of {meta.totalPages}
            </span>

            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
              }
            >
              Next
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Tasks;