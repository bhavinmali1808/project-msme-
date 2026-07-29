import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Globe, ArrowRight, ShieldCheck, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === "company") {
        navigate("/company/dashboard");
      } else if (user.role === "dept_head") {
        navigate("/dept/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSent(false);
      setForgotEmail("");
    }, 3000);
  };

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden", background: "#ffffff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* LEFT PANEL — Form Container */}
      <div style={{
        width: "480px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "40px 48px",
        background: "#ffffff",
        overflowY: "auto",
        zIndex: 2
      }}>
        {/* Top Header Logo */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#0f172a", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "18px" }}>
              M
            </div>
            <span style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.5px" }}>MSME Portal</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f8fafc", padding: "5px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <Globe size={14} color="#64748b" />
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>EN</span>
          </div>
        </div>

        {/* Center Login Form */}
        <div style={{ margin: "auto 0", padding: "20px 0" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#0f172a", marginBottom: "8px", letterSpacing: "-0.5px" }}>
            Welcome Back!
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "32px", lineHeight: 1.5 }}>
            Log in to access your company dashboard, department assessments, and operational reports.
          </p>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, marginBottom: "20px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                style={{
                  width: "100%",
                  height: "46px",
                  padding: "0 14px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  fontSize: "14px",
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "all 0.2s"
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
                  Password
                </label>
                <button
                  type="button"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "13px", fontWeight: 600, color: "#2563eb" }}
                  onClick={() => setShowForgotModal(true)}
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  height: "46px",
                  padding: "0 14px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  fontSize: "14px",
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "all 0.2s"
                }}
              />
            </div>

            <button
              type="submit"
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.2)",
                transition: "all 0.2s ease"
              }}
            >
              {loading ? "Logging in..." : "Log In"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div style={{ marginTop: "28px", textAlign: "center", fontSize: "14px", color: "#64748b" }}>
            Don't have a company account?{" "}
            <Link to="/register" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>
              Register your company
            </Link>
          </div>
        </div>

        {/* Bottom Support Link */}
        <div style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>
          Need technical assistance? <a href="mailto:support@xlrq.ventures" style={{ color: "#64748b", textDecoration: "underline" }}>support@xlrq.ventures</a>
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
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.15) 100%)" }} />

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
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={18} color="#ffffff" />
            </div>
            <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.9)" }}>
              MSME Growth & Innovation
            </span>
          </div>

          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", lineHeight: 1.3, marginBottom: "12px" }}>
            Precision engineering & smart digital solutions for Indian MSMEs
          </h2>

          <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.88)", lineHeight: 1.6, margin: 0 }}>
            Streamline operational bottlenecks across manufacturing, finance, HR, and supply chain with structured assessments and targeted startup solutions.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{ width: "100%", maxWidth: "420px", background: "#ffffff", borderRadius: "16px", padding: "32px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", position: "relative" }}>
            <button
              onClick={() => setShowForgotModal(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                fontSize: "22px",
                color: "#64748b",
                cursor: "pointer"
              }}
            >
              &times;
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <Lock size={20} color="#2563eb" />
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Reset Password</h2>
            </div>

            {forgotSent ? (
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af", padding: "16px", borderRadius: "10px", fontSize: "14px" }}>
                A password reset link has been sent to <strong>{forgotEmail}</strong>.
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} style={{ marginTop: "16px" }}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "8px", textTransform: "uppercase" }}>
                    Enter your email address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    style={{ width: "100%", height: "44px", padding: "0 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", boxSizing: "border-box" }}
                  />
                </div>
                <button type="submit" style={{ width: "100%", height: "44px", borderRadius: "8px", background: "#2563eb", color: "#ffffff", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer" }}>
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
