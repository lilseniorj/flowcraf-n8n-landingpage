import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getWorkflowsAdmin, deleteWorkflow } from "../../services/workflows";
import { WorkflowCanvas } from "../../components/Canvas";
import { useLang } from "../../context/LangContext.jsx";

export default function WorkflowList() {
  const [lang] = useLang();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [deleting, setDeleting]   = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const load = async () => {
    setLoading(true);
    try { setWorkflows(await getWorkflowsAdmin()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, title) => {
    if (!confirm(`¿Eliminar "${title}"?`)) return;
    setDeleting(id); setDeleteError("");
    try {
      await deleteWorkflow(id);
      setWorkflows(prev => prev.filter(w => w.id !== id));
    } catch (e) {
      setDeleteError(`Error al eliminar: ${e.message}`);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80 }}>
      <span style={{ color: "var(--fg-3)", fontFamily: "var(--mono)", fontSize: 13 }}>Cargando workflows…</span>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-.02em" }}>Workflows</h1>
          <p style={{ margin: "6px 0 0", color: "var(--fg-3)", fontSize: 13, fontFamily: "var(--mono)" }}>{workflows.length} {lang === "es" ? "publicados" : "published"}</p>
        </div>
        <Link to="/admin/nuevo" style={{ background: "var(--accent)", color: "#1a0d2e", border: "none", borderRadius: 10, padding: "11px 20px", fontWeight: 600, fontSize: 13.5, textDecoration: "none" }}>
          {lang === "es" ? "+ Nuevo workflow" : "+ New workflow"}
        </Link>
      </div>

      {deleteError && (
        <div style={{ background: "rgba(240,168,200,.12)", border: "1px solid rgba(240,168,200,.3)", borderRadius: 10, padding: "10px 16px", marginBottom: 20, color: "var(--warn)", fontSize: 13 }}>
          {deleteError}
        </div>
      )}

      {workflows.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--fg-3)" }}>
          <p style={{ fontSize: 16, margin: 0 }}>No hay workflows todavía</p>
          <Link to="/admin/nuevo" style={{ color: "var(--accent)", fontSize: 13, marginTop: 8, display: "inline-block" }}>Agregar el primero →</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
          {workflows.map(wf => (
            <div key={wf.id} style={{ background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ aspectRatio: "16/7", background: "#07060d", borderBottom: "1px solid var(--line)" }}>
                {wf.canvas && wf.edges && <WorkflowCanvas workflow={wf} hoverable={false} interactive={false} />}
              </div>
              <div style={{ padding: "16px 18px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>
                      {wf.category?.[lang] || wf.category?.es || wf.category}
                    </div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500, letterSpacing: "-.015em" }}>
                      {wf.title?.[lang] || wf.title?.es || wf.title}
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <Link to={`/admin/editar/${wf.id}`}
                      style={{ padding: "6px 12px", background: "rgba(255,255,255,.04)", border: "1px solid var(--line)", borderRadius: 7, fontSize: 12, color: "var(--fg-2)", textDecoration: "none" }}>
                      {lang === "es" ? "Editar" : "Edit"}
                    </Link>
                    <button onClick={() => handleDelete(wf.id, wf.title?.[lang] || wf.title?.es || wf.title)} disabled={deleting === wf.id}
                      style={{ padding: "6px 12px", background: "transparent", border: "1px solid rgba(240,168,200,.2)", borderRadius: 7, fontSize: 12, color: "var(--warn)", cursor: "pointer" }}>
                      {deleting === wf.id ? "…" : (lang === "es" ? "Borrar" : "Delete")}
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: 12, display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {(wf.integrations || []).slice(0, 3).map(i => (
                    <span key={i} style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--fg-3)", background: "rgba(255,255,255,.04)", border: "1px solid var(--line)", padding: "2px 7px", borderRadius: 6 }}>{i}</span>
                  ))}
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--fg-3)" }}>· {wf.nodes} nodos</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
