import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../context/AuthContext";
import {
  createTask,
  getAssignableUsers,
} from "../../api/taskApi";

import "./CreateTask.css";

const CreateTask = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    dueDate: "",
    assignedTo: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getAssignableUsers(token);

        const employees = fetchedUsers.filter(
          (currentUser) => currentUser.role === "employee"
        );

        setUsers(employees);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load employees"
        );
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  if (!["admin", "manager"].includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.assignedTo) {
      toast.error("Title and assigned employee are required");
      return;
    }

    try {
      setSubmitting(true);

      await createTask(
        {
          ...formData,
          dueDate: formData.dueDate || undefined,
        },
        token
      );

      toast.success("Task created successfully");
      navigate("/tasks");
    } catch (error) {
      const validationErrors = error.response?.data?.errors;

      if (validationErrors?.length) {
        toast.error(validationErrors[0].message);
      } else {
        toast.error(
          error.response?.data?.message || "Failed to create task"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-shell">
      <Navbar />

      <main className="create-task-main">
        <section className="create-task-header">
          <span className="eyebrow">Task Management</span>
          <h1>Create Task</h1>
          <p>
            Assign finance work with clear ownership, priority, and deadlines.
          </p>
        </section>

        <section className="task-form-card">
          {usersLoading ? (
            <div className="form-loading">
              <Loader2 className="spin" />
              Loading employees...
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="task-form-grid">
                <div className="task-form-field full-width">
                  <label htmlFor="title">Task title</label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    placeholder="Example: Prepare monthly finance report"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div className="task-form-field full-width">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Describe the work and expected outcome"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="task-form-field">
                  <label htmlFor="assignedTo">Assign to</label>
                  <select
                    id="assignedTo"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                  >
                    <option value="">Select employee</option>

                    {users.map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {employee.name} — {employee.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="task-form-field">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="task-form-field">
                  <label htmlFor="status">Initial status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="task-form-field">
                  <label htmlFor="dueDate">Due date</label>
                  <input
                    id="dueDate"
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="task-form-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => navigate("/tasks")}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="create-task-btn"
                  disabled={submitting}
                >
                  {submitting ? "Creating task..." : "Create Task"}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
};

export default CreateTask;