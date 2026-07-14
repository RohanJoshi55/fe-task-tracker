import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  Pencil,
  Save,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../context/AuthContext";
import ConfirmModal from "../../components/common/ConfirmModal";

import {
  deleteTask,
  getAssignableUsers,
  getTaskById,
  updateTask,
  updateTaskStatus,
} from "../../api/taskApi";

import "./TaskDetails.css";

const initialFormState = {
  title: "",
  description: "",
  status: "pending",
  priority: "medium",
  dueDate: "",
  assignedTo: "",
};

const formatDateForInput = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().split("T")[0];
};


const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [task, setTask] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const canManageTask = ["admin", "manager"].includes(user?.role);

  useEffect(() => {
    const loadTaskDetails = async () => {
      try {
        setLoading(true);

        const taskData = await getTaskById(id, token);

        setTask(taskData);

        setFormData({
          title: taskData.title || "",
          description: taskData.description || "",
          status: taskData.status || "pending",
          priority: taskData.priority || "medium",
          dueDate: formatDateForInput(taskData.dueDate),
          assignedTo:
            taskData.assignedTo?._id ||
            taskData.assignedTo ||
            "",
        });

        if (canManageTask) {
          const users = await getAssignableUsers(token);

          setEmployees(
            users.filter(
              (currentUser) => currentUser.role === "employee"
            )
          );
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to load task details"
        );

        navigate("/tasks");
      } finally {
        setLoading(false);
      }
    };

    loadTaskDetails();
  }, [id, token, canManageTask, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const cancelEditing = () => {
    setFormData({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "pending",
      priority: task.priority || "medium",
      dueDate: formatDateForInput(task.dueDate),
      assignedTo:
        task.assignedTo?._id ||
        task.assignedTo ||
        "",
    });

    setEditing(false);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (!formData.assignedTo) {
      toast.error("Assigned employee is required");
      return;
    }

    try {
      setSaving(true);

      const response = await updateTask(
        id,
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          status: formData.status,
          priority: formData.priority,
          dueDate: formData.dueDate || null,
          assignedTo: formData.assignedTo,
        },
        token
      );

      setTask(response.task);

      setFormData({
        title: response.task.title || "",
        description: response.task.description || "",
        status: response.task.status || "pending",
        priority: response.task.priority || "medium",
        dueDate: formatDateForInput(response.task.dueDate),
        assignedTo:
          response.task.assignedTo?._id ||
          response.task.assignedTo ||
          "",
      });

      setEditing(false);
      toast.success("Task updated successfully");
    } catch (error) {
      const validationErrors = error.response?.data?.errors;

      if (validationErrors?.length) {
        toast.error(validationErrors[0].message);
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to update task"
        );
      }
    } finally {
      setSaving(false);
    }
  };

 const handleDelete = async () => {
  try {
    setDeleting(true);

    await deleteTask(id, token);

    toast.success("Task deleted successfully");
    navigate("/tasks");
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to delete task"
    );
  } finally {
    setDeleting(false);
    setDeleteModalOpen(false);
  }
};

const handleEmployeeStatusUpdate = async (event) => {
  const newStatus = event.target.value;

  try {
    setStatusUpdating(true);

    const response = await updateTaskStatus(
      id,
      newStatus,
      token
    );

    setTask(response.task);

    toast.success("Task status updated successfully");
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Failed to update task status"
    );
  } finally {
    setStatusUpdating(false);
  }
};

  if (loading) {
    return (
      <div className="dashboard-shell">
        <Navbar />

        <main className="task-details-main">
          <div className="task-details-loading">
            <Loader2 className="spin" />
            Loading task details...
          </div>
        </main>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div className="dashboard-shell">
      <Navbar />

      <main className="task-details-main">
        <button
          className="task-back-button"
          onClick={() => navigate("/tasks")}
        >
          <ArrowLeft size={18} />
          Back to Tasks
        </button>

        <section className="task-details-header">
          <div>
            <span className="eyebrow">Task Details</span>
            <h1>{task.title}</h1>
            <p>
              Review ownership, deadlines, priority, and current
              progress.
            </p>
          </div>

          <div className="task-details-header-actions">
            {canManageTask && !editing && (
              <>
                <button
                  className="task-edit-button"
                  onClick={() => setEditing(true)}
                >
                  <Pencil size={17} />
                  Edit Task
                </button>

                <button
  className="task-delete-button"
  onClick={() => setDeleteModalOpen(true)}
  disabled={deleting}
>
  <Trash2 size={17} />
  Delete
</button>
              </>
            )}
          </div>
        </section>

        {editing ? (
          <section className="task-edit-panel">
            <form onSubmit={handleUpdate}>
              <div className="task-edit-grid">
                <div className="task-detail-field full-width">
                  <label htmlFor="title">Task title</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div className="task-detail-field full-width">
                  <label htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="task-detail-field">
                  <label htmlFor="assignedTo">
                    Assigned employee
                  </label>
                  <select
                    id="assignedTo"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select employee
                    </option>

                    {employees.map((employee) => (
                      <option
                        key={employee._id}
                        value={employee._id}
                      >
                        {employee.name} — {employee.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="task-detail-field">
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

                <div className="task-detail-field">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">
                      In Progress
                    </option>
                    <option value="completed">
                      Completed
                    </option>
                  </select>
                </div>

                <div className="task-detail-field">
                  <label htmlFor="dueDate">Due date</label>
                  <input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleChange}
                    onClick={(event) =>
                      event.currentTarget.showPicker?.()
                    }
                  />
                </div>
              </div>

              <div className="task-edit-actions">
                <button
                  type="button"
                  className="task-cancel-button"
                  onClick={cancelEditing}
                  disabled={saving}
                >
                  <X size={17} />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="task-save-button"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="spin" size={17} />
                  ) : (
                    <Save size={17} />
                  )}

                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        ) : (
          <section className="task-overview-grid">
            <article className="task-description-card">
              <span className="task-card-label">
                Description
              </span>

              <p>
                {task.description ||
                  "No description was provided for this task."}
              </p>
            </article>

            <article className="task-information-card">
              <div className="task-info-row">
  <span>Status</span>

  {user?.role === "employee" ? (
    <select
      className="employee-status-select"
      value={task.status}
      onChange={handleEmployeeStatusUpdate}
      disabled={statusUpdating}
    >
      <option value="pending">Pending</option>
      <option value="in-progress">In Progress</option>
      <option value="completed">Completed</option>
    </select>
  ) : (
    <strong className={`badge status-${task.status}`}>
      {task.status}
    </strong>
  )}
</div>

              <div className="task-info-row">
                <span>Priority</span>
                <strong
                  className={`badge priority-${task.priority}`}
                >
                  {task.priority}
                </strong>
              </div>

              <div className="task-info-row">
                <span>
                  <UserRound size={16} />
                  Assigned To
                </span>

                <strong>
                  {task.assignedTo?.name || "Not assigned"}
                </strong>
              </div>

              <div className="task-info-row">
                <span>
                  <UserRound size={16} />
                  Created By
                </span>

                <strong>
                  {task.createdBy?.name || "Unknown"}
                </strong>
              </div>

              <div className="task-info-row">
                <span>
                  <CalendarDays size={16} />
                  Due Date
                </span>

                <strong>
                  {task.dueDate
                    ? new Date(
                        task.dueDate
                      ).toLocaleDateString()
                    : "No due date"}
                </strong>
              </div>
            </article>
          </section>
        )}
      </main>

      <ConfirmModal
  isOpen={deleteModalOpen}
  title="Delete Task?"
  message={`Are you sure you want to permanently delete "${task.title}"? This action cannot be undone.`}
  confirmText="Delete Task"
  loading={deleting}
  danger
  onConfirm={handleDelete}
  onCancel={() => setDeleteModalOpen(false)}
/>

    </div>
  );
};

export default TaskDetails;