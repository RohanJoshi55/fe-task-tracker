import { useEffect, useMemo, useState } from "react";
import {
  KeyRound,
  Loader2,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

import Navbar from "../../components/layout/Navbar";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useAuth } from "../../context/AuthContext";

import {
  deleteUser,
  getUsers,
  resetUserPassword,
  updateUser,
} from "../../api/userApi";

import "./Users.css";

const emptyEditForm = {
  name: "",
  email: "",
  role: "employee",
};

const Users = () => {
  const { user: currentUser, token } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] =
    useState(false);
  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);

  const [editForm, setEditForm] = useState(emptyEditForm);
  const [newPassword, setNewPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [resettingPassword, setResettingPassword] =
    useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = currentUser?.role === "admin";
  const canViewUsers = ["admin", "manager"].includes(
    currentUser?.role
  );

  const loadUsers = async () => {
    try {
      setLoading(true);

      const fetchedUsers = await getUsers(token);
      setUsers(fetchedUsers);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canViewUsers) {
      loadUsers();
    }
  }, [token, canViewUsers]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.name?.toLowerCase().includes(normalizedSearch) ||
        user.email?.toLowerCase().includes(normalizedSearch);

      const matchesRole =
        !roleFilter || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const roleCounts = useMemo(
    () => ({
      all: users.length,
      admin: users.filter((user) => user.role === "admin")
        .length,
      manager: users.filter(
        (user) => user.role === "manager"
      ).length,
      employee: users.filter(
        (user) => user.role === "employee"
      ).length,
    }),
    [users]
  );

  const openEditModal = (user) => {
    setSelectedUser(user);

    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "employee",
    });

    setEditModalOpen(true);
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setNewPassword("");
    setPasswordModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const closeEditModal = () => {
    if (saving) return;

    setEditModalOpen(false);
    setSelectedUser(null);
    setEditForm(emptyEditForm);
  };

  const closePasswordModal = () => {
    if (resettingPassword) return;

    setPasswordModalOpen(false);
    setSelectedUser(null);
    setNewPassword("");
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault();

    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    try {
      setSaving(true);

      const response = await updateUser(
        selectedUser._id,
        {
          name: editForm.name.trim(),
          email: editForm.email.trim(),
          role: editForm.role,
        },
        token
      );

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user._id === selectedUser._id
            ? response.user
            : user
        )
      );

      toast.success("User updated successfully");
      closeEditModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update user"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (newPassword.length < 6) {
      toast.error(
        "New password must contain at least 6 characters"
      );
      return;
    }

    try {
      setResettingPassword(true);

      await resetUserPassword(
        selectedUser._id,
        newPassword,
        token
      );

      toast.success("User password reset successfully");
      closePasswordModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to reset password"
      );
    } finally {
      setResettingPassword(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setDeleting(true);

      await deleteUser(selectedUser._id, token);

      setUsers((previousUsers) =>
        previousUsers.filter(
          (user) => user._id !== selectedUser._id
        )
      );

      toast.success("User deleted successfully");
      closeDeleteModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete user"
      );
    } finally {
      setDeleting(false);
    }
  };

  if (!canViewUsers) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="dashboard-shell">
      <Navbar />

      <main className="users-main">
        <section className="users-header">
          <div>
            <span className="eyebrow">Team Management</span>
            <h1>Finance Team</h1>
            <p>
              View team members and manage access across the Task
              Tracker.
            </p>
          </div>

          <div className="users-total-card">
            <UsersRound size={24} />
            <strong>{roleCounts.all}</strong>
            <span>Total Users</span>
          </div>
        </section>

        <section className="user-stat-grid">
          <article className="user-stat-card">
            <ShieldCheck size={22} />
            <div>
              <span>Admins</span>
              <strong>{roleCounts.admin}</strong>
            </div>
          </article>

          <article className="user-stat-card">
            <UserRound size={22} />
            <div>
              <span>Managers</span>
              <strong>{roleCounts.manager}</strong>
            </div>
          </article>

          <article className="user-stat-card">
            <UsersRound size={22} />
            <div>
              <span>Employees</span>
              <strong>{roleCounts.employee}</strong>
            </div>
          </article>
        </section>

        <section className="users-toolbar">
          <div className="users-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search by name or email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value)
            }
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
        </section>

        <section className="users-panel">
          {loading ? (
            <div className="users-loading">
              <Loader2 className="spin" />
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="users-empty-state">
              <UsersRound size={38} />
              <h3>No users found</h3>
              <p>Try changing your search or role filter.</p>
            </div>
          ) : (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Joined</th>

                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => {
                    const isCurrentAccount =
                      user._id === currentUser?._id ||
                      user._id === currentUser?.id;

                    return (
                      <tr key={user._id}>
                        <td>
                          <div className="user-identity">
                            <div className="user-avatar">
                              {user.name
                                ?.charAt(0)
                                .toUpperCase() || "U"}
                            </div>

                            <div>
                              <strong>
                                {user.name}

                                {isCurrentAccount && (
                                  <small>You</small>
                                )}
                              </strong>

                              <span>{user.email}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`user-role-badge role-${user.role}`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td>
                          {user.createdAt
                            ? new Date(
                                user.createdAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>

                        {isAdmin && (
                          <td>
                            <div className="user-actions">
                              <button
                                type="button"
                                className="user-action-edit"
                                onClick={() =>
                                  openEditModal(user)
                                }
                              >
                                <Pencil size={16} />
                                Edit
                              </button>

                              <button
                                type="button"
                                className="user-action-password"
                                onClick={() =>
                                  openPasswordModal(user)
                                }
                              >
                                <KeyRound size={16} />
                                Reset
                              </button>

                              <button
                                type="button"
                                className="user-action-delete"
                                onClick={() =>
                                  openDeleteModal(user)
                                }
                                disabled={isCurrentAccount}
                                title={
                                  isCurrentAccount
                                    ? "You cannot delete your own account"
                                    : "Delete user"
                                }
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {editModalOpen && selectedUser && (
        <div
          className="user-modal-overlay"
          onMouseDown={closeEditModal}
        >
          <section
            className="user-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="user-modal-close"
              onClick={closeEditModal}
              disabled={saving}
            >
              <X size={18} />
            </button>

            <span className="eyebrow">Admin Control</span>
            <h2 id="edit-user-title">Edit User</h2>

            <p>
              Update account information and system access for{" "}
              <strong>{selectedUser.name}</strong>.
            </p>

            <form
              className="user-modal-form"
              onSubmit={handleUpdateUser}
            >
              <label>
                Name
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                />
              </label>

              <label>
                Role
                <select
                  name="role"
                  value={editForm.role}
                  onChange={handleEditChange}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </label>

              <div className="user-modal-actions">
                <button
                  type="button"
                  className="user-modal-secondary"
                  onClick={closeEditModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="user-modal-primary"
                  disabled={saving}
                >
                  {saving && (
                    <Loader2 className="spin" size={17} />
                  )}

                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {passwordModalOpen && selectedUser && (
        <div
          className="user-modal-overlay"
          onMouseDown={closePasswordModal}
        >
          <section
            className="user-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-password-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="user-modal-close"
              onClick={closePasswordModal}
              disabled={resettingPassword}
            >
              <X size={18} />
            </button>

            <div className="password-modal-icon">
              <KeyRound size={24} />
            </div>

            <h2 id="reset-password-title">
              Reset Password
            </h2>

            <p>
              Set a new password for{" "}
              <strong>{selectedUser.name}</strong>. Their existing
              password will stop working immediately.
            </p>

            <form
              className="user-modal-form"
              onSubmit={handleResetPassword}
            >
              <label>
                New password
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                />
              </label>

              <div className="user-modal-actions">
                <button
                  type="button"
                  className="user-modal-secondary"
                  onClick={closePasswordModal}
                  disabled={resettingPassword}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="user-modal-primary"
                  disabled={resettingPassword}
                >
                  {resettingPassword && (
                    <Loader2 className="spin" size={17} />
                  )}

                  {resettingPassword
                    ? "Resetting..."
                    : "Reset Password"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete User?"
        message={
          selectedUser
            ? `Are you sure you want to permanently delete "${selectedUser.name}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete User"
        loading={deleting}
        danger
        onConfirm={handleDeleteUser}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};

export default Users;