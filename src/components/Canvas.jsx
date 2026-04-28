import { useState, useRef, useMemo, useEffect, useCallback, useId } from "react";

const NODE_W = 132;
const NODE_H = 56;

const NODE_COLORS = {
  trigger: { bg: "#1d1b2e", ring: "#a78bfa", glow: "rgba(167,139,250,.35)" },
  app:     { bg: "#1a1924", ring: "#7c7a96", glow: "rgba(124,122,150,.25)" },
  ai:      { bg: "#1d1825", ring: "#c4b5fd", glow: "rgba(196,181,253,.4)" },
  http:    { bg: "#16182a", ring: "#7fbfff", glow: "rgba(127,191,255,.25)" },
  code:    { bg: "#181826", ring: "#84cc99", glow: "rgba(132,204,153,.22)" },
  if:      { bg: "#22192a", ring: "#f0a8c8", glow: "rgba(240,168,200,.28)" },
};

const TYPE_LABELS = {
  trigger: { es: "Trigger",      en: "Trigger" },
  app:     { es: "Aplicación",   en: "App" },
  ai:      { es: "IA / LangChain", en: "AI / LangChain" },
  http:    { es: "HTTP / API",   en: "HTTP / API" },
  code:    { es: "Lógica / Code", en: "Logic / Code" },
  if:      { es: "Condicional",  en: "Conditional" },
};

const FALLBACK_DESC = {
  es: "Nodo del flujo. Forma parte de la cadena que conecta entradas, lógica y salidas.",
  en: "Workflow node. Part of the chain connecting inputs, logic and outputs.",
};

function bezier(x1, y1, x2, y2) {
  const dx = Math.max(40, Math.abs(x2 - x1) * 0.5);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

export function WorkflowCanvas({
  workflow, animated = false, interactive = true, hoverable = true,
  selectable = false, lang = "es", thumbnail = false,
}) {
  const uid = useId().replace(/:/g, "");
  const wf = workflow;
  const nodes = wf.canvas || [];
  const edges = (wf.edges || []).map(e => Array.isArray(e) ? e : [e.from, e.to]);
  if (nodes.length === 0) return null;
  const padding = thumbnail ? 100 : 32;

  const xs = nodes.map(n => n.x);
  const ys = nodes.map(n => n.y);
  const minX = Math.min(...xs) - padding;
  const minY = Math.min(...ys) - padding;
  const maxX = Math.max(...xs) + NODE_W + padding;
  const maxY = Math.max(...ys) + NODE_H + padding;
  const rawW = maxX - minX;
  const rawH = maxY - minY;
  const MIN_W = thumbnail ? NODE_W * 8 : NODE_W * 5;
  const MIN_H = thumbnail ? NODE_H * 8 : NODE_H * 5;
  const fullW = Math.max(rawW, MIN_W);
  const fullH = Math.max(rawH, MIN_H);
  const padX = (fullW - rawW) / 2;
  const padY = (fullH - rawH) / 2;

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState(null);
  const [clickedPulse, setClickedPulse] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => { setPan({ x: 0, y: 0 }); }, [selected]);

  const ZOOM_W = NODE_W * 2.2;
  const ZOOM_H = NODE_H * 4.2;
  const baseTarget = useMemo(() => {
    if (selectable && selected) {
      const n = nodeMap[selected];
      if (n) {
        const cx = n.x + NODE_W / 2;
        const cy = n.y + NODE_H / 2;
        return { x: cx - ZOOM_W / 2, y: cy - ZOOM_H / 2, w: ZOOM_W, h: ZOOM_H };
      }
    }
    return { x: minX - padX, y: minY - padY, w: fullW, h: fullH };
  }, [selected, selectable, ZOOM_W, ZOOM_H, nodeMap, minX, minY, fullW, fullH, padX, padY]);

  const [vb, setVb] = useState(() => ({ ...baseTarget }));
  const vbRef = useRef({ ...baseTarget });
  const targetRef = useRef({ ...baseTarget });
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const isDraggingRef = useRef(false);

  const tickRef = useRef(null);
  if (!tickRef.current) {
    tickRef.current = (now) => {
      const last = lastTimeRef.current || now;
      const dt = Math.min(64, now - last);
      lastTimeRef.current = now;
      const cur = vbRef.current;
      const tgt = targetRef.current;
      const f = 1 - Math.exp(-dt / 70);
      const next = {
        x: cur.x + (tgt.x - cur.x) * f, y: cur.y + (tgt.y - cur.y) * f,
        w: cur.w + (tgt.w - cur.w) * f, h: cur.h + (tgt.h - cur.h) * f,
      };
      const eps = 0.4;
      const close = Math.abs(next.x - tgt.x) < eps && Math.abs(next.y - tgt.y) < eps
                 && Math.abs(next.w - tgt.w) < eps && Math.abs(next.h - tgt.h) < eps;
      const finalNext = close ? tgt : next;
      vbRef.current = finalNext;
      setVb(finalNext);
      if (!close && !isDraggingRef.current) rafRef.current = requestAnimationFrame(tickRef.current);
      else { rafRef.current = null; lastTimeRef.current = 0; }
    };
  }

  useEffect(() => {
    targetRef.current = { x: baseTarget.x + pan.x, y: baseTarget.y + pan.y, w: baseTarget.w, h: baseTarget.h };
    if (isDraggingRef.current) { vbRef.current = { ...targetRef.current }; setVb(vbRef.current); return; }
    if (rafRef.current == null) { lastTimeRef.current = 0; rafRef.current = requestAnimationFrame(tickRef.current); }
  }, [baseTarget.x, baseTarget.y, baseTarget.w, baseTarget.h, pan.x, pan.y]); // eslint-disable-line

  useEffect(() => () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); }, []);

  const selNode = selected ? nodeMap[selected] : null;
  const selColor = selNode ? (NODE_COLORS[selNode.type] || NODE_COLORS.app) : null;
  const selDesc = selNode ? (selNode.desc ? selNode.desc[lang] : FALLBACK_DESC[lang]) : null;
  const selTypeLbl = selNode ? (TYPE_LABELS[selNode.type] ? TYPE_LABELS[selNode.type][lang] : selNode.type) : null;

  const adjOut = useMemo(() => { const m = {}; edges.forEach(([a,b]) => { (m[a] = m[a] || []).push(b); }); return m; }, [edges]);
  const adjIn  = useMemo(() => { const m = {}; edges.forEach(([a,b]) => { (m[b] = m[b] || []).push(a); }); return m; }, [edges]);
  const ordered = useMemo(() => [...nodes].sort((a,b) => a.x - b.x || a.y - b.y), [nodes]);

  const goToNode = useCallback((id) => {
    setSelected(id);
    setPan({ x: 0, y: 0 });
    if (id) {
      const n = nodeMap[id];
      if (n) {
        const cx = n.x + NODE_W / 2;
        const cy = n.y + NODE_H / 2;
        const ZW = NODE_W * 2.2;
        const ZH = NODE_H * 4.2;
        // Set target immediately and kick off spring — don't wait for useEffect
        targetRef.current = { x: cx - ZW / 2, y: cy - ZH / 2, w: ZW, h: ZH };
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        lastTimeRef.current = 0;
        rafRef.current = requestAnimationFrame(tickRef.current);
      }
      setClickedPulse(id);
      setTimeout(() => setClickedPulse(null), 420);
    }
  }, [nodeMap]);
  const goAdjacent = useCallback((dir) => {
    if (!selected) { setSelected(ordered[0].id); return; }
    const conn = dir === "next" ? (adjOut[selected] || []) : (adjIn[selected] || []);
    if (conn.length > 0) { goToNode(conn[0]); return; }
    const idx = ordered.findIndex(n => n.id === selected);
    const ni = dir === "next" ? Math.min(ordered.length - 1, idx + 1) : Math.max(0, idx - 1);
    goToNode(ordered[ni].id);
  }, [selected, ordered, adjOut, adjIn, goToNode]);

  useEffect(() => {
    if (!selectable) return;
    const onKey = (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      if (e.key === "Escape" && selected) setSelected(null);
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); goAdjacent("next"); }
      else if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   { e.preventDefault(); goAdjacent("prev"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, selectable, goAdjacent]);

  // ── pan on empty canvas (drag-to-pan when a node is selected) ──
  const onCanvasPointerDown = (e) => {
    if (!selectable || !selected) return;
    if (e.target.closest("[data-ui]")) return;
    const rect = containerRef.current.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      startPan: { ...pan },
      scaleX: vb.w / rect.width, scaleY: vb.h / rect.height,
      moved: false,
    };
    isDraggingRef.current = true;
    if (rafRef.current != null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    containerRef.current.setPointerCapture(e.pointerId);
  };
  const onCanvasPointerMove = (e) => {
    if (!dragRef.current) return;
    const d = dragRef.current;
    const dx = e.clientX - d.startX, dy = e.clientY - d.startY;
    if (Math.hypot(dx, dy) > 4) dragRef.current.moved = true;
    if (dragRef.current.moved)
      setPan({ x: d.startPan.x - dx * d.scaleX, y: d.startPan.y - dy * d.scaleY });
  };
  const onCanvasPointerUp = (e) => {
    if (!dragRef.current) return;
    const wasDrag = dragRef.current.moved;
    dragRef.current = null; isDraggingRef.current = false;
    try { containerRef.current.releasePointerCapture(e.pointerId); } catch (_) {}
    if (!wasDrag) setSelected(null); // click on empty canvas → deselect
  };

  // ── node click: stop propagation so canvas pan never fires on node ──
  const handleNodePointerDown = useCallback((e) => {
    e.stopPropagation();
  }, []);
  const handleNodeClick = useCallback((e, nodeId) => {
    e.stopPropagation();
    if (!selectable) return;
    goToNode(nodeId === selected ? null : nodeId);
  }, [selectable, selected, goToNode]);

  const isZoomed = !!(selectable && selected);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100%",
        cursor: isZoomed ? (dragRef.current ? "grabbing" : "grab") : "default",
        touchAction: isZoomed ? "none" : "auto" }}
      onPointerDown={onCanvasPointerDown} onPointerMove={onCanvasPointerMove}
      onPointerUp={onCanvasPointerUp} onPointerCancel={onCanvasPointerUp}
    >
      <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        style={{ width: "100%", height: "100%", display: "block" }}
        preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id={`grid-dots-${uid}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.7" fill="rgba(255,255,255,.06)" />
          </pattern>
          {animated && (
            <linearGradient id={`flow-grad-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="rgba(167,139,250,0)" />
              <stop offset="50%"  stopColor="rgba(196,181,253,1)" />
              <stop offset="100%" stopColor="rgba(167,139,250,0)" />
            </linearGradient>
          )}
        </defs>
        <rect x={minX - padX - 2000} y={minY - padY - 2000} width={fullW + 4000} height={fullH + 4000} fill={`url(#grid-dots-${uid})`} />

        {edges.map(([fromId, toId], i) => {
          const a = nodeMap[fromId]; const b = nodeMap[toId];
          if (!a || !b) return null;
          const x1 = a.x + NODE_W, y1 = a.y + NODE_H / 2, x2 = b.x, y2 = b.y + NODE_H / 2;
          const d = bezier(x1, y1, x2, y2);
          const isHot = (hover && (hover === a.id || hover === b.id)) || (selected && (selected === a.id || selected === b.id));
          const dim = selected && !isHot;
          return (
            <g key={i} opacity={dim ? 0.18 : 1}>
              <path d={d} fill="none" stroke={isHot ? "rgba(196,181,253,.7)" : "rgba(255,255,255,.18)"} strokeWidth="1.5" />
              {animated && (
                <path d={d} fill="none" stroke={`url(#flow-grad-${uid})`} strokeWidth="2.5" strokeLinecap="round">
                  <animate attributeName="stroke-dasharray" values="0,200;60,200;200,200" dur="2.4s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
                  <animate attributeName="stroke-dashoffset" values="0;-200" dur="2.4s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
                </path>
              )}
            </g>
          );
        })}

        {nodes.map((n) => {
          const c = NODE_COLORS[n.type] || NODE_COLORS.app;
          const isHover = hover === n.id, isSel = selected === n.id, dim = selected && !isSel;
          const isPulse = clickedPulse === n.id;
          return (
            <g key={n.id} data-node transform={`translate(${n.x},${n.y})`} opacity={dim ? 0.32 : 1}
              onMouseEnter={hoverable ? () => setHover(n.id) : undefined}
              onMouseLeave={hoverable ? () => setHover(null) : undefined}
              onPointerDown={selectable ? handleNodePointerDown : undefined}
              onClick={selectable ? (e) => handleNodeClick(e, n.id) : undefined}
              style={{ cursor: (selectable || interactive) ? "pointer" : "default", transition: "opacity .25s" }}>
              {isPulse && (
                <rect x="-12" y="-12" width={NODE_W + 24} height={NODE_H + 24} rx="18"
                  fill="none" stroke={c.ring} strokeWidth="2"
                  style={{ animation: "node-pulse 0.42s ease-out forwards" }} />
              )}
              {(isHover || isSel) && <rect x="-6" y="-6" width={NODE_W + 12} height={NODE_H + 12} rx="14" fill={c.glow} style={{ filter: "blur(8px)" }} />}
              <rect width={NODE_W} height={NODE_H} rx="10" fill={c.bg} stroke={isSel ? c.ring : (isHover ? c.ring : "rgba(255,255,255,.08)")} strokeWidth={isSel ? 2 : 1} />
              <rect x="0" y="0" width="3" height={NODE_H} rx="1.5" fill={c.ring} />
              <text x="14" y="22" fill={c.ring} style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600 }}>{n.icon}</text>
              <text x="32" y="22" fill="rgba(255,255,255,.92)" style={{ fontFamily: "var(--sans)", fontSize: 11, fontWeight: 600 }}>
                {n.label.length > 14 ? n.label.slice(0, 14) + "…" : n.label}
              </text>
              <text x="14" y="42" fill="rgba(255,255,255,.4)" style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: ".05em", textTransform: "uppercase" }}>{n.type}</text>
              <circle cx="0" cy={NODE_H / 2} r="3" fill="rgba(255,255,255,.15)" />
              <circle cx={NODE_W} cy={NODE_H / 2} r="3" fill="rgba(255,255,255,.15)" />
            </g>
          );
        })}
      </svg>

      {selectable && (
        <div className="node-bar" data-ui onClick={e => e.stopPropagation()}>
          {isZoomed && (
            <div className="nb-controls nb-left">
              <button className="nb-btn" title={lang === "es" ? "Anterior" : "Previous"} onClick={() => goAdjacent("prev")}>‹</button>
              <button className="nb-btn" title={lang === "es" ? "Siguiente" : "Next"} onClick={() => goAdjacent("next")}>›</button>
              <span className="nb-sep" />
            </div>
          )}
          <div className="nb-scroll">
            {ordered.map((n) => (
              <button key={n.id} className={`ns-pill ${selected === n.id ? "is-active" : ""}`} onClick={() => goToNode(n.id)} title={n.label}>
                <span className="ns-dot" style={{ background: (NODE_COLORS[n.type] || NODE_COLORS.app).ring }} />
                {n.label}
              </button>
            ))}
          </div>
          {isZoomed && (
            <div className="nb-controls nb-right">
              <span className="nb-sep" />
              <button className="nb-btn" title={lang === "es" ? "Ver todo" : "See all"} onClick={() => setSelected(null)}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2h4M2 2v4M12 2H8M12 2v4M2 12h4M2 12V8M12 12H8M12 12V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {selectable && selNode && (
        <div className="node-panel" data-ui onClick={e => e.stopPropagation()}>
          <button className="node-panel-x" onClick={() => setSelected(null)}>✕</button>
          <div className="np-type">
            <span className="np-dot" style={{ background: selColor.ring, boxShadow: `0 0 8px ${selColor.ring}` }} />
            <span>{selTypeLbl}</span>
          </div>
          <h4 className="np-title">{selNode.label}</h4>
          <p className="np-desc">{selDesc}</p>
          <div className="np-nav">
            <button onClick={() => goAdjacent("prev")}>← {lang === "es" ? "Anterior" : "Previous"}</button>
            <button onClick={() => goAdjacent("next")}>{lang === "es" ? "Siguiente" : "Next"} →</button>
          </div>
          <div className="np-hint">{lang === "es" ? "Arrastra para mover · ← → o ESC" : "Drag to pan · ← → or ESC"}</div>
        </div>
      )}

      {selectable && !selNode && (
        <div className="canvas-hint" data-ui>
          <span className="ch-dot" />
          {lang === "es" ? "Click en cualquier nodo para ver su descripción" : "Click any node to see its description"}
        </div>
      )}
    </div>
  );
}

export function SimpleDiagram({ workflow }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap", padding: "32px 16px" }}>
      {workflow.integrations.map((name, i) => (
        <span key={i} style={{ display: "inline-flex" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "12px 14px",
            background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, minWidth: 96 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "linear-gradient(135deg, rgba(167,139,250,.25), rgba(124,58,237,.1))",
              border: "1px solid rgba(167,139,250,.3)", display: "grid", placeItems: "center",
              fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: "#c4b5fd" }}>
              {name[0]}
            </div>
            <div style={{ fontFamily: "var(--sans)", fontSize: 11, color: "rgba(255,255,255,.85)" }}>{name}</div>
          </div>
          {i < workflow.integrations.length - 1 && (
            <div style={{ color: "rgba(167,139,250,.4)", fontFamily: "var(--mono)", fontSize: 18, padding: "0 6px", display: "flex", alignItems: "center" }}>→</div>
          )}
        </span>
      ))}
    </div>
  );
}
