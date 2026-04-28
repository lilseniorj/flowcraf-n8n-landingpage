import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LangProvider, useLang } from "../../context/LangContext.jsx";

function AdminLayoutInner() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [lang, setLang] = useLang();

  const handleLogout = async () => { await logout(); navigate("/admin/login"); };

  const navLink = (to, label) => (
    <Link to={to} style={{
      padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
      color: pathname === to ? "var(--fg)" : "var(--fg-3)",
      background: pathname === to ? "rgba(255,255,255,.06)" : "transparent",
      textDecoration: "none",
    }}>{label}</Link>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", borderBottom: "1px solid var(--line)", background: "rgba(11,10,16,.85)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--fg)", textDecoration: "none" }}>
            <span style={{ color: "var(--accent)" }}>
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                <circle cx="5" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="17" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="17" cy="16" r="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 11 L15 6 M8 11 L15 16" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </span>
            <span style={{ fontWeight: 600, fontSize: 15 }}>flowcraft<span style={{ color: "var(--accent)" }}>.</span></span>
          </Link>
          <span style={{ color: "var(--line-2)", fontSize: 14 }}>|</span>
          <nav style={{ display: "flex", gap: 4 }}>
            {navLink("/admin", "Workflows")}
            {navLink("/admin/nuevo", lang === "es" ? "+ Nuevo" : "+ New")}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,.04)", border: "1px solid var(--line)", borderRadius: 8, padding: 3 }}>
            {["es", "en"].map(l => (
              <button key={l} type="button" onClick={() => setLang(l)}
                style={{ padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontFamily: "var(--mono)", fontWeight: lang === l ? 600 : 400, background: lang === l ? "rgba(196,181,253,.2)" : "transparent", color: lang === l ? "var(--accent)" : "var(--fg-3)", transition: "all .15s" }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 12, color: "var(--fg-3)", fontFamily: "var(--mono)" }}>{user?.email}</span>
          <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid var(--line)", borderRadius: 8, color: "var(--fg-2)", padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>
            {lang === "es" ? "Salir" : "Logout"}
          </button>
        </div>
      </header>
      <main style={{ flex: 1, padding: "40px 32px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <Outlet />
      </main>
    </div>
  );
}

export default function AdminLayout() {
  return <LangProvider><AdminLayoutInner /></LangProvider>;
}
