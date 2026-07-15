import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ListTodo,
  LogOut,
  Users,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const canViewUsers = ["admin", "manager"].includes(
    user?.role
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getNavClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="brand-logo">TT</div>

        <div>
          <h3>Task Tracker</h3>
          <span>Finance Workspace</span>
        </div>
      </div>

      <div className="nav-links">
        <NavLink
          to="/dashboard"
          className={getNavClass}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </NavLink>

        <NavLink to="/tasks" className={getNavClass}>
          <ListTodo size={16} />
          Tasks
        </NavLink>

        {canViewUsers && (
          <NavLink to="/users" className={getNavClass}>
            <Users size={16} />
            Users
          </NavLink>
        )}
      </div>

      <div className="nav-user">
        <div>
          <strong>{user?.name}</strong>
          <small>{user?.role}</small>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="logout-btn"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;