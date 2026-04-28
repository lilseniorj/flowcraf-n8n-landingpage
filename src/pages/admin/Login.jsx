import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setError(""); setLoading(true);
    try {
      await loginWithGoogle();
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 380, background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 18, padding: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <span style={{ color: "var(--accent)", display: "grid", placeItems: "center" }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="5" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="17" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="17" cy="16" r="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 11 L15 6 M8 11 L15 16" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
          <span style={{ fontWeight: 600, fontSize: 16 }}>flowcraft<span style={{ color: "var(--accent)" }}>.</span> admin</span>
        </div>

        <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 500, letterSpacing: "-.02em" }}>Acceso admin</h1>
        <p style={{ margin: "0 0 28px", fontSize: 13, color: "var(--fg-3)", fontFamily: "var(--mono)" }}>Solo cuentas autorizadas</p>

        {error && (
          <div style={{ background: "rgba(240,168,200,.12)", border: "1px solid rgba(240,168,200,.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 18, color: "var(--warn)", fontSize: 13 }}>
            {error}
          </div>
        )}

        <button onClick={handleGoogle} disabled={loading}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            background: "rgba(255,255,255,.05)", border: "1px solid var(--line-2)", borderRadius: 12,
            color: "var(--fg)", padding: "14px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer",
            transition: "all .15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.09)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.05)"}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19.1 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.1C9.4 35.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C41 35.8 44 30.3 44 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
          {loading ? "Iniciando…" : "Continuar con Google"}
        </button>
      </div>
    </div>
  );
}
