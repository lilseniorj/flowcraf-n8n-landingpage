import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createWorkflow, updateWorkflow, getWorkflow } from "../../services/workflows";
import { WorkflowCanvas } from "../../components/Canvas";
import { useLang } from "../../context/LangContext.jsx";

// ─────────────────────────────────────────────────────
// n8n JSON → portfolio data parser
// ─────────────────────────────────────────────────────
const NODE_TYPE_MAP = {
  "n8n-nodes-base.webhook":                              { type: "trigger", icon: "🌐", integration: "Webhook" },
  "n8n-nodes-base.formTrigger":                          { type: "trigger", icon: "📝", integration: "n8n Form" },
  "n8n-nodes-base.telegramTrigger":                      { type: "trigger", icon: "📱", integration: "Telegram" },
  "@n8n/n8n-nodes-langchain.chatTrigger":                { type: "trigger", icon: "💬", integration: "n8n Chat" },
  "@n8n/n8n-nodes-langchain.mcpTrigger":                 { type: "trigger", icon: "🔌", integration: "MCP Protocol" },
  "n8n-nodes-base.errorTrigger":                         { type: "trigger", icon: "🚨", integration: null },
  "n8n-nodes-base.executeWorkflowTrigger":               { type: "trigger", icon: "▶️", integration: null },
  "@n8n/n8n-nodes-langchain.agent":                      { type: "ai",      icon: "🤖", integration: null },
  "@n8n/n8n-nodes-langchain.lmChatOpenAi":               { type: "ai",      icon: "🧠", integration: "OpenAI" },
  "@n8n/n8n-nodes-langchain.lmChatGoogleGemini":         { type: "ai",      icon: "✨", integration: "Google Gemini" },
  "@n8n/n8n-nodes-langchain.chainLlm":                   { type: "ai",      icon: "⛓️", integration: null },
  "@n8n/n8n-nodes-langchain.outputParserStructured":     { type: "app",     icon: "📋", integration: "Structured Output" },
  "@n8n/n8n-nodes-langchain.memoryBufferWindow":         { type: "ai",      icon: "🧩", integration: "n8n Memory" },
  "@n8n/n8n-nodes-langchain.googleGemini":               { type: "ai",      icon: "🎙️", integration: "Google Gemini" },
  "@n8n/n8n-nodes-langchain.toolSerpApi":                { type: "http",    icon: "🔎", integration: "SerpAPI" },
  "@n8n/n8n-nodes-langchain.mcpClientTool":              { type: "http",    icon: "🔌", integration: "MCP" },
  "n8n-nodes-base.set":                                  { type: "app",     icon: "⚙️", integration: null },
  "n8n-nodes-base.filter":                               { type: "if",      icon: "🔍", integration: null },
  "n8n-nodes-base.if":                                   { type: "if",      icon: "🔀", integration: null },
  "n8n-nodes-base.switch":                               { type: "if",      icon: "🔀", integration: null },
  "n8n-nodes-base.slack":                                { type: "app",     icon: "💬", integration: "Slack" },
  "n8n-nodes-base.gmail":                                { type: "app",     icon: "📧", integration: "Gmail" },
  "n8n-nodes-base.gmailTool":                            { type: "app",     icon: "📧", integration: "Gmail" },
  "n8n-nodes-base.telegram":                             { type: "app",     icon: "📱", integration: "Telegram" },
  "n8n-nodes-base.googleSheets":                         { type: "app",     icon: "📊", integration: "Google Sheets" },
  "n8n-nodes-base.notion":                               { type: "app",     icon: "📓", integration: "Notion" },
  "n8n-nodes-base.wait":                                 { type: "app",     icon: "⏱️", integration: null },
  "n8n-nodes-base.respondToWebhook":                     { type: "app",     icon: "📤", integration: null },
  "n8n-nodes-base.executeWorkflow":                      { type: "app",     icon: "🔗", integration: "Sub-workflows" },
  "n8n-nodes-base.googleCalendarTool":                   { type: "app",     icon: "📅", integration: "Google Calendar" },
  "n8n-nodes-base.httpRequestTool":                      { type: "http",    icon: "🌐", integration: null },
  "n8n-nodes-base.httpRequest":                          { type: "http",    icon: "🌐", integration: null },
  "n8n-nodes-base.dateTimeTool":                         { type: "app",     icon: "🕐", integration: null },
  "n8n-nodes-base.googleFirebaseCloudFirestoreTool":     { type: "app",     icon: "🔥", integration: "Firebase Firestore" },
  "n8n-nodes-base.code":                                 { type: "code",    icon: "💻", integration: null },
};

// Sub-node types that should be rendered below/beside main nodes (not in main flow)
const SUB_NODE_TYPES = new Set([
  "@n8n/n8n-nodes-langchain.lmChatOpenAi",
  "@n8n/n8n-nodes-langchain.lmChatGoogleGemini",
  "@n8n/n8n-nodes-langchain.outputParserStructured",
  "@n8n/n8n-nodes-langchain.memoryBufferWindow",
  "@n8n/n8n-nodes-langchain.toolSerpApi",
  "@n8n/n8n-nodes-langchain.mcpClientTool",
  "n8n-nodes-base.googleCalendarTool",
  "n8n-nodes-base.httpRequestTool",
  "n8n-nodes-base.dateTimeTool",
  "n8n-nodes-base.googleFirebaseCloudFirestoreTool",
  "n8n-nodes-base.gmailTool",
]);

function parseN8nJson(json) {
  try {
    const data = typeof json === "string" ? JSON.parse(json) : json;
    const rawNodes = data.nodes || [];
    const rawConns = data.connections || {};

    // Separate main nodes from sub-nodes (tools, LLMs, parsers)
    const mainNodes = rawNodes.filter(n => !SUB_NODE_TYPES.has(n.type));
    const allNodes  = rawNodes;

    // Count real connections (main type only)
    let connCount = 0;
    for (const src of Object.values(rawConns)) {
      for (const outputs of Object.values(src)) {
        for (const targets of outputs) {
          if (Array.isArray(targets)) connCount += targets.filter(t => t.type === "main").length;
        }
      }
    }

    // Collect integrations (deduplicated)
    const intSet = new Set();
    for (const n of allNodes) {
      const info = NODE_TYPE_MAP[n.type];
      if (info?.integration) intSet.add(info.integration);
    }

    // Normalize canvas positions from real n8n positions
    const nodesToLayout = mainNodes.length > 0 ? mainNodes : allNodes;
    const xs = nodesToLayout.map(n => n.position[0]);
    const ys = nodesToLayout.map(n => n.position[1]);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const SCALE = 0.55;
    const SPACING = 8;

    const canvasNodes = nodesToLayout.map((n, i) => {
      const info = NODE_TYPE_MAP[n.type] || { type: "app", icon: "⚙️" };
      const label = n.name.length > 16 ? n.name.slice(0, 16).trim() + "…" : n.name;
      return {
        id: `n${i + 1}`,
        x: Math.round((n.position[0] - minX) * SCALE + SPACING),
        y: Math.round((n.position[1] - minY) * SCALE + SPACING),
        type: info.type,
        icon: info.icon,
        label,
        desc: {
          es: `Nodo "${n.name}" — tipo ${n.type.split(".").pop()}.`,
          en: `Node "${n.name}" — type ${n.type.split(".").pop()}.`,
        },
        _originalName: n.name,
        _originalId: n.id,
      };
    });

    // Build node name → canvas id map
    const nameToCanvasId = {};
    canvasNodes.forEach(cn => { nameToCanvasId[cn._originalName] = cn.id; });

    // Build edges from real connections (main type only, between main nodes)
    const mainNodeNames = new Set(nodesToLayout.map(n => n.name));
    const edgeSet = new Set();
    const edges = [];
    for (const [srcName, outputs] of Object.entries(rawConns)) {
      if (!mainNodeNames.has(srcName)) continue;
      for (const targets of Object.values(outputs)) {
        for (const targetList of targets) {
          if (!Array.isArray(targetList)) continue;
          for (const t of targetList) {
            if (t.type !== "main") continue;
            const tgtNode = rawNodes.find(n => n.name === t.node);
            if (!tgtNode || !mainNodeNames.has(tgtNode.name)) continue;
            const fromId = nameToCanvasId[srcName];
            const toId   = nameToCanvasId[tgtNode.name];
            if (!fromId || !toId || fromId === toId) continue;
            const key = `${fromId}→${toId}`;
            if (!edgeSet.has(key)) { edgeSet.add(key); edges.push([fromId, toId]); }
          }
        }
      }
    }

    return {
      title:        { es: data.name || "", en: data.name || "" },
      slug:         (data.name || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      integrations: Array.from(intSet),
      nodes:        allNodes.length,
      connections:  connCount,
      canvas:       canvasNodes.map(({ _originalName, _originalId, ...cn }) => cn),
      edges,
    };
  } catch (e) {
    console.error("Error parsing n8n JSON:", e);
    return null;
  }
}

// ─────────────────────────────────────────────────────
// Infer category + requirements from node types (no AI needed)
// ─────────────────────────────────────────────────────
function inferFromNodes(nodes, integrations) {
  const types = nodes.map(n => n.type);
  const hasAI    = types.some(t => t.includes("langchain") || t.includes("agent"));
  const hasChat  = types.some(t => t.includes("telegram") || t.includes("slack") || t.includes("chat"));
  const hasEmail = types.some(t => t.includes("gmail") || t.includes("email"));
  const hasSheet = types.some(t => t.includes("Sheets") || t.includes("notion") || t.includes("airtable"));
  const hasCRM   = types.some(t => t.includes("hubspot") || t.includes("salesforce") || t.includes("crm"));

  let category;
  if (hasAI && hasChat)  category = { es: "IA & Chatbots",             en: "AI & Chatbots" };
  else if (hasAI)        category = { es: "IA & Automatización",        en: "AI & Automation" };
  else if (hasChat)      category = { es: "Comunicación & Mensajería",  en: "Communication & Messaging" };
  else if (hasEmail)     category = { es: "Email & Comunicación",       en: "Email & Communication" };
  else if (hasSheet)     category = { es: "Productividad & Datos",      en: "Productivity & Data" };
  else if (hasCRM)       category = { es: "Ventas & CRM",               en: "Sales & CRM" };
  else                   category = { es: "Automatización",             en: "Automation" };

  const requirements = {
    es: integrations.length > 0
      ? integrations.map(i => `Credenciales de ${i} configuradas en n8n`)
      : ["Acceso a n8n"],
    en: integrations.length > 0
      ? integrations.map(i => `${i} credentials configured in n8n`)
      : ["Access to n8n"],
  };

  return { category, requirements };
}

// ─────────────────────────────────────────────────────
// Gemini AI — auto-fill descriptive fields
// ─────────────────────────────────────────────────────
async function analyzeWithGemini(rawJson) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("VITE_GEMINI_API_KEY no configurado");

  const data = typeof rawJson === "string" ? JSON.parse(rawJson) : rawJson;
  const nodes = (data.nodes || []).map(n => ({ name: n.name, type: n.type.split(".").pop() }));
  const integrations = [...new Set(
    (data.nodes || []).map(n => NODE_TYPE_MAP[n.type]?.integration).filter(Boolean)
  )];

  const prompt = `Eres un experto en automatización con n8n. Analiza este workflow y genera una descripción completa en español e inglés.

Workflow: "${data.name}"
Nodos: ${nodes.map(n => `${n.name} (${n.type})`).join(", ")}
Integraciones: ${integrations.join(", ") || "ninguna detectada"}

Responde ÚNICAMENTE con este JSON válido (sin markdown, sin backticks):
{
  "title": { "es": "Título corto y descriptivo en español", "en": "Short descriptive title in English" },
  "category": { "es": "Categoría (ej: Ventas & CRM, IA & Chatbots, Productividad)", "en": "Category in English" },
  "summary": { "es": "Una oración que resume qué hace este workflow", "en": "One sentence summary of what this workflow does" },
  "forWho": { "es": "Párrafo breve sobre para quién es útil", "en": "Brief paragraph about who benefits from this" },
  "howItWorks": { "es": "Párrafo explicando cómo funciona el flujo paso a paso", "en": "Paragraph explaining how the flow works step by step" },
  "highlights": {
    "es": ["highlight técnico 1", "highlight técnico 2", "highlight técnico 3"],
    "en": ["technical highlight 1", "technical highlight 2", "technical highlight 3"]
  },
  "howToSetup": {
    "es": ["Paso 1: ...", "Paso 2: ...", "Paso 3: ..."],
    "en": ["Step 1: ...", "Step 2: ...", "Step 3: ..."]
  },
  "requirements": {
    "es": ["Requisito 1", "Requisito 2"],
    "en": ["Requirement 1", "Requirement 2"]
  }
}`;

  let res, lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, attempt * 20000));
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (res.ok) break;
    lastErr = res.status;
    if (res.status !== 429 && res.status !== 503) {
      const errBody = await res.text();
      console.error("Gemini error body:", errBody);
      break;
    }
  }

  if (!res.ok) throw new Error(`Gemini error: ${lastErr} — espera unos segundos y vuelve a subir el JSON`);
  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Strip markdown code fences if present
  const clean = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(clean);
}

// ─────────────────────────────────────────────────────
// Styled field helpers
// ─────────────────────────────────────────────────────
const fieldStyle = {
  background: "var(--bg)", border: "1px solid var(--line)", color: "var(--fg)",
  padding: "10px 14px", borderRadius: 10, fontFamily: "var(--sans)", fontSize: 14,
  outline: "none", width: "100%", boxSizing: "border-box",
};
const labelStyle = { fontFamily: "var(--mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--fg-3)", display: "block", marginBottom: 6 };
const Field = ({ label, required, children }) => (
  <label style={{ display: "flex", flexDirection: "column" }}>
    <span style={labelStyle}>{label}{required && " *"}</span>
    {children}
  </label>
);
const Row = ({ cols = 2, children }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 14 }}>{children}</div>
);
const AutoTextarea = ({ style, value, onChange, placeholder, required }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = ref.current.scrollHeight + "px";
  }, [value]);
  return (
    <textarea ref={ref} style={{ ...style, resize: "none", overflow: "hidden", minHeight: 64 }}
      value={value} onChange={onChange} placeholder={placeholder} required={required} />
  );
};
const langBtnStyle = (active) => ({
  padding: "2px 10px", border: "1px solid var(--line)", borderRadius: 5, cursor: "pointer",
  fontSize: 10.5, fontFamily: "var(--mono)", fontWeight: active ? 600 : 400,
  background: active ? "rgba(196,181,253,.18)" : "transparent",
  color: active ? "var(--accent)" : "var(--fg-3)",
});
const BiField = ({ label, required, lang, children }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <span style={{ ...labelStyle, marginBottom: 6 }}>{label}{required && " *"}</span>
    {children(lang)}
  </div>
);
const SectionHeader = ({ title, subtitle }) => (
  <div style={{ borderTop: "1px solid var(--line)", paddingTop: 28, marginTop: 12 }}>
    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>{title}</h3>
    {subtitle && <p style={{ margin: "4px 0 0", color: "var(--fg-3)", fontSize: 12.5 }}>{subtitle}</p>}
  </div>
);

// ─────────────────────────────────────────────────────
// FORM COMPONENT
// ─────────────────────────────────────────────────────
const EMPTY = {
  slug: "", order: 10,
  title:        { es: "", en: "" },
  category:     { es: "", en: "" },
  summary:      { es: "", en: "" },
  integrations: [],
  nodes: 0, connections: 0,
  canvas: [], edges: [],
  forWho:       { es: "", en: "" },
  howItWorks:   { es: "", en: "" },
  highlights:   { es: [], en: [] },
  howToSetup:   { es: [], en: [] },
  requirements: { es: [], en: [] },
};

export default function WorkflowForm() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = !!id;

  const [form, setForm]         = useState(EMPTY);
  const [loading, setLoading]   = useState(isEdit);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [parsed, setParsed]     = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [rawJsonData, setRawJsonData] = useState(null);
  const [formLang] = useLang();

  useEffect(() => {
    if (!isEdit) return;
    getWorkflow(id).then(wf => { if (wf) setForm({ ...EMPTY, ...wf }); setLoading(false); });
  }, [id, isEdit]);

  // ── Bilingual field helper
  const setBi = (field, lang, val) =>
    setForm(f => ({ ...f, [field]: { ...f[field], [lang]: val } }));

  // ── Array-of-strings field (textarea, one item per line)
  const setArr = (field, lang, val) =>
    setForm(f => ({ ...f, [field]: { ...f[field], [lang]: val.split("\n").filter(Boolean) } }));

  // ── Run Gemini AI analysis (can be called on upload or manually retried)
  const runAiAnalysis = async (raw) => {
    setAiLoading(true);
    setError("");
    try {
      const ai = await analyzeWithGemini(raw);
      setForm(f => ({
        ...f,
        title:        ai.title        || f.title,
        category:     ai.category     || f.category,
        summary:      ai.summary      || f.summary,
        forWho:       ai.forWho       || f.forWho,
        howItWorks:   ai.howItWorks   || f.howItWorks,
        highlights:   ai.highlights   || f.highlights,
        howToSetup:   ai.howToSetup   || f.howToSetup,
        requirements: ai.requirements || f.requirements,
      }));
    } catch (err) {
      setError(`IA: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // ── Handle n8n JSON file upload — fills the form automatically
  const handleJsonFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const raw = ev.target.result;
      const result = parseN8nJson(raw);
      if (!result) { setError("No se pudo leer el JSON. Verifica que sea un workflow de n8n válido."); return; }
      setError("");
      setRawJsonData(raw);

      // 1. Fill all extractable fields + infer category & requirements
      const data = JSON.parse(raw);
      const inferred = inferFromNodes(data.nodes || [], result.integrations);
      setForm(f => ({
        ...f,
        slug:         result.slug || f.slug,
        title:        { es: result.title.es, en: result.title.en },
        integrations: result.integrations,
        nodes:        result.nodes,
        connections:  result.connections,
        canvas:       result.canvas,
        edges:        result.edges,
        category:     inferred.category,
        requirements: inferred.requirements,
      }));
      setParsed(true);

      // 2. Call Gemini to fill descriptive fields (overrides inferred if successful)
      await runAiAnalysis(raw);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      const data = {
        ...form,
        integrations: typeof form.integrations === "string"
          ? form.integrations.split(",").map(s => s.trim()).filter(Boolean)
          : form.integrations,
        order: Number(form.order),
        nodes: Number(form.nodes),
        connections: Number(form.connections),
        edges: (form.edges || []).map(e => Array.isArray(e) ? { from: e[0], to: e[1] } : e),
      };
      if (isEdit) await updateWorkflow(id, data);
      else await createWorkflow(data);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 80, textAlign: "center", color: "var(--fg-3)", fontFamily: "var(--mono)" }}>Cargando…</div>;

  const hasCanvas = form.canvas && form.canvas.length > 0;

  return (
    <div style={{ maxWidth: 820 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 500, letterSpacing: "-.02em" }}>
          {isEdit ? (formLang === "es" ? "Editar workflow" : "Edit workflow") : (formLang === "es" ? "Nuevo workflow" : "New workflow")}
        </h1>
        <p style={{ margin: "6px 0 0", color: "var(--fg-3)", fontSize: 13 }}>
          {isEdit ? (formLang === "es" ? "Modifica los datos del workflow." : "Edit workflow details.") : (formLang === "es" ? "Sube el JSON de n8n y los datos se llenan automáticamente." : "Upload the n8n JSON and the fields fill automatically.")}
        </p>
      </div>

      {error && (
        <div style={{ background: "rgba(240,168,200,.12)", border: "1px solid rgba(240,168,200,.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 24, color: "var(--warn)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span>{error}</span>
          {rawJsonData && (
            <button type="button" onClick={() => runAiAnalysis(rawJsonData)} disabled={aiLoading}
              style={{ background: "var(--accent)", color: "#1a0d2e", border: "none", borderRadius: 7, padding: "6px 14px", fontWeight: 600, fontSize: 12, cursor: aiLoading ? "not-allowed" : "pointer", whiteSpace: "nowrap", opacity: aiLoading ? .6 : 1 }}>
              {aiLoading ? (formLang === "es" ? "Analizando…" : "Analyzing…") : (formLang === "es" ? "✨ Reintentar IA" : "✨ Retry AI")}
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

        {/* ── JSON Upload ── */}
        <div style={{ background: "var(--bg-2)", border: parsed ? "1px solid rgba(132,204,153,.35)" : "1px dashed var(--line-2)", borderRadius: 14, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                {parsed ? <span style={{ color: "#84cc99" }}>✓</span> : "📄"}
                {parsed ? (formLang === "es" ? "JSON cargado y procesado" : "JSON loaded and processed") : (formLang === "es" ? "Importar workflow desde JSON" : "Import workflow from JSON")}
              </h3>
              <p style={{ margin: 0, color: "var(--fg-3)", fontSize: 12.5 }}>
                {aiLoading
                  ? (formLang === "es" ? "✨ Gemini analizando el workflow…" : "✨ Gemini analyzing the workflow…")
                  : parsed
                    ? `${form.nodes} ${formLang === "es" ? "nodos" : "nodes"} · ${form.connections} ${formLang === "es" ? "conexiones" : "connections"} · ${form.integrations.length} ${formLang === "es" ? "integraciones detectadas" : "integrations detected"}`
                    : (formLang === "es" ? "Sube el archivo .json exportado desde n8n. El resto se completa automáticamente." : "Upload the .json file exported from n8n. The rest fills in automatically.")}
              </p>
            </div>
            <label style={{ cursor: "pointer" }}>
              <input type="file" accept=".json,application/json" onChange={handleJsonFile} style={{ display: "none" }} />
              <span style={{ background: parsed ? "rgba(132,204,153,.12)" : "var(--accent)", color: parsed ? "#84cc99" : "#1a0d2e", border: parsed ? "1px solid rgba(132,204,153,.35)" : "none", borderRadius: 9, padding: "9px 18px", fontWeight: 600, fontSize: 13, display: "inline-block", transition: "all .15s" }}>
                {parsed ? (formLang === "es" ? "Cambiar JSON" : "Change JSON") : (formLang === "es" ? "Seleccionar JSON" : "Select JSON")}
              </span>
            </label>
          </div>

          {/* Canvas preview */}
          {hasCanvas && (
            <div style={{ marginTop: 20, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: ".06em" }}>Preview canvas</span>
              </div>
              <div style={{ height: 220, background: "#07060d", borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)" }}>
                <WorkflowCanvas workflow={{ ...form, title: form.title, edges: form.edges || [] }} hoverable={false} interactive={false} lang={formLang} />
              </div>
            </div>
          )}
        </div>

        {/* ── Basic info ── */}
        <Row cols={2}>
          <Field label="Slug (URL)" required>
            <input style={fieldStyle} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              placeholder="clasificador-leads" required />
          </Field>
          <Field label="Orden (posición en grid)">
            <input style={fieldStyle} type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} min={1} />
          </Field>
        </Row>

        <SectionHeader title={formLang === "es" ? "Título" : "Title"} subtitle={formLang === "es" ? "Nombre del workflow" : "Workflow name"} />
        <BiField label={formLang === "es" ? "Título" : "Title"} required lang={formLang}>
          {lang => <input style={fieldStyle} value={form.title[lang]} onChange={e => setBi("title", lang, e.target.value)} required />}
        </BiField>

        <SectionHeader title={formLang === "es" ? "Categoría" : "Category"} />
        <BiField label={formLang === "es" ? "Categoría" : "Category"} required lang={formLang}>
          {lang => <input style={fieldStyle} value={form.category[lang]} onChange={e => setBi("category", lang, e.target.value)}
            placeholder={lang === "es" ? "Ventas & CRM" : "Sales & CRM"} required />}
        </BiField>

        <SectionHeader title={formLang === "es" ? "Resumen" : "Summary"} subtitle={formLang === "es" ? "Una línea que aparece en la tarjeta" : "One line shown on the workflow card"} />
        <BiField label={formLang === "es" ? "Resumen" : "Summary"} required lang={formLang}>
          {lang => <AutoTextarea style={fieldStyle} value={form.summary[lang]}
            onChange={e => setBi("summary", lang, e.target.value)} required />}
        </BiField>

        <SectionHeader title={formLang === "es" ? "Integraciones" : "Integrations"} subtitle={formLang === "es" ? "Separadas por comas (auto-detectadas del JSON)" : "Comma separated (auto-detected from JSON)"} />
        <Field label={formLang === "es" ? "Integraciones" : "Integrations"}>
          <input style={fieldStyle} value={Array.isArray(form.integrations) ? form.integrations.join(", ") : form.integrations}
            onChange={e => setForm(f => ({ ...f, integrations: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))}
            placeholder="OpenAI, Slack, Gmail" />
        </Field>

        <Row cols={2}>
          <Field label={formLang === "es" ? "Número de nodos" : "Node count"}>
            <input style={fieldStyle} type="number" value={form.nodes} onChange={e => setForm(f => ({ ...f, nodes: e.target.value }))} min={0} />
          </Field>
          <Field label={formLang === "es" ? "Número de conexiones" : "Connection count"}>
            <input style={fieldStyle} type="number" value={form.connections} onChange={e => setForm(f => ({ ...f, connections: e.target.value }))} min={0} />
          </Field>
        </Row>

        <SectionHeader title={formLang === "es" ? "¿Para quién es?" : "Who is it for?"} />
        <BiField label={formLang === "es" ? "¿Para quién?" : "For who?"} lang={formLang}>
          {lang => <AutoTextarea style={fieldStyle} value={form.forWho?.[lang] || ""}
            onChange={e => setBi("forWho", lang, e.target.value)} />}
        </BiField>

        <SectionHeader title={formLang === "es" ? "Cómo funciona" : "How it works"} />
        <BiField label={formLang === "es" ? "Cómo funciona" : "How it works"} lang={formLang}>
          {lang => <AutoTextarea style={fieldStyle} value={form.howItWorks?.[lang] || ""}
            onChange={e => setBi("howItWorks", lang, e.target.value)} />}
        </BiField>

        <SectionHeader title={formLang === "es" ? "Highlights técnicos" : "Technical highlights"} subtitle={formLang === "es" ? "Un highlight por línea" : "One highlight per line"} />
        <BiField label="Highlights" lang={formLang}>
          {lang => <AutoTextarea style={fieldStyle}
            value={(form.highlights?.[lang] || []).join("\n")}
            onChange={e => setArr("highlights", lang, e.target.value)}
            placeholder={lang === "es" ? "Un highlight por línea" : "One highlight per line"} />}
        </BiField>

        <SectionHeader title={formLang === "es" ? "Cómo configurar" : "How to setup"} subtitle={formLang === "es" ? "Pasos numerados, uno por línea" : "Numbered steps, one per line"} />
        <BiField label={formLang === "es" ? "Pasos" : "Steps"} lang={formLang}>
          {lang => <AutoTextarea style={fieldStyle}
            value={(form.howToSetup?.[lang] || []).join("\n")}
            onChange={e => setArr("howToSetup", lang, e.target.value)}
            placeholder={lang === "es" ? "Paso 1: …" : "Step 1: …"} />}
        </BiField>

        <SectionHeader title={formLang === "es" ? "Requisitos" : "Requirements"} subtitle={formLang === "es" ? "Un requisito por línea" : "One requirement per line"} />
        <BiField label={formLang === "es" ? "Requisitos" : "Requirements"} lang={formLang}>
          {lang => <AutoTextarea style={fieldStyle}
            value={(form.requirements?.[lang] || []).join("\n")}
            onChange={e => setArr("requirements", lang, e.target.value)}
            placeholder={lang === "es" ? "Un requisito por línea" : "One requirement per line"} />}
        </BiField>

        {/* ── Submit ── */}
        <div style={{ display: "flex", gap: 12, paddingTop: 12, borderTop: "1px solid var(--line)", marginTop: 8 }}>
          <button type="submit" disabled={saving} className="btn-primary" style={{ borderRadius: 10, padding: "12px 24px", fontSize: 14 }}>
            {saving ? (formLang === "es" ? "Guardando…" : "Saving…") : isEdit ? (formLang === "es" ? "Guardar cambios" : "Save changes") : (formLang === "es" ? "Publicar workflow" : "Publish workflow")}
          </button>
          <button type="button" onClick={() => navigate("/admin")}
            style={{ background: "transparent", border: "1px solid var(--line)", borderRadius: 10, padding: "12px 20px", color: "var(--fg-2)", fontSize: 14, cursor: "pointer" }}>
            {formLang === "es" ? "Cancelar" : "Cancel"}
          </button>
        </div>
      </form>
    </div>
  );
}
