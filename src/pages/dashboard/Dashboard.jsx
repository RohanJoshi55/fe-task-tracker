import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, ListTodo, Loader2, PlayCircle } from "lucide-react";
import { toast } from "react-toastify";

import api from "../../api/axios";
import { useAuth } from "../../context/useAuth";
import Navbar from "../../components/layout/Navbar";
import StatCard from "../../components/dashboard/StatCard";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const { data } = await api.get("/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats(data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [token]);

  return (
    <div className="dashboard-shell">
      <Navbar />

      <main className="dashboard-main">
        <section className="welcome-card">
          <div>
            <span className="eyebrow">Welcome back</span>
            <h1>Hello, {user?.name} 👋</h1>
            <p>
              Track work, monitor progress, and keep your finance team aligned.
            </p>
          </div>

          <div className="role-badge">{user?.role}</div>
        </section>

        {loading ? (
          <div className="loading-card">
            <Loader2 className="spin" />
            Loading dashboard...
          </div>
        ) : (
          <section className="stats-grid">
            <StatCard
              title="Total Tasks"
              value={stats?.totalTasks || 0}
              icon={<ListTodo />}
              helper="All visible tasks"
            />
            <StatCard
              title="Pending"
              value={stats?.pendingTasks || 0}
              icon={<Clock3 />}
              helper="Waiting to start"
            />
            <StatCard
              title="In Progress"
              value={stats?.inProgressTasks || 0}
              icon={<PlayCircle />}
              helper="Currently active"
            />
            <StatCard
              title="Completed"
              value={stats?.completedTasks || 0}
              icon={<CheckCircle2 />}
              helper="Finished work"
            />
          </section>
        )}

        <section className="dashboard-grid">
          <div className="glass-panel">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <button>Create Task</button>
              <button>View Tasks</button>
              {user?.role === "admin" && <button>Manage Users</button>}
            </div>
          </div>

          <div className="glass-panel">
            <h3>Recent Activity</h3>
            <p className="muted-text">
              Activity feed will appear here once we connect activity logs.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
