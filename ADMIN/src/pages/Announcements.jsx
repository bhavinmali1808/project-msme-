import { useState, useEffect } from "react";
import api from "../api";
import {
  Megaphone, Plus, Pencil, Trash2, X, CheckCircle, Eye, EyeOff, Pin
} from "lucide-react";

const TYPE_COLORS = {
  Important: { badge: "#fee2e2", text: "#dc2626", dot: "#ef4444" },
  General:   { badge: "#dbeafe", text: "#2563eb", dot: "#3b82f6" },
  Update:    { badge: "#d1fae5", text: "#059669", dot: "#10b981" },
  Deadline:  { badge: "#fef9c3", text: "#ca8a04", dot: "#eab308" },
};

const EMPTY_FORM = { title: "", body: "", type: "General", audience: "all", isPublished: true, pinned: false };

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/announcements/all");
      setItems(data.announcements || []);
    } catch (e) {
      setError("Failed to load announcements.");
    } finally { setLoading(false); }
  };

  const openNew = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); setError(""); };
  const openEdit = (a) => { setEditing(a._id); setForm({ title: a.title, body: a.body, type: a.type, audience: a.audience, isPublished: a.isPublished, pinned: a.pinned }); setShowForm(true); setError(""); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.body) { setError("Title and body are required."); return; }
    setSaving(true); setError("");
    try {
      if (editing) {
        await api.put(`/announcements/${editing}`, form);
      } else {
        await api.post("/announcements", form);
      }
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this announcement?")) return;
    try { await api.delete(`/announcements/${id}`); fetchAll(); }
    catch (e) { alert("Delete failed."); }
  };

  const togglePublish = async (a) => {
    try { await api.put(`/announcements/${a._id}`, { ...a, isPublished: !a.isPublished }); fetchAll(); }
    catch (e) { alert("Update failed."); }
  };

  return (
    <div style={{ padding: "32px 32px 32px 32px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "12px", margin: 0 }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Megaphone size={22} color="white" />
            </div>
            Announcements
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: "6px 0 0 54px" }}>Create and manage announcements for participants</p>
        </div>
        <button onClick={openNew} style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none", borderRadius: "12px", padding: "11px 22px", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}>
          <Plus size={18} /> New Announcement
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "white", borderRadius: "20px", width: "100%", maxWidth: "580px", boxShadow: "0 25px 60px rgba(0,0,0,0.25)", overflow: "hidden" }}>
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontWeight: 800, fontSize: "18px", color: "#0f172a" }}>{editing ? "Edit Announcement" : "New Announcement"}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={22} /></button>
            </div>
            <form onSubmit={handleSave} style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
              {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px 16px", borderRadius: "10px", fontSize: "13px" }}>{error}</div>}
              
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontWeight: 700, fontSize: "13px", color: "#475569" }}>Title *</span>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Important registration deadline" style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", outline: "none", background: "#f8fafc" }} />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontWeight: 700, fontSize: "13px", color: "#475569" }}>Body *</span>
                <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Write your announcement here..." rows={5} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", outline: "none", resize: "vertical", background: "#f8fafc" }} />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontWeight: 700, fontSize: "13px", color: "#475569" }}>Type</span>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", outline: "none", background: "#f8fafc" }}>
                    <option>General</option>
                    <option>Important</option>
                    <option>Update</option>
                    <option>Deadline</option>
                  </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontWeight: 700, fontSize: "13px", color: "#475569" }}>Audience</span>
                  <select value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", outline: "none", background: "#f8fafc" }}>
                    <option value="all">All Participants</option>
                    <option value="students">Students Only</option>
                    <option value="startups">Startups Only</option>
                  </select>
                </label>
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", userSelect: "none", fontSize: "14px", fontWeight: 600, color: "#475569" }}>
                  <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} style={{ width: "16px", height: "16px", accentColor: "#6366f1" }} />
                  Published
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", userSelect: "none", fontSize: "14px", fontWeight: 600, color: "#475569" }}>
                  <input type="checkbox" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))} style={{ width: "16px", height: "16px", accentColor: "#6366f1" }} />
                  Pin to Top
                </label>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "4px" }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: "10px 20px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "white", cursor: "pointer", fontSize: "14px", fontWeight: 600, color: "#475569" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: "10px 24px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Saving..." : (editing ? "Save Changes" : "Publish")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>Loading announcements...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px", background: "white", borderRadius: "20px", border: "2px dashed #e2e8f0" }}>
          <Megaphone size={48} color="#cbd5e1" style={{ margin: "0 auto 16px" }} />
          <p style={{ fontWeight: 700, color: "#334155", fontSize: "18px", margin: "0 0 6px" }}>No announcements yet</p>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>Click "New Announcement" to create your first one.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {items.map(a => {
            const colors = TYPE_COLORS[a.type] || TYPE_COLORS.General;
            return (
              <div key={a._id} style={{ background: "white", borderRadius: "16px", padding: "20px 24px", display: "flex", gap: "16px", alignItems: "flex-start", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9", opacity: a.isPublished ? 1 : 0.6 }}>
                <div style={{ width: "4px", borderRadius: "4px", background: colors.dot, alignSelf: "stretch", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                    {a.pinned && <span style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", background: "#ede9fe", padding: "2px 8px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "4px" }}><Pin size={10} /> Pinned</span>}
                    <span style={{ fontSize: "12px", fontWeight: 700, color: colors.text, background: colors.badge, padding: "3px 10px", borderRadius: "20px" }}>{a.type}</span>
                    <span style={{ fontSize: "12px", color: "#94a3b8", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "3px 10px", borderRadius: "20px" }}>{a.audience === "all" ? "All" : a.audience}</span>
                    {!a.isPublished && <span style={{ fontSize: "11px", color: "#dc2626", background: "#fee2e2", padding: "2px 8px", borderRadius: "20px", fontWeight: 700 }}>Draft</span>}
                    <span style={{ marginLeft: "auto", fontSize: "12px", color: "#94a3b8" }}>{new Date(a.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  </div>
                  <h3 style={{ margin: "0 0 6px", fontWeight: 800, fontSize: "16px", color: "#0f172a" }}>{a.title}</h3>
                  <p style={{ margin: 0, fontSize: "14px", color: "#64748b", lineHeight: 1.6 }}>{a.body}</p>
                  {a.authorName && <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#cbd5e1" }}>By {a.authorName}</p>}
                </div>
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button onClick={() => togglePublish(a)} title={a.isPublished ? "Unpublish" : "Publish"} style={{ background: a.isPublished ? "#d1fae5" : "#fee2e2", border: "none", borderRadius: "8px", width: "34px", height: "34px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {a.isPublished ? <Eye size={15} color="#059669" /> : <EyeOff size={15} color="#dc2626" />}
                  </button>
                  <button onClick={() => openEdit(a)} style={{ background: "#dbeafe", border: "none", borderRadius: "8px", width: "34px", height: "34px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Pencil size={15} color="#2563eb" />
                  </button>
                  <button onClick={() => handleDelete(a._id)} style={{ background: "#fee2e2", border: "none", borderRadius: "8px", width: "34px", height: "34px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Trash2 size={15} color="#dc2626" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
