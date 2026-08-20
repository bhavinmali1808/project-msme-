import { useState, useEffect } from "react";
import { Users, Building2, Activity, GraduationCap, Megaphone, Palette, ChevronRight, ArrowUpRight, CheckCircle, Clock } from "lucide-react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentCompanies, setRecentCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [compRes, partRes, teamsRes, uniRes] = await Promise.all([
          api.get("/admin/companies"),
          api.get("/admin/participants"),
          api.get("/admin/teams"),
          api.get("/universities/all"),
        ]);
        const companies = compRes.data || [];
        const participants = partRes.data || [];
        const teams = teamsRes.data || [];
        const universities = uniRes.data || [];

        setStats({
          totalCompanies: companies.length,
          pendingCompanies: companies.filter(c => c.approvalStatus === "pending").length,
          approvedCompanies: companies.filter(c => c.approvalStatus === "approved").length,
          totalParticipants: participants.length,
          pendingParticipants: participants.filter(p => p.approvalStatus === "pending").length,
          totalTeams: teams.length,
          totalUniversities: universities.length,
          pendingUniversities: universities.filter(u => u.approvalStatus === "pending").length,
        });

        setRecentCompanies(companies.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ icon, label, value, sub, color, gradient, onClick }) => (
    <button
      onClick={onClick}
      style={{
        background: "white", border: "1px solid #f1f5f9", borderRadius: "20px",
        padding: "24px", cursor: onClick ? "pointer" : "default", textAlign: "left",
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)", transition: "all 0.18s",
        display: "flex", flexDirection: "column", gap: "16px", width: "100%",
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; e.currentTarget.style.transform = "translateY(-3px)"; }}}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${color}40` }}>
          {icon}
        </div>
        {onClick && <ArrowUpRight size={18} color="#94a3b8" />}
      </div>
      <div>
        <div style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{value ?? "—"}</div>
        <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px", fontWeight: 600 }}>{label}</div>
        {sub && <div style={{ fontSize: "12px", color: color, marginTop: "4px", fontWeight: 700 }}>{sub}</div>}
      </div>
    </button>
  );

  return (
    <div style={{ padding: "32px", minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Control Center</h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", margin: "6px 0 0" }}>MSME Hackathon 2026 — Overview</p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px", color: "#94a3b8" }}>Loading dashboard...</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: "16px", marginBottom: "32px" }}>
            <StatCard
              icon={<Building2 size={24} color="white" />}
              label="MSME Companies"
              value={stats?.totalCompanies}
              sub={stats?.pendingCompanies > 0 ? `${stats.pendingCompanies} pending approval` : `${stats?.approvedCompanies} approved`}
              color="#6366f1"
              gradient="linear-gradient(135deg,#6366f1,#8b5cf6)"
              onClick={() => navigate("/companies")}
            />
            <StatCard
              icon={<Users size={24} color="white" />}
              label="Total Participants"
              value={stats?.totalParticipants}
              sub={stats?.pendingParticipants > 0 ? `${stats.pendingParticipants} pending` : "All approved"}
              color="#0ea5e9"
              gradient="linear-gradient(135deg,#0ea5e9,#38bdf8)"
              onClick={() => navigate("/participants")}
            />
            <StatCard
              icon={<GraduationCap size={24} color="white" />}
              label="Universities"
              value={stats?.totalUniversities}
              sub={stats?.pendingUniversities > 0 ? `${stats.pendingUniversities} pending approval` : "All active"}
              color="#10b981"
              gradient="linear-gradient(135deg,#10b981,#34d399)"
              onClick={() => navigate("/universities")}
            />
            <StatCard
              icon={<Activity size={24} color="white" />}
              label="Active Teams"
              value={stats?.totalTeams}
              sub="Registered teams"
              color="#f59e0b"
              gradient="linear-gradient(135deg,#f59e0b,#fbbf24)"
            />
          </div>

          {/* Quick Actions + Recent Companies */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "20px" }}>
            {/* Quick Actions */}
            <div style={{ background: "white", borderRadius: "20px", padding: "24px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
              <h2 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>Quick Actions</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { label: "Manage Themes", icon: <Palette size={18} color="#8b5cf6" />, color: "#ede9fe", path: "/themes" },
                  { label: "Post Announcement", icon: <Megaphone size={18} color="#059669" />, color: "#d1fae5", path: "/announcements" },
                  { label: "View Universities", icon: <GraduationCap size={18} color="#0ea5e9" />, color: "#dbeafe", path: "/universities" },
                  { label: "View Participants", icon: <Users size={18} color="#f59e0b" />, color: "#fef9c3", path: "/participants" },
                ].map(a => (
                  <button key={a.path} onClick={() => navigate(a.path)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#fafbff", border: "1px solid #f1f5f9", borderRadius: "12px", cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = a.color; e.currentTarget.style.borderColor = "transparent"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#fafbff"; e.currentTarget.style.borderColor = "#f1f5f9"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>
                      {a.icon} {a.label}
                    </div>
                    <ChevronRight size={16} color="#94a3b8" />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Companies */}
            <div style={{ background: "white", borderRadius: "20px", padding: "24px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>Recent Companies</h2>
                <button onClick={() => navigate("/companies")} style={{ background: "none", border: "none", color: "#6366f1", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>View all <ChevronRight size={14} /></button>
              </div>
              {recentCompanies.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#94a3b8", fontSize: "14px" }}>No companies registered yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {recentCompanies.map(c => {
                    const status = c.approvalStatus || "pending";
                    const colors = { approved: ["#d1fae5", "#059669"], rejected: ["#fee2e2", "#dc2626"], pending: ["#fef9c3", "#ca8a04"] };
                    const [bg, fg] = colors[status] || colors.pending;
                    return (
                      <button key={c._id} onClick={() => navigate("/companies")} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 14px", background: "#fafbff", border: "1px solid #f1f5f9", borderRadius: "12px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#f0f4ff"; e.currentTarget.style.borderColor = "#c7d2fe"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#fafbff"; e.currentTarget.style.borderColor = "#f1f5f9"; }}
                      >
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {c.name?.[0] || "M"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>{c.city || "—"}{c.industry ? ` · ${c.industry}` : ""}</div>
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", background: bg, color: fg, whiteSpace: "nowrap" }}>{status}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
