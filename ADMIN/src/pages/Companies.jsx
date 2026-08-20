import { useEffect, useState } from "react";
import api from "../api";
import {
  Building2, ChevronRight, ArrowLeft, CheckCircle, XCircle, Users,
  Layers, FileText, Search, Clock, MapPin, Globe, Phone, Mail, ChevronDown, ChevronUp
} from "lucide-react";

const STATUS_COLORS = {
  approved: { bg: "#d1fae5", text: "#059669" },
  rejected: { bg: "#fee2e2", text: "#dc2626" },
  pending:  { bg: "#fef9c3", text: "#ca8a04" },
};

function Badge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", background: c.bg, color: c.text, textTransform: "capitalize" }}>
      {status || "pending"}
    </span>
  );
}

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [expandedDept, setExpandedDept] = useState(null);
  const [expandedEmployee, setExpandedEmployee] = useState(null);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/companies");
      setCompanies(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCompanies(); }, []);

  const openCompany = async (company) => {
    setSelectedCompany(company);
    setDetails(null);
    setExpandedDept(null);
    setExpandedEmployee(null);
    setDetailsLoading(true);
    try {
      const res = await api.get(`/admin/companies/${company._id}/details`);
      setDetails(res.data);
    } catch (e) { console.error(e); }
    finally { setDetailsLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/companies/${id}/status`, { status });
      fetchCompanies();
      if (selectedCompany?._id === id) setSelectedCompany(prev => ({ ...prev, approvalStatus: status }));
    } catch (e) { alert("Update failed."); }
  };

  const filtered = companies.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase()) ||
    c.industry?.toLowerCase().includes(search.toLowerCase())
  );

  // ── DETAIL VIEW ──
  if (selectedCompany) {
    return (
      <div style={{ padding: "32px", minHeight: "100vh", background: "#f8fafc" }}>
        <button onClick={() => setSelectedCompany(null)} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#6366f1", fontWeight: 700, fontSize: "14px", background: "none", border: "none", cursor: "pointer", marginBottom: "24px" }}>
          <ArrowLeft size={18} /> Back to Companies
        </button>

        {/* Company Header */}
        <div style={{ background: "white", borderRadius: "20px", padding: "28px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", fontWeight: 800, color: "white" }}>
              {selectedCompany.name?.[0] || "M"}
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>{selectedCompany.name}</h1>
              <div style={{ display: "flex", gap: "16px", marginTop: "6px", flexWrap: "wrap" }}>
                {selectedCompany.city && <span style={{ fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={13} />{selectedCompany.city}, {selectedCompany.state}</span>}
                {selectedCompany.industry && <span style={{ fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}><Layers size={13} />{selectedCompany.industry}</span>}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Badge status={selectedCompany.approvalStatus} />
            {(selectedCompany.approvalStatus === "pending" || !selectedCompany.approvalStatus) && (
              <>
                <button onClick={() => updateStatus(selectedCompany._id, "approved")} style={{ background: "#d1fae5", color: "#059669", border: "none", borderRadius: "10px", padding: "8px 16px", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}><CheckCircle size={15} /> Approve</button>
                <button onClick={() => updateStatus(selectedCompany._id, "rejected")} style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "10px", padding: "8px 16px", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}><XCircle size={15} /> Reject</button>
              </>
            )}
          </div>
        </div>

        {detailsLoading && <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>Loading company details...</div>}

        {details && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: "14px" }}>
              {[
                { label: "Dept. Heads", value: details.departments?.length || 0, color: "#6366f1", bg: "#eef2ff" },
                { label: "Employees", value: details.employees?.length || 0, color: "#0ea5e9", bg: "#e0f2fe" },
                { label: "Answers Submitted", value: Object.values(details.answersByDept || {}).flat().length, color: "#059669", bg: "#d1fae5" },
                { label: "Questionnaire Resp.", value: details.responses?.length || 0, color: "#ca8a04", bg: "#fef9c3" },
              ].map(s => (
                <div key={s.label} style={{ background: "white", borderRadius: "14px", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Departments & Answers */}
            <div style={{ background: "white", borderRadius: "20px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
              <h2 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "10px" }}>
                <Layers size={20} color="#6366f1" /> Departments & Submitted Answers
              </h2>

              {(!details.departments || details.departments.length === 0) ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                  <Layers size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                  <p style={{ fontWeight: 600 }}>No department heads found for this company.</p>
                </div>
              ) : details.departments.map(dept => (
                <div key={dept._id} style={{ marginBottom: "12px", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden" }}>
                  {/* Dept Header */}
                  <button
                    onClick={() => setExpandedDept(expandedDept === dept._id ? null : dept._id)}
                    style={{ width: "100%", background: expandedDept === dept._id ? "#f0f4ff" : "#fafbff", border: "none", cursor: "pointer", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                        {dept.name?.[0] || "D"}
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a" }}>{dept.name}</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{dept.email} · {dept.departments?.join(", ") || "No dept codes"}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#6366f1", background: "#eef2ff", padding: "3px 10px", borderRadius: "20px" }}>{dept.answers?.length || 0} answers</span>
                      {expandedDept === dept._id ? <ChevronUp size={18} color="#6366f1" /> : <ChevronDown size={18} color="#94a3b8" />}
                    </div>
                  </button>

                  {/* Dept Answers */}
                  {expandedDept === dept._id && (
                    <div style={{ padding: "16px 20px", borderTop: "1px solid #e2e8f0", background: "white" }}>
                      {dept.answers?.length === 0 ? (
                        <div style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center", padding: "20px" }}>No answers submitted yet for this department head.</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {dept.answers.map((ans, idx) => (
                            <div key={ans._id || idx} style={{ background: "#f8fafc", borderRadius: "10px", padding: "14px 16px", border: "1px solid #e2e8f0" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                                <div>
                                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    Q: {ans.questionId} · Dept: {ans.departmentId}
                                  </div>
                                  <div style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a" }}>
                                    {typeof ans.answer === "object" ? JSON.stringify(ans.answer) : String(ans.answer ?? "—")}
                                  </div>
                                  {ans.employeeId && (
                                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                                      By: {ans.employeeId?.name || "Unknown"} ({ans.employeeId?.email})
                                    </div>
                                  )}
                                </div>
                                {ans.submittedAt && (
                                  <span style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
                                    <Clock size={11} /> {new Date(ans.submittedAt).toLocaleDateString("en-IN")}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Employees */}
            {details.employees?.length > 0 && (
              <div style={{ background: "white", borderRadius: "20px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
                <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "10px" }}>
                  <Users size={20} color="#0ea5e9" /> Employees
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px,1fr))", gap: "12px" }}>
                  {details.employees.map(emp => (
                    <div key={emp._id} style={{ background: "#f8fafc", borderRadius: "12px", padding: "14px 16px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#dbeafe", color: "#2563eb", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {emp.name?.[0] || "?"}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.name}</div>
                        <div style={{ fontSize: "12px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.email}</div>
                      </div>
                      <Badge status={emp.approvalStatus} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div style={{ padding: "32px", minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg,#0ea5e9,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={22} color="white" />
            </div>
            MSME Companies
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: "6px 0 0 54px" }}>Click any company to see departments and submitted answers</p>
        </div>
        <div style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search companies..."
            style={{ paddingLeft: "40px", paddingRight: "16px", paddingTop: "10px", paddingBottom: "10px", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "14px", background: "white", outline: "none", width: "240px" }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px", color: "#94a3b8" }}>Loading companies...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px", background: "white", borderRadius: "20px", border: "2px dashed #e2e8f0" }}>
          <Building2 size={48} style={{ margin: "0 auto 16px", opacity: 0.2 }} />
          <p style={{ fontWeight: 700, color: "#334155", fontSize: "18px", margin: "0 0 6px" }}>No companies found</p>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>Try a different search or check back later.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "16px" }}>
          {filtered.map(company => (
            <button
              key={company._id}
              onClick={() => openCompany(company)}
              style={{ background: "white", border: "1px solid #f1f5f9", borderRadius: "18px", padding: "22px 24px", cursor: "pointer", textAlign: "left", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "all 0.18s", display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(99,102,241,0.15)"; e.currentTarget.style.borderColor = "#c7d2fe"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: 0 }}>
                  <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontWeight: 800, fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {company.name?.[0] || "M"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: "15px", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{company.name}</div>
                    {company.industry && <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{company.industry}</div>}
                  </div>
                </div>
                <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Badge status={company.approvalStatus} />
                  <ChevronRight size={18} color="#94a3b8" />
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                {company.city && <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={12} />{company.city}, {company.state}</span>}
                {company.contactPerson && <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}><Users size={12} />{company.contactPerson}</span>}
              </div>
              {company.employees?.length > 0 && (
                <div style={{ fontSize: "12px", color: "#6366f1", fontWeight: 600, background: "#eef2ff", padding: "4px 10px", borderRadius: "20px", display: "inline-block" }}>
                  {company.employees.length} employee(s) registered
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
