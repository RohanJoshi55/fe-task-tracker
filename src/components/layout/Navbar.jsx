import { Link, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, ListTodo, Users } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
        <Link to="/dashboard">
          <LayoutDashboard size={16} /> Dashboard
        </Link>

        <Link to="/tasks">
          <ListTodo size={16} /> Tasks
        </Link>

        {user?.role === "admin" && (
          <span>
            <Users size={16} /> Users
          </span>
        )}
      </div>

      <div className="nav-user">
        <div>
          <strong>{user?.name}</strong>
          <small>{user?.role}</small>
        </div>

        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;