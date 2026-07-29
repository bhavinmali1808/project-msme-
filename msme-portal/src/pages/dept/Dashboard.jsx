import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import DeptLayout from "../../components/layout/DeptLayout";
import api from "../../services/api";
import { DEPARTMENTS_CONFIG } from "../../utils/questions";
import { translations } from "../../i18n/languages";

// ── Speech-to-Text Component ──────────────────────────
function MicButton({ onResult, lang }) {
  const [listening, setListening] = useState(false);

  const toggleMic = () => {
    if (listening) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    // Map our lang codes to BCP 47 codes
    recognition.lang = lang === "hi" ? "hi-IN" : lang === "gu" ? "gu-IN" : "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onResult(transcript);
    };
    recognition.onerror = (e) => {
      console.error("Speech recognition error", e);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    
    recognition.start();
  };

  return (
    <button 
      type="button" 
      onClick={toggleMic}
      style={{
        background: listening ? "#fee2e2" : "#f1f5f9",
        color: listening ? "#ef4444" : "#64748b",
        border: "none",
        borderRadius: "8px",
        width: "36px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
        transition: "all 0.2s"
      }}
      title="Dictate answer (Speech to Text)"
    >
      {listening ? <span style={{ fontSize: 16 }}>🛑</span> : <span style={{ fontSize: 16 }}>🎤</span>}
    </button>
  );
}

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

// ── Custom Question Renderer ──────────────────────────
function CustomQItem({ q, index, answer, onChange }) {
  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderLeft: "5px solid #2563eb",
    borderRadius: "12px",
    padding: "18px 20px",
    marginBottom: "16px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.03)"
  };

  const headerStyle = {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    marginBottom: "14px"
  };

  const badgeStyle = {
    background: "#eff6ff",
    color: "#2563eb",
    fontWeight: 700,
    fontSize: "12px",
    padding: "3px 9px",
    borderRadius: "6px",
    flexShrink: 0
  };

  const titleStyle = {
    fontSize: "14px",
    fontWeight: 600,
    color: "#1e293b",
    lineHeight: 1.5
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        {index && <span style={badgeStyle}>Q{index}</span>}
        <div style={titleStyle}>{q.text}</div>
      </div>

      {q.type === "yesno" && (
        <div className="yesno-row" style={{ display: "flex", gap: "10px" }}>
          {["Yes", "No"].map(opt => (
            <button
              key={opt}
              type="button"
              className={"yesno-btn" + (answer === opt ? " selected" : "")}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: answer === opt ? "2px solid #2563eb" : "1px solid #cbd5e1",
                background: answer === opt ? "#eff6ff" : "#f8fafc",
                color: answer === opt ? "#1e40af" : "#334155",
                fontWeight: 600,
                cursor: "pointer"
              }}
              onClick={() => onChange(q._id, opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {q.type === "scale" && (
        <div>
          <div className="scale-row" style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                className={"scale-btn" + (answer == n ? " selected" : "")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: answer == n ? "2px solid #2563eb" : "1px solid #cbd5e1",
                  background: answer == n ? "#2563eb" : "#f8fafc",
                  color: answer == n ? "#ffffff" : "#334155",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer"
                }}
                onClick={() => onChange(q._id, n)}
              >
                {n}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", fontWeight: 500 }}>
            <span>1 (Low)</span><span>5 (High)</span>
          </div>
        </div>
      )}

      {q.type === "multiline" && (
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <textarea
            className="form-textarea"
            value={answer || ""}
            onChange={e => onChange(q._id, e.target.value)}
            placeholder="Write your detailed answer here…"
            style={{ flex: 1, minHeight: 90, borderRadius: "8px", border: "1px solid #cbd5e1", padding: "10px 12px", fontSize: "14px" }}
          />
          <MicButton lang="en" onResult={(text) => onChange(q._id, (answer || "") + (answer ? " " : "") + text)} />
        </div>
      )}

      {(q.type !== "yesno" && q.type !== "scale" && q.type !== "multiline") && (
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            className="form-input"
            value={answer || ""}
            onChange={e => onChange(q._id, e.target.value)}
            placeholder="Your answer…"
            style={{ flex: 1, borderRadius: "8px", border: "1px solid #cbd5e1", padding: "10px 12px", fontSize: "14px" }}
          />
          <MicButton lang="en" onResult={(text) => onChange(q._id, (answer || "") + (answer ? " " : "") + text)} />
        </div>
      )}
    </div>
  );
}

// ── Dept Questions Renderer (structured with department theme) ─────────────
function DeptQItem({ q, index, lang = "en", answer, onChange }) {
  const text = q.question?.[lang] || q.question?.en || q.question;
  const deptKey = q.departmentId || "operations";
  const theme = DEPT_THEMES[deptKey] || DEPT_THEMES.operations;

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderLeft: `5px solid ${theme.borderLeft}`,
    borderRadius: "12px",
    padding: "18px 20px",
    marginBottom: "16px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.03)"
  };

  const headerStyle = {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    marginBottom: "14px"
  };

  const badgeStyle = {
    background: theme.badgeBg,
    color: theme.badgeText,
    fontWeight: 700,
    fontSize: "12px",
    padding: "3px 10px",
    borderRadius: "6px",
    flexShrink: 0
  };

  const titleStyle = {
    fontSize: "14px",
    fontWeight: 600,
    color: "#1e293b",
    lineHeight: 1.5
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        {index && <span style={badgeStyle}>Q{index}</span>}
        <div style={titleStyle}>{text}</div>
      </div>

      {q.type === "scale" && (
        <div>
          <div className="scale-row" style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                className={"scale-btn" + (answer == n ? " selected" : "")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: answer == n ? `2px solid ${theme.primary}` : "1px solid #cbd5e1",
                  background: answer == n ? theme.primary : "#f8fafc",
                  color: answer == n ? "#ffffff" : "#334155",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer"
                }}
                onClick={() => onChange(q._id, n)}
              >
                {n}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", fontWeight: 500 }}>
            <span>1 (Low)</span><span>5 (High)</span>
          </div>
        </div>
      )}

      {(q.type === "yesNo" || q.type === "yesno") && (
        <div className="yesno-row" style={{ display: "flex", gap: "10px" }}>
          {["Yes", "No"].map(opt => (
            <button
              key={opt}
              type="button"
              className={"yesno-btn" + (answer === opt ? " selected" : "")}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: answer === opt ? `2px solid ${theme.primary}` : "1px solid #cbd5e1",
                background: answer === opt ? theme.bgLight : "#f8fafc",
                color: answer === opt ? theme.textDark : "#334155",
                fontWeight: 600,
                cursor: "pointer"
              }}
              onClick={() => onChange(q._id, opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {q.type === "multiSelect" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(q.options || []).map(opt => {
            const selected = Array.isArray(answer) ? answer : [];
            const checked = selected.includes(opt.value);
            return (
              <label 
                key={opt.value} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 10, 
                  cursor: "pointer", 
                  fontSize: 13,
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: checked ? `1px solid ${theme.borderLeft}` : "1px solid #e2e8f0",
                  background: checked ? theme.bgLight : "#f8fafc",
                  color: checked ? theme.textDark : "#334155",
                  fontWeight: checked ? 600 : 400
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  style={{ width: 16, height: 16, accentColor: theme.primary }}
                  onChange={() => {
                    const next = checked ? selected.filter(v => v !== opt.value) : [...selected, opt.value];
                    onChange(q._id, next);
                  }}
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      )}

      {(q.type === "textarea") && (
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <textarea
            className="form-textarea"
            value={answer || ""}
            onChange={e => onChange(q._id, e.target.value)}
            placeholder="Your answer…"
            style={{ flex: 1, minHeight: 90, borderRadius: "8px", border: "1px solid #cbd5e1", padding: "10px 12px", fontSize: "14px" }}
          />
          <MicButton lang={lang} onResult={(t) => onChange(q._id, (answer || "") + (answer ? " " : "") + t)} />
        </div>
      )}

      {(q.type !== "scale" && q.type !== "yesNo" && q.type !== "yesno" && q.type !== "multiSelect" && q.type !== "textarea") && (
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            className="form-input"
            value={answer || ""}
            onChange={e => onChange(q._id, e.target.value)}
            placeholder="Your answer…"
            style={{ flex: 1, borderRadius: "8px", border: "1px solid #cbd5e1", padding: "10px 12px", fontSize: "14px" }}
          />
          <MicButton lang={lang} onResult={(t) => onChange(q._id, (answer || "") + (answer ? " " : "") + t)} />
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────
export default function DeptDashboard() {
  const { user } = useAuth();
  const [customQuestions, setCustomQuestions] = useState([]);
  const [deptQuestions, setDeptQuestions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [answers, setAnswers] = useState({}); // { questionId: answer }
  const [deptAnswers, setDeptAnswers] = useState({});
  const [problemDetails, setProblemDetails] = useState({ title: "", description: "", solution: "", impact: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // 1. Load custom questions for this dept head
        const cqRes = await api.get("/custom-questions");
        setCustomQuestions(cqRes.data.questions || []);

        // 2. Load previously saved custom answers
        const caRes = await api.get("/custom-answers/my");
        const prevAnswers = {};
        (caRes.data.answers || []).forEach(a => { 
          if (a.questionId === "problem_details") {
            setProblemDetails(a.answer || { title: "", description: "", solution: "", impact: "" });
          } else {
            prevAnswers[a.questionId] = a.answer; 
          }
        });
        setAnswers(prevAnswers);

        // 3. Load dept questions from the Question bank using dept names
        const deptNames = user?.departments?.length > 0 ? user.departments : (user?.department ? [user.department] : []);
        
        let allDeptQs = [];
        let allDeptAns = {};
        let matchedDepts = [];

        for (const deptName of deptNames) {
          // ── Robust matching: covers all 8 DEPARTMENTS_CONFIG entries ──
        const DEPT_ALIASES = {
          operations:   ["operations", "operations & production", "production", "manufacturing", "factory", "plant", "ops", "production head", "plant manager"],
          finance:      ["finance", "finance & working capital", "accounts", "accounting", "accounts head", "financial", "working capital", "cfo", "accounts department"],
          hr:           ["hr", "hr & workforce", "human resources", "human resource", "workforce", "people", "talent", "hr manager", "human resources manager", "people ops"],
          sales:        ["sales", "sales & marketing", "marketing", "business development", "bd", "commercial", "sales manager", "marketing head"],
          supply_chain: ["supply chain", "supply_chain", "procurement", "purchase", "purchasing", "sourcing", "logistics", "supply", "supply chain manager", "logistics head", "procurement head"],
          technology:   ["technology", "it", "information technology", "tech", "digital", "software", "it head", "cto", "technology head", "it manager"],
          regulatory:   ["regulatory", "legal", "compliance", "legal & compliance", "legal head", "regulatory affairs"],
          energy:       ["energy", "sustainability", "environment", "energy management", "green", "esg"],
        };

        const normalise = (s) => (s || "").toLowerCase().replace(/[&_]/g, " ").replace(/\s+/g, " ").trim();

        const matchedDept = DEPARTMENTS_CONFIG.find(d => {
          const norm = normalise(deptName);
          if (normalise(d.id) === norm) return true;
          const tName = translations["en"]?.[d.id]?.name;
          if (normalise(tName) === norm) return true;
          const aliases = DEPT_ALIASES[d.id] || [];
          return aliases.some(alias =>
            normalise(alias) === norm ||
            norm.includes(normalise(alias)) ||
            normalise(alias).includes(norm)
          );
        });

          if (matchedDept) {
            const deptTranslations = translations["en"]?.[matchedDept.id] || {};
            matchedDepts.push({ _id: matchedDept.id, name: deptTranslations.name || matchedDept.id });
            
            const qs = matchedDept.questions.map(q => ({
              _id: `${matchedDept.id}_${q.id}`,
              originalId: q.id,
              departmentId: matchedDept.id,
              departmentName: deptTranslations.name || matchedDept.id,
              type: q.type,
              options: q.options,
              question: { en: deptTranslations[q.id] || `Question ${q.id}` }
            }));
            allDeptQs = [...allDeptQs, ...qs];
            
            // Load previously saved answers
            try {
              const myAnsRes = await api.get(`/answers/my/${matchedDept.id}`);
              (myAnsRes.data.answers || []).forEach(a => { 
                allDeptAns[`${matchedDept.id}_${a.questionId}`] = a.answer; 
              });
            } catch (e) { /* ignore */ }
          }
        }
        
        setDepartments(matchedDepts);
        setDeptQuestions(allDeptQs);
        setDeptAnswers(allDeptAns);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleCustomAnswer = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleDeptAnswer = (qId, val) => {
    setDeptAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      // Build custom answers payload for the old system
      const customPayload = customQuestions.map(q => ({
        questionId: q._id,
        answer: answers[q._id] ?? "",
      }));
      customPayload.push({ questionId: "problem_details", answer: problemDetails });
      await api.post("/custom-answers", { answers: customPayload });

      // Build nested deptSnapshot: { deptId: { qId: answer } } for analytics
      const deptSnapshot = {};
      for (const q of deptQuestions) {
        if (!deptSnapshot[q.departmentId]) deptSnapshot[q.departmentId] = {};
        deptSnapshot[q.departmentId][q.originalId] = deptAnswers[q._id] ?? null;
      }

      // Flat answers array for the old EmployeeAnswer system
      const deptPayload = deptQuestions.map(q => ({
        questionId: q.originalId,
        answer: deptAnswers[q._id] ?? "",
        departmentId: q.departmentId,
      }));

      // Custom answers formatted for analytics snapshot
      const customForAnalytics = customQuestions.map(q => ({
        questionId: q._id,
        questionText: q.text,
        answer: answers[q._id] ?? "",
      }));

      // POST to /api/answers — saves EmployeeAnswer docs AND DeptSubmission JSON snapshot
      await api.post("/answers", {
        answers: deptPayload,
        deptSnapshot,
        customAnswers: customForAnalytics,
        problemDetails,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const progress = (() => {
    const total = customQuestions.length + deptQuestions.length;
    if (total === 0) return 0;
    const filled = [...customQuestions, ...deptQuestions].filter(q => {
      const a = customQuestions.includes(q) ? answers[q._id] : deptAnswers[q._id];
      return a !== undefined && a !== "" && a !== null;
    }).length;
    return Math.round((filled / total) * 100);
  })();

  return (
    <DeptLayout title="My Questionnaire">
      <div className="portal-page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 className="portal-page-title">My Questionnaire</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <p className="portal-page-subtitle" style={{ margin: 0 }}>
                {user?.department} — Fill both panels and save at the bottom.
              </p>
              
              {/* Language Selector */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f8fafc", padding: "4px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 14 }}>🌐</span>
                <select 
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  style={{ border: "none", background: "transparent", fontSize: "12px", fontWeight: "600", color: "#334155", outline: "none", cursor: "pointer" }}
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="gu">ગુજરાતી (Gujarati)</option>
                </select>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-h)" }}>{progress}%</div>
            <div style={{ fontSize: 11, color: "var(--text-sub)" }}>Complete</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: "var(--border)", borderRadius: 4, marginTop: 16, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "var(--accent)", borderRadius: 4, width: `${progress}%`, transition: "width 0.4s" }} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 80, color: "var(--text-sub)" }}>Loading your questionnaire…</div>
      ) : (
        <>
          {error && <div className="auth-error" style={{ marginBottom: 20 }}>{error}</div>}
          {saved && (
            <div style={{ background: "var(--success-bg)", border: "1px solid rgba(22,163,74,0.2)", color: "var(--success)", padding: "12px 16px", borderRadius: "var(--radius)", marginBottom: 20, fontWeight: 600, fontSize: 14 }}>
              ✓ Answers saved successfully!
            </div>
          )}

          <div className="dual-panel">
            {/* LEFT PANEL — Custom Questions */}
            <div className="q-panel">
              <div className="q-panel-header">
                <span style={{ fontSize: 20 }}>❓</span>
                <div>
                  <div className="q-panel-title">Custom Questions</div>
                  <div style={{ fontSize: 11, color: "var(--text-sub)" }}>From your company admin</div>
                </div>
                <span className="badge badge-default" style={{ marginLeft: "auto" }}>
                  {customQuestions.length} questions
                </span>
              </div>
              <div className="q-panel-body">
                {customQuestions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-sub)", fontSize: 13 }}>
                    No custom questions assigned yet.
                  </div>
                ) : (
                  customQuestions.map((q, idx) => (
                    <CustomQItem
                      key={q._id}
                      q={q}
                      index={idx + 1}
                      answer={answers[q._id]}
                      onChange={handleCustomAnswer}
                      lang={lang}
                    />
                  ))
                )}

                {/* The new PROBLEM DETAILS section */}
                <hr style={{ margin: "24px 0", borderTop: "1px solid var(--border)" }} />
                
                <div style={{ padding: "0" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-sub)", letterSpacing: "0.5px", marginBottom: 16 }}>
                    PROBLEM DETAILS
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label" style={{ fontSize: 12 }}>PROBLEM TITLE</label>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. Inventory Management Automation for Textile Business"
                        value={problemDetails.title}
                        onChange={e => setProblemDetails({ ...problemDetails, title: e.target.value })}
                        style={{ flex: 1 }}
                      />
                      <MicButton lang={lang} onResult={(text) => setProblemDetails({ ...problemDetails, title: (problemDetails.title || "") + (problemDetails.title ? " " : "") + text })} />
                    </div>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label" style={{ fontSize: 12 }}>PROBLEM DESCRIPTION</label>
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <textarea 
                        className="form-textarea" 
                        placeholder="Describe the core business problem in detail. What's causing it? What's the impact on your revenue or operations?"
                        style={{ minHeight: 100, flex: 1 }}
                        value={problemDetails.description}
                        onChange={e => setProblemDetails({ ...problemDetails, description: e.target.value })}
                      />
                      <MicButton lang={lang} onResult={(text) => setProblemDetails({ ...problemDetails, description: (problemDetails.description || "") + (problemDetails.description ? " " : "") + text })} />
                    </div>
                  </div>
                  
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-sub)", marginTop: 24, marginBottom: 12, borderBottom: "1px solid var(--border)", paddingBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    EXPECTED OUTCOMES <span style={{ fontWeight: 400, textTransform: "none" }}>— both optional</span>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: 12 }}>EXPECTED SOLUTION <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
                      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <textarea 
                          className="form-textarea" 
                          placeholder="e.g. AI-based inventory dashboard with real-time alerts"
                          style={{ minHeight: 80, flex: 1 }}
                          value={problemDetails.solution}
                          onChange={e => setProblemDetails({ ...problemDetails, solution: e.target.value })}
                        />
                        <MicButton lang={lang} onResult={(text) => setProblemDetails({ ...problemDetails, solution: (problemDetails.solution || "") + (problemDetails.solution ? " " : "") + text })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: 12 }}>EXPECTED IMPACT <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
                      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <textarea 
                          className="form-textarea" 
                          placeholder="e.g. Reduce stock loss by 20% and save 10 hours/week"
                          style={{ minHeight: 80, flex: 1 }}
                          value={problemDetails.impact}
                          onChange={e => setProblemDetails({ ...problemDetails, impact: e.target.value })}
                        />
                        <MicButton lang={lang} onResult={(text) => setProblemDetails({ ...problemDetails, impact: (problemDetails.impact || "") + (problemDetails.impact ? " " : "") + text })} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL — Dept Structured Questions */}
            <div className="q-panel">
              <div className="q-panel-header">
                <span style={{ fontSize: 20 }}>🏢</span>
                <div>
                  <div className="q-panel-title">Department Questions</div>
                  <div style={{ fontSize: 11, color: "var(--text-sub)" }}>
                    {departments.map(d => d.name).join(" + ") || "Standard assessment"}
                  </div>
                </div>
                <span className="badge badge-default" style={{ marginLeft: "auto" }}>
                  {deptQuestions.length} questions
                </span>
              </div>
              <div className="q-panel-body">
                {departments.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-sub)", fontSize: 13 }}>
                    No department questions found for your roles.<br />
                    Your admin can add questions from the Admin panel.
                  </div>
                ) : (
                  departments.map(dept => {
                    const qs = deptQuestions.filter(q => q.departmentId === dept._id);
                    if (qs.length === 0) return null;
                    const theme = DEPT_THEMES[dept._id] || DEPT_THEMES.operations;
                    return (
                      <div key={dept._id} style={{ marginBottom: 32 }}>
                        <div style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: theme.primary,
                          background: theme.bgLight,
                          borderLeft: `4px solid ${theme.borderLeft}`,
                          padding: "10px 14px",
                          borderRadius: "8px",
                          letterSpacing: "0.5px",
                          marginBottom: 16,
                          textTransform: "uppercase",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          <span>{theme.icon}</span> {dept.name} ({qs.length} Questions)
                        </div>
                        {qs.map((q, idx) => (
                          <DeptQItem
                            key={q._id}
                            q={q}
                            index={idx + 1}
                            lang={lang}
                            answer={deptAnswers[q._id]}
                            onChange={handleDeptAnswer}
                          />
                        ))}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Save button */}
          <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "💾 Save All Answers"}
            </button>
          </div>
        </>
      )}
    </DeptLayout>
  );
}
