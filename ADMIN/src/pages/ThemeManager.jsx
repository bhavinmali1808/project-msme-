import { useState, useEffect } from "react";
import { Palette, Save, Trash2, Plus, Edit2, X, Check, Zap } from "lucide-react";
import api from "../api";

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#10b981", "#0ea5e9",
  "#0284c7", "#7c3aed", "#db2777", "#059669",
];

const EMPTY = { name: "", color: "#6366f1", description: "" };

export default function ThemeManager() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); // theme id being edited
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchThemes = async () => {
    try {
      const res = await api.get("/themes");
      setThemes(res.data.themes || []);
    } catch (err) {
      console.error("Failed to fetch themes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchThemes(); }, []);

  const flash = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (t) => { setEditing(t._id); setForm({ name: t.name, color: t.color, description: t.description || "" }); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/themes/${editing}`, form);
        flash("success", "Theme updated!");
      } else {
        await api.post("/themes", form);
        flash("success", "Theme created!");
      }
      setShowForm(false);
      fetchThemes();
    } catch (err) {
      flash("error", err.response?.data?.message || "Save failed.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this theme? Teams registered to it may be affected.")) return;
    try {
      await api.delete(`/themes/${id}`);
      flash("success", "Theme deleted.");
      fetchThemes();
    } catch (err) {
      flash("error", "Delete failed.");
    }
  };

  return (
    <div style={{ padding: "32px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg,#8b5cf6,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Palette size={22} color="white" />
            </div>
            Hackathon Themes
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: "6px 0 0 54px" }}>Define tracks/themes that participants can register teams under</p>
        </div>
        <button onClick={openNew} style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#8b5cf6,#ec4899)", color: "white", border: "none", borderRadius: "12px", padding: "11px 22px", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 14px rgba(139,92,246,0.35)" }}>
          <Plus size={18} /> New Theme
        </button>
      </div>

      {message.text && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "12px", marginBottom: "20px", background: message.type === "success" ? "#d1fae5" : "#fee2e2", color: message.type === "success" ? "#059669" : "#dc2626", fontWeight: 600, fontSize: "14px" }}>
          <Check size={16} /> {message.text}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "white", borderRadius: "20px", width: "100%", maxWidth: "500px", boxShadow: "0 25px 60px rgba(0,0,0,0.25)", overflow: "hidden" }}>
            <div style={{ padding: "22px 26px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontWeight: 800, fontSize: "18px", color: "#0f172a" }}>{editing ? "Edit Theme" : "New Theme"}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={22} /></button>
            </div>
            <form onSubmit={handleSave} style={{ padding: "24px 26px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontWeight: 700, fontSize: "13px", color: "#475569" }}>Theme / Track Name *</span>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. AgriTech, AI & Sustainability" required style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", outline: "none" }} />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontWeight: 700, fontSize: "13px", color: "#475569" }}>Theme Color</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "4px" }}>
                  {PRESET_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                      style={{ width: "28px", height: "28px", borderRadius: "50%", background: c, border: form.color === c ? "3px solid #0f172a" : "2px solid transparent", cursor: "pointer", flexShrink: 0 }} />
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    style={{ width: "44px", height: "40px", padding: "2px", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer" }} />
                  <span style={{ fontSize: "13px", color: "#64748b", fontFamily: "monospace" }}>{form.color}</span>
                  <div style={{ flex: 1, height: "32px", borderRadius: "8px", background: form.color, opacity: 0.3 }} />
                </div>
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontWeight: 700, fontSize: "13px", color: "#475569" }}>Description (Optional)</span>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of this problem space..." rows={3} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", outline: "none", resize: "vertical" }} />
              </label>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: "10px 20px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "white", cursor: "pointer", fontSize: "14px", fontWeight: 600, color: "#475569" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: "10px 24px", background: "linear-gradient(135deg,#8b5cf6,#ec4899)", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Saving..." : (editing ? "Save Changes" : "Create Theme")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Themes Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>Loading themes...</div>
      ) : themes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px", background: "white", borderRadius: "20px", border: "2px dashed #e2e8f0" }}>
          <Palette size={48} style={{ margin: "0 auto 16px", opacity: 0.2 }} />
          <p style={{ fontWeight: 700, color: "#334155", fontSize: "18px", margin: "0 0 6px" }}>No themes yet</p>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>Create your first theme/track for the hackathon.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "16px" }}>
          {themes.map(t => (
            <div key={t._id} style={{ background: "white", borderRadius: "18px", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9" }}>
              {/* Color bar */}
              <div style={{ height: "6px", background: t.color }} />
              <div style={{ padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: t.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Zap size={20} style={{ color: t.color }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "16px", color: "#0f172a" }}>{t.name}</div>
                      <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#94a3b8", marginTop: "2px" }}>{t.color}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => openEdit(t)} style={{ background: "#eef2ff", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Edit2 size={14} color="#6366f1" />
                    </button>
                    <button onClick={() => handleDelete(t._id)} style={{ background: "#fee2e2", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Trash2 size={14} color="#dc2626" />
                    </button>
                  </div>
                </div>
                {t.description && <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: 1.6 }}>{t.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
