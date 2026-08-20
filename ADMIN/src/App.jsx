/**
 * Project MSME - Admin Portal
 * Developed and Maintained by Bhavin
 */
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import Participants from "./pages/Participants";
import ThemeManager from "./pages/ThemeManager";
import DepartmentBuilder from "./pages/DepartmentBuilder";
import Universities from "./pages/Universities";
import Announcements from "./pages/Announcements";
import Login from "./pages/Login";
import { LayoutDashboard, Building2, Users, LogOut, Palette, LayoutList, GraduationCap, Megaphone } from "lucide-react";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">MSME Admin</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flexGrow: 1, padding: "8px 0" }}>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/companies" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Building2 size={20} /> MSME Companies
          </NavLink>
          <NavLink to="/universities" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <GraduationCap size={20} /> Universities
          </NavLink>
          <NavLink to="/participants" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={20} /> Participants
          </NavLink>
          <NavLink to="/themes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Palette size={20} /> Theme Builder
          </NavLink>
          <NavLink to="/departments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutList size={20} /> Questionnaire Builder
          </NavLink>
          <NavLink to="/announcements" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Megaphone size={20} /> Announcements
          </NavLink>
        </nav>
        <div style={{ padding: "0 16px", marginTop: "auto", marginBottom: "24px" }}>
          <button onClick={handleLogout} className="btn btn-outline" style={{ width: "100%", color: "var(--text-sidebar)", borderColor: "rgba(255,255,255,0.2)" }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/universities" element={<Universities />} />
          <Route path="/participants" element={<Participants />} />
          <Route path="/themes" element={<ThemeManager />} />
          <Route path="/departments" element={<DepartmentBuilder />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
