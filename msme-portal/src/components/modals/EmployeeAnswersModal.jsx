import { useState, useEffect } from "react";
import api from "../../services/api";
import { translations } from "../../i18n/languages";
import { DEPARTMENTS_CONFIG } from "../../utils/questions";

const DEPT_ALIASES = {
  operations: ["operations", "operations & production", "production", "manufacturing", "factory", "plant", "ops"],
  finance: ["finance", "finance & accounts", "finance & working capital", "accounts", "accounting"],
  hr: ["hr", "hr & workforce", "human resources", "human resource", "workforce"],
  sales: ["sales", "sales & marketing", "marketing", "business development"],
  supply_chain: ["supply chain", "supply_chain", "procurement", "purchase", "logistics"],
  technology: ["technology", "it", "information technology", "tech"],
  regulatory: ["regulatory", "legal", "compliance", "regulatory & compliance"],
  energy: ["energy", "sustainability", "energy & sustainability", "environment"],
};

const DEPT_THEMES = {
  operations: { primary: "#2563eb", bgLight: "#eff6ff", borderLeft: "#3b82f6", textDark: "#1e40af", badgeBg: "#dbeafe", badgeText: "#1d4ed8", icon: "⚙️" },
  finance:    { primary: "#059669", bgLight: "#ecfdf5", borderLeft: "#10b981", textDark: "#065f46", badgeBg: "#d1fae5", badgeText: "#047857", icon: "💰" },
  hr:         { primary: "#d97706", bgLight: "#fffbeb", borderLeft: "#f59e0b", textDark: "#92400e", badgeBg: "#fef3c7", badgeText: "#b45309", icon: "👥" },
  sales:      { primary: "#dc2626", bgLight: "#fef2f2", borderLeft: "#ef4444", textDark: "#991b1b", badgeBg: "#fee2e2", badgeText: "#b91c1c", icon: "📈" },
  supply_chain:{ primary: "#7c3aed", bgLight: "#f5f3ff", borderLeft: "#8b5cf6", textDark: "#5b21b6", badgeBg: "#ede9fe", badgeText: "#6d28d9", icon: "🚚" },
  technology: { primary: "#0891b2", bgLight: "#ecfeff", borderLeft: "#06b6d4", textDark: "#155e75", badgeBg: "#cffafe", badgeText: "#0e7490", icon: "💻" },
  regulatory: { primary: "#4b5563", bgLight: "#f8fafc", borderLeft: "#64748b", textDark: "#1e293b", badgeBg: "#e2e8f0", badgeText: "#334155", icon: "📜" },
  energy:     { primary: "#16a34a", bgLight: "#f0fdf4", borderLeft: "#22c55e", textDark: "#166534", badgeBg: "#dcfce7", badgeText: "#15803d", icon: "🌱" }
};

export default function EmployeeAnswersModal({ employeeId, onClose }) {
  const [data, setData] = useState(null);
  const [customQs, setCustomQs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ansRes, qRes] = await Promise.all([
          api.get(`/dept-heads/${employeeId}/answers`),
          api.get("/custom-questions")
        ]);
        setData(ansRes.data);
        setCustomQs(qRes.data.questions || []);
      } catch (err) {
        alert("Failed to load answers.");
      } finally {
        setLoading(false);
      }
    };
    if (employeeId) load();
  }, [employeeId]);

  if (loading) return <div className="modal-overlay"><div className="modal">Loading answers...</div></div>;
  if (!data) return null;

  const getCustomQText = (id) => {
    const q = customQs.find(x => x._id === id);
    return q ? q.question?.en || q.question : id;
  };

  // Extract assigned department codes for this employee
  const assignedDepts = (data.employee?.departments || []).map(deptName => {
    const norm = (deptName || "").toLowerCase().trim();
    for (const [key, aliases] of Object.entries(DEPT_ALIASES)) {
      if (key === norm || aliases.some(alias => norm.includes(alias) || alias.includes(norm))) {
        return key;
      }
    }
    return norm;
  });

  // Build department questions list
  const structuredDepts = DEPARTMENTS_CONFIG.filter(d => assignedDepts.includes(d.id));

  // Helper to find answer for a department question
  const findAnswer = (deptId, qId) => {
    if (!data.deptAnswers) return null;
    const found = data.deptAnswers.find(a => 
      a.departmentId === deptId && (a.questionId === qId || a.questionId === `${deptId}_${qId}`)
    );
    return found ? found.answer : null;
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 800, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 className="modal-title" style={{ margin: 0 }}>Department Answers: {data.employee?.name || "Employee"}</h2>
            <div style={{ fontSize: 13, color: "var(--text-sub)", marginTop: 4 }}>
              Assigned Departments: <strong>{(data.employee?.departments || []).join(", ") || "None"}</strong>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
        </div>

        {/* Structured Department Questions & Answers */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
            Department Questionnaire ({structuredDepts.length > 0 ? structuredDepts.map(d => translations.en[d.id]?.name || d.id).join(", ") : "Standard"})
          </h3>

          {structuredDepts.length === 0 ? (
            /* Fallback display if unmapped */
            data.deptAnswers.length === 0 ? (
              <p style={{ color: "var(--text-sub)", fontSize: 13 }}>No department answers submitted yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.deptAnswers.map(a => (
                  <div key={a._id} style={{ background: "var(--bg-light)", padding: 16, borderRadius: 8, border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>
                      {a.departmentId}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, color: "var(--text-h)" }}>
                      {translations.en?.[a.departmentId]?.[a.questionId] || a.questionId}
                    </div>
                    <div style={{ fontSize: 14, color: "var(--text-main)", background: "#fff", padding: 12, borderRadius: 6, border: "1px solid var(--border)" }}>
                      {String(a.answer)}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            structuredDepts.map(deptConfig => {
              const deptTitle = translations.en[deptConfig.id]?.name || deptConfig.id;
              const deptTranslations = translations.en[deptConfig.id] || {};
              const theme = DEPT_THEMES[deptConfig.id] || DEPT_THEMES.operations;

              return (
                <div key={deptConfig.id} style={{ marginBottom: 24 }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: theme.primary,
                    background: theme.bgLight,
                    borderLeft: `4px solid ${theme.borderLeft}`,
                    padding: "10px 14px",
                    borderRadius: "8px",
                    letterSpacing: "0.5px",
                    marginBottom: 14,
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <span>{theme.icon}</span> {deptTitle} ({deptConfig.questions.length} Questions)
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {deptConfig.questions.map((q, idx) => {
                      const qText = deptTranslations[q.id] || `Question ${q.id}`;
                      const ans = findAnswer(deptConfig.id, q.id);

                      return (
                        <div key={q.id} style={{ background: "#ffffff", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0", borderLeft: `4px solid ${theme.borderLeft}` }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 8, display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span style={{ background: theme.badgeBg, color: theme.badgeText, fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 4, flexShrink: 0 }}>Q{idx + 1}</span>
                            <span>{qText}</span>
                          </div>
                          {ans !== null && ans !== undefined && ans !== "" ? (
                            <div style={{ fontSize: 13, color: theme.textDark, background: theme.bgLight, padding: "10px 12px", borderRadius: 6, border: `1px solid ${theme.badgeBg}`, fontWeight: 600 }}>
                              {Array.isArray(ans) ? ans.join(", ") : String(ans)}
                            </div>
                          ) : (
                            <div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic", background: "#f8fafc", padding: "8px 12px", borderRadius: 6, border: "1px dashed #cbd5e1" }}>
                              ⏳ Not answered yet
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Custom Answers & Problem Details */}
        <div>
          <h3 style={{ fontSize: 16, marginBottom: 12, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>Custom Answers & Problem Details</h3>
          {data.customAnswers.length === 0 ? <p style={{ color: "var(--text-sub)", fontSize: 13 }}>No custom answers submitted yet.</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data.customAnswers.map(a => (
                <div key={a._id} style={{ background: "var(--bg-light)", padding: 16, borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "var(--text-h)" }}>
                    {a.questionId === "problem_details" ? "Problem Details (Suggestions/Issues)" : getCustomQText(a.questionId)}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--text-main)", background: "#fff", padding: 12, borderRadius: 6, border: "1px solid var(--border)" }}>
                    {typeof a.answer === "object" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {a.answer.title && <div><strong style={{fontSize:12, color:"var(--text-sub)"}}>TITLE</strong><br/>{a.answer.title}</div>}
                        {a.answer.description && <div><strong style={{fontSize:12, color:"var(--text-sub)"}}>DESCRIPTION</strong><br/>{a.answer.description}</div>}
                        {a.answer.solution && <div><strong style={{fontSize:12, color:"var(--text-sub)"}}>EXPECTED SOLUTION</strong><br/>{a.answer.solution}</div>}
                        {a.answer.impact && <div><strong style={{fontSize:12, color:"var(--text-sub)"}}>EXPECTED IMPACT</strong><br/>{a.answer.impact}</div>}
                      </div>
                    ) : String(a.answer)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
