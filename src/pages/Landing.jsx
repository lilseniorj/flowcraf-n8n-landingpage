import { useState, useCallback, useMemo, useEffect } from "react";
import { WorkflowCanvas } from "../components/Canvas";
import { TweaksPanel, TweakSection, TweakRadio, TweakSelect, useTweaks } from "../components/TweaksPanel";
import { WORKFLOWS, I18N } from "../data/seed";

const IconGitHub = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const IconLinkedIn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const IconInstagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const IconEmail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M2 8l10 6 10-6"/>
  </svg>
);

function useT(lang) {
  return useCallback((obj) => (obj && typeof obj === "object" && "es" in obj ? obj[lang] : obj), [lang]);
}

const ACCENT_PRESETS = {
  violet:  { accent: "#c4b5fd", accent2: "#a78bfa", deep: "#7c3aed" },
  emerald: { accent: "#86efac", accent2: "#34d399", deep: "#059669" },
  amber:   { accent: "#fcd34d", accent2: "#fbbf24", deep: "#d97706" },
  rose:    { accent: "#fda4af", accent2: "#fb7185", deep: "#e11d48" },
  sky:     { accent: "#7dd3fc", accent2: "#38bdf8", deep: "#0284c7" },
};

// ─────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────
function Nav({ lang, setLang, onJump }) {
  const t = useT(lang);
  return (
    <nav className="nav">
      <div className="nav-brand" onClick={() => onJump("hero")}>
        <span className="brand-mark">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="5" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="17" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="17" cy="16" r="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 11 L15 6 M8 11 L15 16" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>
        <span className="brand-name">flowcraft<span style={{ color: "var(--accent)" }}>.</span></span>
      </div>
      <div className="nav-links">
        <a onClick={() => onJump("work")}>{t(I18N.nav.work)}</a>
        <a onClick={() => onJump("cases")}>{t(I18N.nav.cases)}</a>
        <a onClick={() => onJump("about")}>{t(I18N.nav.about)}</a>
        <a onClick={() => onJump("contact")}>{t(I18N.nav.contact)}</a>
      </div>
      <div className="nav-actions">
        <button className="lang-toggle" onClick={() => setLang(lang === "es" ? "en" : "es")}>
          <span className={lang === "es" ? "on" : ""}>ES</span>
          <span className="lang-sep">·</span>
          <span className={lang === "en" ? "on" : ""}>EN</span>
        </button>
        <button className="btn-primary" onClick={() => onJump("contact")}>
          {lang === "es" ? "Hablemos" : "Get in touch"}
        </button>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────
function Hero({ lang, onJump, workflows }) {
  const t = useT(lang);
  const featured = workflows[0];
  const bgWorkflow = WORKFLOWS[0];
  if (!featured) return null;
  return (
    <section id="hero" className="hero">
      <div className="hero-bg">
        <WorkflowCanvas workflow={bgWorkflow} animated hoverable={false} interactive={false} />
      </div>
      <div className="hero-fade" />
      <div className="hero-content">
        <div className="eyebrow"><span className="dot-live" />{t(I18N.hero.eyebrow)}</div>
        <h1 className="hero-title">
          {t(I18N.hero.title_a)} <span className="accent-text">{t(I18N.hero.title_b)}</span>{" "}
          {t(I18N.hero.title_c)}
        </h1>
        <p className="hero-sub">{t(I18N.hero.sub)}</p>
        <div className="hero-cta">
          <button className="btn-primary big" onClick={() => onJump("work")}>{t(I18N.hero.cta_primary)}<span style={{ marginLeft: 8 }}>↓</span></button>
          <button className="btn-ghost big" onClick={() => onJump("contact")}>{t(I18N.hero.cta_secondary)}</button>
        </div>
      </div>
      <div className="hero-meta">
        <span className="mono-tag">{bgWorkflow.slug || bgWorkflow.id}.json</span>
        <span className="mono-tag">·</span>
        <span className="mono-tag">{bgWorkflow.nodes} nodes</span>
        <span className="mono-tag">·</span>
        <span className="mono-tag" style={{ color: "var(--accent)" }}>● running</span>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────
function Stats({ lang }) {
  const t = useT(lang);
  return (
    <section className="stats">
      {I18N.stats.map((s, i) => (
        <div key={i} className="stat">
          <div className="stat-v">{s.v}</div>
          <div className="stat-k">{t(s.k)}</div>
        </div>
      ))}
    </section>
  );
}

// ─────────────────────────────────────────────────────
// WORK GRID
// ─────────────────────────────────────────────────────
function WorkCard({ workflow, lang, index, onOpen, density }) {
  const t = useT(lang);
  const [hover, setHover] = useState(false);
  const num = String(index + 1).padStart(2, "0");
  return (
    <article className="work-card"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onClick={onOpen}>
      <div className="card-canvas">
        <WorkflowCanvas workflow={workflow} animated={hover} hoverable={false} interactive={false} />
      </div>
      <div className="card-meta">
        <div className="card-num mono">{num}</div>
        <div className="card-cat mono">{workflow.category[lang]}</div>
      </div>
      <h3 className="card-title">{workflow.title[lang]}</h3>
      {density !== "compact" && <p className="card-sum">{workflow.summary[lang]}</p>}
      <div className="card-foot">
        <div className="card-tags">
          {workflow.integrations.slice(0, density === "compact" ? 2 : 3).map(n => <span key={n} className="tag">{n}</span>)}
          {workflow.integrations.length > (density === "compact" ? 2 : 3) && (
            <span className="tag tag-muted">+{workflow.integrations.length - (density === "compact" ? 2 : 3)}</span>
          )}
        </div>
        <span className="card-stat mono">{workflow.nodes} {t(I18N.work.nodes)} · {workflow.connections} {lang === "es" ? "conex." : "conn."}</span>
      </div>
      <div className="card-cta">{lang === "es" ? "Abrir detalle" : "Open detail"} <span>→</span></div>
    </article>
  );
}

function WorkGrid({ lang, density, onOpen, workflows }) {
  const t = useT(lang);
  const [filter, setFilter] = useState("all");
  const cats = useMemo(() => {
    const set = new Map();
    workflows.forEach(w => set.set(w.category[lang], w.category[lang]));
    return ["all", ...Array.from(set.keys())];
  }, [lang, workflows]);
  const list = filter === "all" ? workflows : workflows.filter(w => w.category[lang] === filter);
  return (
    <section id="work" className="section">
      <div className="section-head">
        <div>
          <div className="eyebrow"><span className="dash" />{t(I18N.work.title)}</div>
          <h2 className="section-title">{t(I18N.work.sub)}</h2>
        </div>
        <div className="filters">
          {cats.map(c => (
            <button key={c} className={`filter ${filter === c ? "on" : ""}`} onClick={() => setFilter(c)}>
              {c === "all" ? t(I18N.work.filter_all) : c}
            </button>
          ))}
        </div>
      </div>
      <div className={`work-grid density-${density}`}>
        {list.map((w, i) => <WorkCard key={w.id || w.slug} workflow={w} lang={lang} index={i} onOpen={() => onOpen(w)} density={density} />)}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────
// DETAIL PAGE
// ─────────────────────────────────────────────────────
function DetailPage({ workflow, lang, setLang, onClose, onOpen, workflows }) {
  const t = useT(lang);
  const [zoom, setZoom] = useState(1);
  const COPY = {
    backToList:      { es: "Volver a workflows",          en: "Back to workflows" },
    forWho:          { es: "¿Para quién es?",              en: "Who is it for?" },
    howItWorks:      { es: "Cómo funciona",                en: "How it works" },
    howToSetup:      { es: "Cómo configurar",              en: "How to set it up" },
    requirements:    { es: "Requisitos",                   en: "Requirements" },
    moreFrom:        { es: "Más workflows del portafolio", en: "More from this portfolio" },
    createdBy:       { es: "Creado por",                   en: "Created by" },
    lastUpdated:     { es: "Última actualización",         en: "Last updated" },
    months:          { es: "hace 2 meses",                 en: "2 months ago" },
    categories:      { es: "Categorías",                   en: "Categories" },
    share:           { es: "Compartir",                    en: "Share" },
    requestCta:      { es: "Pedir el JSON gratis",         en: "Get the JSON for free" },
    integrationsLbl: { es: "Integraciones",                en: "Integrations" },
    highlightsLbl:   { es: "Highlights técnicos",          en: "Technical highlights" },
    canvasLbl:       { es: "Canvas del workflow",          en: "Workflow canvas" },
    nodesLbl:        { es: "nodos",                        en: "nodes" },
    connLbl:         { es: "conexiones",                   en: "connections" },
    intLbl:          { es: "integraciones",                en: "integrations" },
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const moreList = workflows.filter(w => (w.id || w.slug) !== (workflow.id || workflow.slug)).slice(0, 3);

  return (
    <div className="detail-page">
      <div className="dp-topbar">
        <button className="dp-back" onClick={onClose}><span>←</span> {t(COPY.backToList)}</button>
        <div className="dp-tools">
          <button className="lang-toggle" onClick={() => setLang(lang === "es" ? "en" : "es")}>
            <span className={lang === "es" ? "on" : ""}>ES</span>
            <span className="lang-sep">·</span>
            <span className={lang === "en" ? "on" : ""}>EN</span>
          </button>
          <div style={{ width: 1, height: 16, background: "var(--line)", margin: "0 4px" }} />
          <button className="dp-icon-btn" onClick={() => setZoom(z => Math.max(.5, z - .1))}>−</button>
          <span className="mono" style={{ minWidth: 44, textAlign: "center", fontSize: 11.5, color: "var(--fg-3)" }}>{Math.round(zoom * 100)}%</span>
          <button className="dp-icon-btn" onClick={() => setZoom(z => Math.min(1.5, z + .1))}>+</button>
          <button className="dp-icon-btn" onClick={() => setZoom(1)}>↺</button>
        </div>
      </div>

      <div className="dp-scroll">
        <section className="dp-hero">
          <div className="dp-hero-left">
            <div className="dp-cat-row">
              {workflow.integrations.slice(0, 4).map(i => <span key={i} className="dp-int-chip">{i}</span>)}
              {workflow.integrations.length > 4 && <span className="dp-int-chip muted">+{workflow.integrations.length - 4}</span>}
            </div>
            <h1 className="dp-title">{workflow.title[lang]}</h1>
            <p className="dp-summary">{workflow.summary[lang]}</p>
            <a href={`mailto:jesusvarguer18@gmail.com?subject=${encodeURIComponent(`Solicitud workflow: ${workflow.title?.[lang] || workflow.title?.es}`)}`} className="btn-primary big" style={{ display: "inline-block", textDecoration: "none" }}>{t(COPY.requestCta)}</a>
            <div className="dp-mini-stats">
              <div><b>{workflow.nodes}</b><span>{t(COPY.nodesLbl)}</span></div>
              <div><b>{workflow.connections}</b><span>{t(COPY.connLbl)}</span></div>
              <div><b>{workflow.integrations.length}</b><span>{t(COPY.intLbl)}</span></div>
            </div>
          </div>
          <div className="dp-hero-right">
            <div className="dp-canvas-frame">
              <div className="dp-canvas-head">
                <div className="dp-canvas-dots"><span /><span /><span /></div>
                <span className="mono dp-canvas-name">{workflow.slug || workflow.id}.json</span>
                <span className="mono dp-canvas-status">● active</span>
              </div>
              <div className="dp-canvas-body">
                <div className="dp-canvas-inner" style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}>
                  <WorkflowCanvas workflow={workflow} animated selectable lang={lang} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="dp-content">
          <aside className="dp-meta">
            <div className="dp-meta-block">
              <span className="dp-meta-lbl">{t(COPY.createdBy)}</span>
              <div className="dp-author">
                <div className="dp-author-avatar"><span>JV</span></div>
                <div>
                  <div className="dp-author-name">Jesús V.G.</div>
                  <div className="dp-author-role mono">n8n builder</div>
                </div>
              </div>
            </div>
            <div className="dp-meta-block">
              <span className="dp-meta-lbl">{t(COPY.lastUpdated)}</span>
              <p className="dp-meta-val">{t(COPY.months)}</p>
            </div>
            <div className="dp-meta-block">
              <span className="dp-meta-lbl">{t(COPY.categories)}</span>
              <div className="dp-cat-chips"><span className="dp-cat-chip">{workflow.category[lang]}</span></div>
            </div>
            <div className="dp-meta-block">
              <span className="dp-meta-lbl">{t(COPY.share)}</span>
              <div className="dp-share-row">
                <button className="dp-share-btn" title="Copy link">↗</button>
                <button className="dp-share-btn" title="X">𝕏</button>
                <button className="dp-share-btn" title="LinkedIn">in</button>
              </div>
            </div>
            <div className="dp-meta-block">
              <span className="dp-meta-lbl">{t(COPY.integrationsLbl)}</span>
              <div className="dp-int-stack">
                {workflow.integrations.map(i => (
                  <div key={i} className="dp-int-row">
                    <span className="dp-int-bullet" />
                    <span>{i}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <article className="dp-article">
            <h2 className="dp-h2">{t(COPY.forWho)}</h2>
            <p>{workflow.forWho ? workflow.forWho[lang] : workflow.summary[lang]}</p>
            <h2 className="dp-h2">{t(COPY.howItWorks)}</h2>
            <p>{workflow.howItWorks ? workflow.howItWorks[lang] : workflow.summary[lang]}</p>
            {workflow.highlights && (
              <>
                <h3 className="dp-h3">{t(COPY.highlightsLbl)}</h3>
                <ul className="dp-bullets">{workflow.highlights[lang].map((h, i) => <li key={i}>{h}</li>)}</ul>
              </>
            )}
            {workflow.howToSetup && (
              <>
                <h2 className="dp-h2">{t(COPY.howToSetup)}</h2>
                <ol className="dp-ol">{workflow.howToSetup[lang].map((s, i) => <li key={i}>{s}</li>)}</ol>
              </>
            )}
            {workflow.requirements && (
              <>
                <h2 className="dp-h2">{t(COPY.requirements)}</h2>
                <ul className="dp-bullets">{workflow.requirements[lang].map((r, i) => <li key={i}>{r}</li>)}</ul>
              </>
            )}
          </article>
        </section>

        <section className="dp-more">
          <h2 className="dp-h2">{t(COPY.moreFrom)}</h2>
          <div className="dp-more-grid">
            {moreList.map(w => (
              <article key={w.id || w.slug} className="dp-more-card" onClick={() => onOpen(w)}>
                <div className="dp-more-canvas"><WorkflowCanvas workflow={w} hoverable={false} interactive={false} thumbnail /></div>
                <h3>{w.title[lang]}</h3>
                <div className="dp-more-tags">{w.integrations.slice(0, 3).map(i => <span key={i} className="tag">{i}</span>)}</div>
              </article>
            ))}
          </div>
        </section>

        <footer className="footer">
          <span className="mono">© 2026 flowcraft</span>
          <span>{lang === "es" ? "Construido con n8n + React" : "Built with n8n + React"}</span>
          <span className="mono">v1.0.0</span>
        </footer>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// CASES / ABOUT / CONTACT / FOOTER
// ─────────────────────────────────────────────────────
function Cases({ lang }) {
  const t = useT(lang);
  return (
    <section id="cases" className="section">
      <div className="section-head">
        <div>
          <div className="eyebrow"><span className="dash" />{t(I18N.cases.title)}</div>
          <h2 className="section-title">{t(I18N.cases.sub)}</h2>
        </div>
      </div>
      <div className="cases-grid">
        {I18N.cases.list.map((c, i) => (
          <div key={i} className="case-card">
            <div className="case-num mono">0{i + 1}</div>
            <h3>{t(c.t)}</h3>
            <p>{t(c.d)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function About({ lang }) {
  const t = useT(lang);
  return (
    <section id="about" className="section about">
      <div className="about-grid">
        <div>
          <div className="eyebrow"><span className="dash" />{t(I18N.about.title)}</div>
          <h2 className="section-title big">{t(I18N.about.body)}</h2>
        </div>
        <div className="about-side">
          <div className="about-avatar">
            <div className="about-initials">JV</div>
            <div className="about-avatar-name">Jesús Vargas Guerra</div>
            <div className="about-avatar-role mono">n8n builder</div>
            <div className="about-social">
              <a href="https://github.com/lilseniorj" target="_blank" rel="noopener noreferrer" title="GitHub" className="social-icon-btn"><IconGitHub /></a>
              <a href="https://www.linkedin.com/in/jesusvarguer18/" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="social-icon-btn"><IconLinkedIn /></a>
              <a href="https://www.instagram.com/lilseniorj/" target="_blank" rel="noopener noreferrer" title="Instagram" className="social-icon-btn"><IconInstagram /></a>
            </div>
          </div>
          <ul className="about-list">
            <li><span className="mono">n8n</span> {lang === "es" ? "Self-hosted en producción" : "Self-hosted in production"}</li>
            <li><span className="mono">IA</span> {lang === "es" ? "Agentes con OpenAI, Gemini, Claude" : "Agents with OpenAI, Gemini, Claude"}</li>
            <li><span className="mono">stack</span> React, Firebase, Python, Postgres</li>
            <li><span className="mono">{lang === "es" ? "enfoque" : "focus"}</span> {lang === "es" ? "Automatización escalable y con IA" : "Scalable AI-powered automation"}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Contact({ lang }) {
  const t = useT(lang);
  const [fields, setFields] = useState({ name: "", email: "", msg: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(lang === "es" ? `Contacto desde flowcraft — ${fields.name}` : `Contact from flowcraft — ${fields.name}`);
    const body = encodeURIComponent(`${lang === "es" ? "Nombre" : "Name"}: ${fields.name}\n${lang === "es" ? "Email" : "Email"}: ${fields.email}\n\n${fields.msg}`);
    window.open(`mailto:jesusvarguer18@gmail.com?subject=${subject}&body=${body}`);
    setSent(true);
  };

  return (
    <section id="contact" className="section contact">
      <div className="contact-grid">
        <div>
          <div className="eyebrow"><span className="dash" />{lang === "es" ? "Contacto" : "Contact"}</div>
          <h2 className="section-title big">{t(I18N.contact.title)}</h2>
          <p className="contact-sub">{t(I18N.contact.sub)}</p>
          <div className="contact-icons">
            <a href="mailto:jesusvarguer18@gmail.com" title="jesusvarguer18@gmail.com" className="social-icon-btn large"><IconEmail /></a>
            <a href="https://github.com/lilseniorj" target="_blank" rel="noopener noreferrer" title="github.com/lilseniorj" className="social-icon-btn large"><IconGitHub /></a>
            <a href="https://www.linkedin.com/in/jesusvarguer18/" target="_blank" rel="noopener noreferrer" title="linkedin.com/in/jesusvarguer18" className="social-icon-btn large"><IconLinkedIn /></a>
            <a href="https://www.instagram.com/lilseniorj/" target="_blank" rel="noopener noreferrer" title="instagram.com/lilseniorj" className="social-icon-btn large"><IconInstagram /></a>
          </div>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <label><span>{t(I18N.contact.name)}</span><input required type="text" value={fields.name} onChange={e => setFields(f => ({ ...f, name: e.target.value }))} /></label>
          <label><span>{t(I18N.contact.email)}</span><input required type="email" value={fields.email} onChange={e => setFields(f => ({ ...f, email: e.target.value }))} /></label>
          <label><span>{t(I18N.contact.msg)}</span><textarea required rows={4} value={fields.msg} onChange={e => setFields(f => ({ ...f, msg: e.target.value }))} /></label>
          <button type="submit" className="btn-primary big block">
            {sent ? t(I18N.contact.sent) : t(I18N.contact.send)}
          </button>
        </form>
      </div>
    </section>
  );
}

function SiteFooter({ lang }) {
  return (
    <footer className="footer">
      <span className="mono">© 2026 Jesús Vargas Guerra</span>
      <div className="footer-social">
        <a href="https://github.com/lilseniorj" target="_blank" rel="noopener noreferrer" title="GitHub" className="social-icon-btn"><IconGitHub /></a>
        <a href="https://www.linkedin.com/in/jesusvarguer18/" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="social-icon-btn"><IconLinkedIn /></a>
        <a href="https://www.instagram.com/lilseniorj/" target="_blank" rel="noopener noreferrer" title="Instagram" className="social-icon-btn"><IconInstagram /></a>
      </div>
      <span className="mono">{lang === "es" ? "Construido con n8n + React" : "Built with n8n + React"}</span>
    </footer>
  );
}

// ─────────────────────────────────────────────────────
// LANDING PAGE ROOT
// ─────────────────────────────────────────────────────
const TWEAK_DEFAULTS = { lang: "es", density: "regular", accent: "violet" };

export default function Landing({ workflows: firestoreWorkflows }) {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [openWf, setOpenWf] = useState(null);

  // Use Firestore workflows if available, fallback to seed data
  const workflows = firestoreWorkflows && firestoreWorkflows.length > 0 ? firestoreWorkflows : WORKFLOWS;

  const onJump = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 60, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const p = ACCENT_PRESETS[t.accent] || ACCENT_PRESETS.violet;
    document.documentElement.style.setProperty("--accent", p.accent);
    document.documentElement.style.setProperty("--accent-2", p.accent2);
    document.documentElement.style.setProperty("--accent-deep", p.deep);
  }, [t.accent]);

  return (
    <div className="app">
      <Nav lang={t.lang} setLang={(v) => setTweak("lang", v)} onJump={onJump} />
      <Hero lang={t.lang} onJump={onJump} workflows={workflows} />
      <Stats lang={t.lang} />
      <WorkGrid lang={t.lang} density={t.density} onOpen={setOpenWf} workflows={workflows} />
      <Cases lang={t.lang} />
      <About lang={t.lang} />
      <Contact lang={t.lang} />
      <SiteFooter lang={t.lang} />

      {openWf && (
        <DetailPage workflow={openWf} lang={t.lang} setLang={(v) => setTweak("lang", v)} onClose={() => setOpenWf(null)} onOpen={setOpenWf} workflows={workflows} />
      )}

      <TweaksPanel>
        <TweakSection label="Idioma · Language" />
        <TweakRadio label="Lang" value={t.lang} options={["es", "en"]} onChange={(v) => setTweak("lang", v)} />
        <TweakSection label="Grid de workflows" />
        <TweakRadio label={t.lang === "es" ? "Densidad" : "Density"} value={t.density}
          options={["compact", "regular", "spacious"]} onChange={(v) => setTweak("density", v)} />
        <TweakSection label="Acento" />
        <TweakSelect label="Color" value={t.accent} options={["violet", "emerald", "amber", "rose", "sky"]}
          onChange={(v) => setTweak("accent", v)} />
      </TweaksPanel>
    </div>
  );
}
