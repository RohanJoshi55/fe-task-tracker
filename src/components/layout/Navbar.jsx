import { LogOut, LayoutDashboard, ListTodo, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

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
        <span><LayoutDashboard size={16} /> Dashboard</span>
        <span><ListTodo size={16} /> Tasks</span>
        {user?.role === "admin" && <span><Users size={16} /> Users</span>}
      </div>

      <div className="nav-user">
        <div>
          <strong>{user?.name}</strong>
          <small>{user?.role}</small>
        </div>

        <button onClick={logout} className="logout-btn">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;