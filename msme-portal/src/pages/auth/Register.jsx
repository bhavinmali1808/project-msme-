import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { translations } from "../../i18n/languages";

// Questionnaire Structural Configuration
const DEPARTMENTS_CONFIG = [
  {
    id: "operations",
    minLabels: { q1: { min: "Never", max: "Always" }, q5: { min: "Very easy", max: "Very difficult" }, q6: { min: "Very dissatisfied", max: "Very satisfied" }, q10: { min: "Not at all", max: "Fully confident" } },
    questions: [
      { id: "q1", type: "scale" },
      { id: "q2", type: "text" },
      { id: "q3", type: "text" },
      { id: "q4", type: "yesNo", followUpPlaceholder: "Describe briefly" },
      { id: "q5", type: "scale" },
      { id: "q6", type: "scale" },
      { id: "q7", type: "yesNo", followUpPlaceholder: "If yes, frequency (weekly / monthly / quarterly)" },
      { id: "q8", type: "text" },
      { id: "q9", type: "text" },
      { id: "q10", type: "scale" },
      { id: "q11", type: "yesNo", followUpPlaceholder: "Describe the system" },
      { id: "q12", type: "text" }
    ]
  },
  {
    id: "finance",
    minLabels: { q3: { min: "Very difficult", max: "Very easy" }, q7: { min: "No visibility", max: "Full clarity" } },
    questions: [
      { id: "q1", type: "text", placeholder: "Number of days" },
      { id: "q2", type: "yesNo", followUpPlaceholder: "Describe impact" },
      { id: "q3", type: "scale" },
      { id: "q4", type: "multiSelect", options: [
        { value: "a", label: "Cash flow timing gaps" },
        { value: "b", label: "High interest on loans" },
        { value: "c", label: "Lack of collateral for credit" },
        { value: "d", label: "GST/tax refund delays" },
        { value: "e", label: "Managing multiple bank accounts and reconciliation" }
      ]},
      { id: "q5", type: "yesNo", followUpPlaceholder: "Which tool?" },
      { id: "q6", type: "text" },
      { id: "q7", type: "scale" },
      { id: "q8", type: "yesNo", followUpPlaceholder: "Approximate value (INR)" },
      { id: "q9", type: "text" },
      { id: "q10", type: "text" }
    ]
  },
  {
    id: "hr",
    minLabels: { q2: { min: "Very easy", max: "Very difficult" }, q7: { min: "Not at all", max: "Fully confident" } },
    questions: [
      { id: "q1", type: "text", placeholder: "% + Yes/No" },
      { id: "q2", type: "scale" },
      { id: "q3", type: "multiSelect", options: [
        { value: "a", label: "Wages" },
        { value: "b", label: "Working conditions" },
        { value: "c", label: "Seasonal migration" },
        { value: "d", label: "Better offers elsewhere" },
        { value: "e", label: "Lack of career growth" }
      ]},
      { id: "q4", type: "yesNo", followUpPlaceholder: "Describe briefly" },
      { id: "q5", type: "text", placeholder: "weeks/months + Yes/No" },
      { id: "q6", type: "yesNo", followUpPlaceholder: "Which area?" },
      { id: "q7", type: "scale" },
      { id: "q8", type: "yesNo", followUpPlaceholder: "Describe the gap if known" },
      { id: "q9", type: "text" },
      { id: "q10", type: "text" }
    ]
  },
  {
    id: "sales",
    minLabels: { q2: { min: "All referral", max: "All active outreach" }, q5: { min: "No clarity", max: "Full clarity" }, q8: { min: "Fully relationship-dependent", max: "Strong lead generation" } },
    questions: [
      { id: "q1", type: "text", placeholder: "% + scale 1–5 for concern" },
      { id: "q2", type: "scale" },
      { id: "q3", type: "yesNo", followUpPlaceholder: "If no, reason" },
      { id: "q4", type: "text" },
      { id: "q5", type: "scale" },
      { id: "q6", type: "yesNo", followUpPlaceholder: "If yes, obstacles / If no, holding back" },
      { id: "q7", type: "text" },
      { id: "q8", type: "scale" },
      { id: "q9", type: "yesNo", followUpPlaceholder: "Reason if known" },
      { id: "q10", type: "text" }
    ]
  },
  {
    id: "supply_chain",
    minLabels: { q3: { min: "Highly volatile", max: "Very stable" }, q6: { min: "No visibility", max: "Full real-time view" } },
    questions: [
      { id: "q1", type: "text", placeholder: "number + impact description" },
      { id: "q2", type: "text", placeholder: "frequency" },
      { id: "q3", type: "scale" },
      { id: "q4", type: "yesNo", followUpPlaceholder: "For what % of suppliers?" },
      { id: "q5", type: "text" },
      { id: "q6", type: "scale" },
      { id: "q7", type: "yesNo", followUpPlaceholder: "If yes, frequency and impact" },
      { id: "q8", type: "text", placeholder: "days + Yes/No for consistency" },
      { id: "q9", type: "multiSelect", options: [
        { value: "a", label: "Own fleet" },
        { value: "b", label: "Dedicated 3PL" },
        { value: "c", label: "Ad-hoc transport" },
        { value: "d", label: "Combination" }
      ]},
      { id: "q10", type: "text" }
    ]
  },
  {
    id: "technology",
    minLabels: { q2: { min: "All paper/verbal", max: "Fully digital" }, q5: { min: "Not at all", max: "Fully capable" }, q8: { min: "No trust", max: "Full trust" } },
    questions: [
      { id: "q1", type: "multiSelect", options: [
        { value: "a", label: "WhatsApp/Excel only" },
        { value: "b", label: "Basic accounting software (Tally)" },
        { value: "c", label: "ERP (SAP/Odoo/etc.)" },
        { value: "d", label: "Custom software" },
        { value: "e", label: "Nothing digital" }
      ]},
      { id: "q2", type: "scale" },
      { id: "q3", type: "yesNo", followUpPlaceholder: "Reason" },
      { id: "q4", type: "singleSelect", options: [
        { value: "a", label: "Cost" },
        { value: "b", label: "Not relevant to my business" },
        { value: "c", label: "My team will not use it" },
        { value: "d", label: "I do not know what is available" },
        { value: "e", label: "Past bad experience" }
      ]},
      { id: "q5", type: "scale" },
      { id: "q6", type: "yesNo", followUpPlaceholder: "Describe what data" },
      { id: "q7", type: "text" },
      { id: "q8", type: "scale" },
      { id: "q9", type: "yesNo", followUpPlaceholder: "Impact description" },
      { id: "q10", type: "text" }
    ]
  },
  {
    id: "regulatory",
    minLabels: { q2: { min: "Not confident", max: "Fully confident" }, q6: { min: "Very difficult", max: "Very easy" } },
    questions: [
      { id: "q1", type: "text", placeholder: "Approximate hours" },
      { id: "q2", type: "scale" },
      { id: "q3", type: "yesNo", followUpPlaceholder: "Type of failure" },
      { id: "q4", type: "yesNo", followUpPlaceholder: "Which areas" },
      { id: "q5", type: "singleSelect", options: [
        { value: "a", label: "GST" },
        { value: "b", label: "Labour/PF/ESIC" },
        { value: "c", label: "Environmental/Pollution board" },
        { value: "d", label: "Export/import documentation" },
        { value: "e", label: "Product certification (BIS/ISO)" }
      ]},
      { id: "q6", type: "scale" },
      { id: "q7", type: "yesNo", followUpPlaceholder: "Describe system" },
      { id: "q8", type: "yesNo", followUpPlaceholder: "Describe impact" },
      { id: "q9", type: "yesNo", followUpPlaceholder: "Which schemes" },
      { id: "q10", type: "text" }
    ]
  },
  {
    id: "energy",
    minLabels: { q2: { min: "No visibility", max: "Full breakdown" }, q6: { min: "Not prepared", max: "Fully prepared" }, q9: { min: "No impact", max: "Significant savings" } },
    questions: [
      { id: "q1", type: "text", placeholder: "% + Yes/No" },
      { id: "q2", type: "scale" },
      { id: "q3", type: "yesNo", followUpPlaceholder: "Describe initiative" },
      { id: "q4", type: "multiSelect", options: [
        { value: "a", label: "Excess material waste/scrap" },
        { value: "b", label: "Wastewater disposal cost" },
        { value: "c", label: "Hazardous waste compliance" },
        { value: "d", label: "High water consumption" },
        { value: "e", label: "Packaging waste" }
      ]},
      { id: "q5", type: "yesNo", followUpPlaceholder: "Which buyers?" },
      { id: "q6", type: "scale" },
      { id: "q7", type: "yesNo", followUpPlaceholder: "Reason/barrier" },
      { id: "q8", type: "yesNo", followUpPlaceholder: "What metrics" },
      { id: "q9", type: "scale" },
      { id: "q10", type: "text" }
    ]
  }
];

// Devanagari to Hinglish (Latin) transliteration mapping algorithm
function transliterateDevanagariToHinglish(text) {
  if (!text) return "";
  
  const mapping = {
    // Vowels
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
    // Consonants
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'n',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'n',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
    // Matras (Dependent Vowels)
    'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ः': 'h',
    // Special Symbols
    '्': '',
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
    '।': '.', ' ': ' '
  };

  const consonants = [
    'क','ख','ग','घ','च','छ','ज','झ','ट','ठ','ड','ढ','ण','त','थ','द','ध','न','प','फ','ब','भ','म','य','र','ल','व','श','ष','स','ह'
  ];
  
  const matras = [
    'ा','ि','ी','ु','ू','ृ','े','ै','ो','ौ','्','ं','ः'
  ];

  let result = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (mapping[char] !== undefined) {
      let replacement = mapping[char];

      const isConsonant = consonants.includes(char);
      const hasMatra = nextChar && matras.includes(nextChar);

      if (isConsonant && !hasMatra && nextChar !== ' ' && nextChar !== undefined) {
        replacement += 'a';
      }

      if (char === '्' && result.endsWith('a')) {
        result = result.slice(0, -1);
      }

      result += replacement;
    } else {
      result += char;
    }
  }

  return result.toLowerCase();
}

export default function Register() {
  const navigate = useNavigate();
  const { getCompanies, registerWithQuestionnaire } = useAuth();

  const [language, setLanguage] = useState("en"); // active language: en | hi | gu
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Microphone state
  const [isListening, setIsListening] = useState(false);
  const [listeningTarget, setListeningTarget] = useState(null); // { deptId, qId, isFollowUp, fieldName }

  // Toggle for analytical questions
  const [wantsAnalytical, setWantsAnalytical] = useState(false);

  // Loaded companies dropdown list
  const [companiesList, setCompaniesList] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);

  // Form State
  const [accountData, setAccountData] = useState({
    name: "",
    email: "",
    password: "",
    role: "company"
  });

  const [companySelection, setCompanySelection] = useState("NEW"); // always "NEW" now
  const [newCompanyData, setNewCompanyData] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
    contactPerson: "",
    phone: ""
  });

  const [selectedDepts, setSelectedDepts] = useState([]); // Array of department IDs
  const [activeDeptTab, setActiveDeptTab] = useState("");
  const [questionAnswers, setQuestionAnswers] = useState({}); // { deptId: { qId: value, qId_more: text } }

  // Load companies from DB
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getCompanies();
        setCompaniesList(data || []);
      } catch (err) {
        console.error("Failed to load companies:", err);
      } finally {
        setCompaniesLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewCompanyChange = (e) => {
    const { name, value } = e.target;
    setNewCompanyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeptToggle = (deptId) => {
    setSelectedDepts((prev) =>
      prev.includes(deptId) ? prev.filter((d) => d !== deptId) : [...prev, deptId]
    );
  };

  const handleAnswerChange = (deptId, questionId, value, isFollowUp = false) => {
    setQuestionAnswers((prev) => {
      const deptAnswers = prev[deptId] || {};
      if (isFollowUp) {
        return {
          ...prev,
          [deptId]: {
            ...deptAnswers,
            [`${questionId}_more`]: value
          }
        };
      } else {
        return {
          ...prev,
          [deptId]: {
            ...deptAnswers,
            [questionId]: value
          }
        };
      }
    });
  };

  const handleMultiSelectChange = (deptId, questionId, optionValue, isChecked) => {
    setQuestionAnswers((prev) => {
      const deptAnswers = prev[deptId] || {};
      const currentSelection = deptAnswers[questionId] || [];
      const newSelection = isChecked
        ? [...currentSelection, optionValue]
        : currentSelection.filter((v) => v !== optionValue);

      return {
        ...prev,
        [deptId]: {
          ...deptAnswers,
          [questionId]: newSelection
        }
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!accountData.name || !accountData.email || !accountData.password) {
      setError(language === "en" ? "Please fill out all personal credentials." : language === "hi" ? "कृपया सभी व्यक्तिगत क्रेडेंशियल भरें।" : "કૃપા કરીને બધી વ્યક્તિગત વિગતો ભરો.");
      return;
    }
    if (accountData.password.length < 6) {
      setError(language === "en" ? "Password must be at least 6 characters." : language === "hi" ? "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।" : "પાસવર્ડ ઓછામાં ઓછો ૬ અક્ષરનો હોવો જોઈએ.");
      return;
    }
    if (!newCompanyData.name || !newCompanyData.city || !newCompanyData.state || !newCompanyData.country || !newCompanyData.pinCode) {
      setError(language === "en" ? "Please provide all required address/details for your company." : language === "hi" ? "कृपया अपनी कंपनी के लिए सभी आवश्यक पता/विवरण प्रदान करें।" : "કૃપા કરીને તમારી કંપની માટે જરૂરી બધી વિગતો આપો.");
      return;
    }

    setLoading(true);

    try {
      const registrationPayload = {
        name: accountData.name,
        email: accountData.email,
        password: accountData.password,
        role: accountData.role,
        companyId: null,
        newCompany: newCompanyData,
        questionnaireAnswers: {}
      };

      const user = await registerWithQuestionnaire(registrationPayload);

      if (user.role === "company") {
        navigate("/company/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  // Speech-to-text trigger handler
  const handleMicClick = (deptId, qId, isFollowUp, fieldName = "") => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    let speechLang = "en-IN";
    if (language === "hi") speechLang = "hi-IN";
    if (language === "gu") speechLang = "gu-IN";

    recognition.lang = speechLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setListeningTarget({ deptId, qId, isFollowUp, fieldName });

    recognition.start();

    recognition.onresult = (event) => {
      let transcript = event.results[0][0].transcript;
      
      // If Hindi active language, convert Devanagari text to Latin (Hinglish)
      if (language === "hi") {
        transcript = transliterateDevanagariToHinglish(transcript);
      }
      
      if (fieldName) {
        if (fieldName.startsWith("newCompanyData.")) {
          const subField = fieldName.split(".")[1];
          setNewCompanyData((prev) => ({ ...prev, [subField]: prev[subField] ? prev[subField] + " " + transcript : transcript }));
        } else {
          setAccountData((prev) => ({ ...prev, [fieldName]: prev[fieldName] ? prev[fieldName] + " " + transcript : transcript }));
        }
      } else {
    return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden", background: "#ffffff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* LEFT PANEL — Form Container */}
      <div style={{
        width: "560px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "36px 48px",
        background: "#ffffff",
        overflowY: "auto",
        zIndex: 2
      }}>
        {/* Top Header Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#334155",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}
          >
            ← {t.back || "Back"}
          </button>

          {/* Language Switcher Bar */}
          <div style={{
            display: "flex",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "3px",
            gap: "4px"
          }}>
            {[
              { code: "en", label: "English" },
              { code: "hi", label: "हिंदी" },
              { code: "gu", label: "ગુજરાતી" }
            ].map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                style={{
                  padding: "4px 12px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "12px",
                  background: language === lang.code ? "#2563eb" : "transparent",
                  color: language === lang.code ? "white" : "#64748b"
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center Registration Form */}
        <div style={{ margin: "auto 0", padding: "10px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#0f172a", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "16px" }}>
              M
            </div>
            <span style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>MSME Portal</span>
          </div>

          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "6px", letterSpacing: "-0.5px" }}>
            {t.title || "Register Your Company"}
          </h1>
          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "24px", lineHeight: 1.5 }}>
            {t.subtitle || "Create your profile to access operational questionnaires and connect with startup solutions."}
          </p>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, marginBottom: "20px" }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", marginBottom: "16px" }}>{t.step1Title}</h2>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px", textTransform: "uppercase" }}>{t.yourName}</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={accountData.name}
                  onChange={handleAccountChange}
                  placeholder="e.g. John Doe"
                  required
                  style={{ flex: 1, height: "42px", padding: "0 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", background: "#f8fafc" }}
                />
                <button
                  type="button"
                  onClick={() => handleMicClick(null, null, false, "name")}
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    cursor: "pointer",
                    background: listeningTarget?.fieldName === "name" ? "#fee2e2" : "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  🎤
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div className="form-group">
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px", textTransform: "uppercase" }}>{t.emailAddress}</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={accountData.email}
                  onChange={handleAccountChange}
                  placeholder="john@example.com"
                  required
                  style={{ width: "100%", height: "42px", padding: "0 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px", textTransform: "uppercase" }}>{t.password}</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={accountData.password}
                  onChange={handleAccountChange}
                  placeholder="••••••••"
                  required
                  style={{ width: "100%", height: "42px", padding: "0 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{
              background: "#f8fafc",
              padding: "18px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0"
            }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: "0 0 14px 0" }}>{t.newCompanyProfile}</h3>
                
              <div className="form-group" style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "4px", textTransform: "uppercase" }}>{t.companyName}</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    name="name"
                    value={newCompanyData.name}
                    onChange={handleNewCompanyChange}
                    placeholder="e.g. Paramount Manufacturing"
                    required
                    style={{ flex: 1, height: "40px", padding: "0 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", background: "#ffffff" }}
                  />
                  <button
                    type="button"
                    onClick={() => handleMicClick(null, null, false, "newCompanyData.name")}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      cursor: "pointer",
                      background: listeningTarget?.fieldName === "newCompanyData.name" ? "#fee2e2" : "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    🎤
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "4px", textTransform: "uppercase" }}>{t.contactPerson}</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={newCompanyData.contactPerson}
                    onChange={handleNewCompanyChange}
                    placeholder="e.g. Jane Smith"
                    style={{ width: "100%", height: "38px", padding: "0 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "4px", textTransform: "uppercase" }}>{t.phoneNumber}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newCompanyData.phone}
                    onChange={handleNewCompanyChange}
                    placeholder="e.g. +91 99999 99999"
                    style={{ width: "100%", height: "38px", padding: "0 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "4px", textTransform: "uppercase" }}>{t.streetAddress}</label>
                <input
                  type="text"
                  name="street"
                  value={newCompanyData.street}
                  onChange={handleNewCompanyChange}
                  placeholder="e.g. GIDC Phase 3"
                  style={{ width: "100%", height: "38px", padding: "0 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "4px", textTransform: "uppercase" }}>{t.city}</label>
                  <input
                    type="text"
                    name="city"
                    value={newCompanyData.city}
                    onChange={handleNewCompanyChange}
                    placeholder="e.g. Vadodara"
                    required
                    style={{ width: "100%", height: "38px", padding: "0 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "4px", textTransform: "uppercase" }}>{t.state}</label>
                  <input
                    type="text"
                    name="state"
                    value={newCompanyData.state}
                    onChange={handleNewCompanyChange}
                    placeholder="e.g. Gujarat"
                    required
                    style={{ width: "100%", height: "38px", padding: "0 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "4px", textTransform: "uppercase" }}>{t.country}</label>
                  <input
                    type="text"
                    name="country"
                    value={newCompanyData.country}
                    onChange={handleNewCompanyChange}
                    placeholder="e.g. India"
                    required
                    style={{ width: "100%", height: "38px", padding: "0 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "4px", textTransform: "uppercase" }}>{t.pinCode}</label>
                  <input
                    type="text"
                    name="pinCode"
                    value={newCompanyData.pinCode}
                    onChange={handleNewCompanyChange}
                    placeholder="e.g. 390010"
                    required
                    style={{ width: "100%", height: "38px", padding: "0 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              height: "48px",
              borderRadius: "10px",
              background: "#0f172a",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 700,
              border: "none",
              cursor: loading ? "wait" : "pointer",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.2)",
              transition: "all 0.2s ease",
              marginTop: "20px"
            }}
          >
            {loading ? "Registering Account..." : t.submitRegister || "Submit & Register"}
          </button>

          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px", color: "#64748b" }}>
            Already registered?{" "}
            <Link to="/login" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>
              Log In
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — Relatable MSME Factory Image with Frosted Card Overlay */}
      <div style={{
        flex: 1,
        position: "relative",
        background: `url('/msme_factory_hero.png') center/cover no-repeat`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px"
      }}>
        {/* Dark subtle overlay for contrast */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.2) 100%)" }} />

        {/* Frosted Glass Floating Card */}
        <div style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "460px",
          background: "rgba(255, 255, 255, 0.22)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(255, 255, 255, 0.35)",
          borderRadius: "24px",
          padding: "36px",
          color: "#ffffff",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)"
        }}>
          <div style={{ display: "inline-block", background: "rgba(255, 255, 255, 0.3)", padding: "4px 12px", borderRadius: "12px", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
            MSME Innovation Challenge
          </div>

          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", lineHeight: 1.3, marginBottom: "12px" }}>
            Empowering your enterprise with dedicated startup solutions
          </h2>

          <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.88)", lineHeight: 1.6, margin: 0 }}>
            Identify core operational challenges in your business, share department-specific bottlenecks, and let tech startups build customized tools for your growth.
          </p>
        </div>
      </div>

      {/* Recording indicator overlay */}
      {isListening && (
        <div style={{
          position: "fixed",
          bottom: "30px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "red",
          color: "white",
          padding: "12px 24px",
          borderRadius: "30px",
          fontSize: "14px",
          fontWeight: 700,
          boxShadow: "0 4px 12px rgba(206, 17, 17, 0.79)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          animation: "pulse 1.5s infinite"
        }}>
          <span style={{
            width: "8px",
            height: "8px",
            background: "white",
            borderRadius: "50%"
          }} />
          {t.listening}
        </div>
      )}
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.8; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.05); }
          100% { opacity: 0.8; transform: translateX(-50%) scale(1); }
        }
      `}</style>
    </div>
  );
}
