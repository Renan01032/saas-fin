import { useState, useEffect, useRef } from "react";

const API_URL = "http://localhost:8000";
const N8N_SECRET = "n8n-interno-saas2024";

// ── THEME ────────────────────────────────────────────────────────────────────
const C = {
  bg:        "#0d0d14",
  panel:     "#13131e",
  card:      "#1a1a28",
  cardHover: "#1f1f30",
  border:    "#252538",
  borderHi:  "#353558",
  purple:    "#7c3aed",
  purpleHi:  "#9d5ff5",
  purpleDim: "#3d1f7a",
  green:     "#00e676",
  greenDim:  "#00c853",
  red:       "#ef5350",
  redDim:    "#b71c1c",
  cyan:      "#00bcd4",
  amber:     "#ffb300",
  text:      "#eeeef8",
  textSub:   "#9090b8",
  textMuted: "#505070",
};

const CAT_COLOR = {
  alimentação: "#00e676", transporte: "#7c3aed", moradia: "#00bcd4",
  saúde: "#ef5350", lazer: "#ffb300", educação: "#4fc3f7",
  vestuário: "#f48fb1", outros: "#78909c",
};

const CATEGORIES = ["alimentação","transporte","moradia","saúde","lazer","educação","vestuário","outros"];

function cc(cat) { return CAT_COLOR[cat] || "#78909c"; }
function fmt(n) { return `R$${Number(n).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}`; }
function fmtShort(n) {
  n = Number(n);
  if (n >= 1000) return `R$${(n/1000).toFixed(1)}k`;
  return `R$${n.toFixed(0)}`;
}
function fmtDate(d) { return new Date(d+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"short"}); }
function today() { return new Date().toISOString().split("T")[0]; }

// ── GLOBAL CSS ────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%}
body{background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif;font-size:14px}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:${C.panel}}
::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
input,select,textarea{font-family:inherit}
button{font-family:inherit;cursor:pointer}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
@keyframes snakeDraw{from{stroke-dashoffset:300}to{stroke-dashoffset:0}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes barGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
.fu{animation:fadeUp .45s ease both}
.fu0{animation-delay:0s}.fu1{animation-delay:.07s}.fu2{animation-delay:.14s}
.fu3{animation-delay:.21s}.fu4{animation-delay:.28s}.fu5{animation-delay:.35s}
.si{animation:scaleIn .35s ease both}
.card-btn{transition:background .15s,border-color .15s,transform .12s}
.card-btn:hover{background:${C.cardHover}!important;border-color:${C.borderHi}!important;transform:translateY(-1px)}
.nav-btn{transition:background .15s,color .15s}
.icon-wrap{transition:background .15s}
`;

// ── SNAKE LOGO SVG ────────────────────────────────────────────────────────────
function SnakeLogo({ size = 32, animate = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Snake body — S-curve */}
      <path
        d="M12 48 C12 36, 28 36, 28 28 C28 20, 44 20, 44 12"
        stroke={C.green} strokeWidth="6" strokeLinecap="round"
        strokeDasharray="300"
        strokeDashoffset={animate ? "300" : "0"}
        style={animate ? { animation: "snakeDraw 1.5s ease forwards" } : {}}
      />
      {/* Second curve */}
      <path
        d="M44 12 C44 4, 56 4, 56 12 C56 20, 44 20, 44 28 C44 36, 56 36, 56 44"
        stroke={C.green} strokeWidth="6" strokeLinecap="round"
        strokeDasharray="300"
        strokeDashoffset={animate ? "300" : "0"}
        style={animate ? { animation: "snakeDraw 1.5s .2s ease forwards" } : {}}
      />
      {/* Head */}
      <ellipse cx="53" cy="48" rx="7" ry="5" fill={C.green} />
      {/* Eye */}
      <circle cx="56" cy="46" r="1.5" fill={C.bg} />
      {/* Tongue */}
      <path d="M46 48 L42 47 M42 47 L40 45 M42 47 L40 49"
        stroke={C.green} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── SPARKLINE ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color, height = 48, width = 120 }) {
  if (!data || data.length < 2) return <div style={{ width, height }} />;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={pts.split(" ").pop().split(",")[0]} cy={pts.split(" ").pop().split(",")[1]} r="3" fill={color} />
    </svg>
  );
}

// ── DONUT ─────────────────────────────────────────────────────────────────────
function Donut({ slices, cx = 72, cy = 72, r = 52, stroke = 16, size = 144 }) {
  const total = slices.reduce((s, d) => s + d.v, 0) || 1;
  const circ = 2 * Math.PI * r;
  let offset = circ * 0.25;
  const arcs = slices.map(d => {
    const dash = (d.v / total) * circ;
    const gap = circ - dash;
    const arc = { ...d, dash, gap, offset: -offset };
    offset -= dash;
    return arc;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={stroke + 2} />
      {arcs.map((a, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
          stroke={a.color} strokeWidth={stroke}
          strokeDasharray={`${a.dash} ${a.gap}`}
          strokeDashoffset={a.offset}
          style={{ transition: "stroke-dasharray .6s ease" }}
        />
      ))}
    </svg>
  );
}

// ── BAR CHART ─────────────────────────────────────────────────────────────────
function BarChart({ data, height = 100 }) {
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height, padding: "0 2px" }}>
      {data.map((d, i) => {
        const pct = (d.v / max) * 86;
        const isToday = d.today;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
              <div style={{
                width: "100%", height: `${Math.max(pct, 3)}%`,
                background: isToday
                  ? `linear-gradient(180deg, ${C.purpleHi}, ${C.purple})`
                  : `${C.purple}44`,
                borderRadius: "3px 3px 0 0",
                transformOrigin: "bottom",
                animation: `barGrow .5s ease ${i * .04}s both`,
                transition: "height .4s ease",
              }} />
            </div>
            <span style={{ fontSize: 10, color: isToday ? C.purpleHi : C.textMuted, fontWeight: isToday ? 600 : 400 }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── HEATMAP ───────────────────────────────────────────────────────────────────
function Heatmap({ data }) {
  const max = Math.max(...data.flat().map(v => v || 0), 1);
  const hours = ["9am","10am","11am","12pm","1pm","2pm","3pm"];
  const days = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: `36px repeat(7, 1fr)`, gap: 3, minWidth: 260 }}>
        <div />
        {days.map(d => <div key={d} style={{ fontSize: 10, color: C.textMuted, textAlign: "center", padding: "0 2px" }}>{d}</div>)}
        {hours.map((h, hi) => [
          <div key={h} style={{ fontSize: 10, color: C.textMuted, display: "flex", alignItems: "center" }}>{h}</div>,
          ...days.map((_, di) => {
            const v = data[hi]?.[di] || 0;
            const intensity = v / max;
            return (
              <div key={di} style={{
                height: 22, borderRadius: 3,
                background: intensity > 0
                  ? `rgba(124,58,237,${0.15 + intensity * 0.75})`
                  : C.border,
                transition: "background .3s",
              }} />
            );
          })
        ])}
      </div>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [wpp, setWpp] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setMsg({ type: "", text: "" });
    try {
      if (tab === "login") {
        const r = await fetch(`${API_URL}/api/v1/users/login`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: pass })
        });
        const d = await r.json();
        if (r.ok) { onLogin(d.access_token, email); return; }
        setMsg({ type: "err", text: d.detail || "Credenciais inválidas" });
      } else {
        const r = await fetch(`${API_URL}/api/v1/users/register`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: pass, whatsapp_number: wpp })
        });
        const d = await r.json();
        if (r.ok) { setMsg({ type: "ok", text: "Conta criada! Faça login." }); setTab("login"); }
        else setMsg({ type: "err", text: d.detail || "Erro ao criar conta" });
      }
    } catch { setMsg({ type: "err", text: "Erro de conexão" }); }
    setLoading(false);
  }

  const inp = {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    background: C.bg, border: `1px solid ${C.border}`,
    color: C.text, fontSize: 14, outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg,
      backgroundImage: `radial-gradient(ellipse at 60% 20%, ${C.purpleDim}44 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, ${C.green}11 0%, transparent 50%)` }}>
      <div className="si" style={{ width: "100%", maxWidth: 400, padding: 24 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <SnakeLogo size={44} animate />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.03em", lineHeight: 1 }}>
                Snake<span style={{ color: C.green }}>Fin</span>
              </div>
              <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: ".06em" }}>FINANCIAL AGENT</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: C.textSub }}>Controle financeiro inteligente via WhatsApp</p>
        </div>

        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28,
          boxShadow: `0 0 0 1px ${C.purple}22, 0 32px 64px #00000088` }}>
          {/* Tabs */}
          <div style={{ display: "flex", background: C.bg, borderRadius: 9, padding: 3, marginBottom: 24 }}>
            {[["login","Entrar"],["register","Criar conta"]].map(([id, label]) => (
              <button key={id} onClick={() => { setTab(id); setMsg({ type:"",text:"" }); }} style={{
                flex: 1, padding: "8px 0", border: "none", borderRadius: 7,
                background: tab === id ? C.purple : "transparent",
                color: tab === id ? "#fff" : C.textMuted,
                fontSize: 13, fontWeight: tab === id ? 600 : 400,
                transition: "all .2s",
              }}>{label}</button>
            ))}
          </div>

          <form onSubmit={submit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: ".06em", marginBottom: 6 }}>EMAIL</div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="seu@email.com" style={inp}
                  onFocus={e => e.target.style.borderColor = C.purple}
                  onBlur={e => e.target.style.borderColor = C.border} />
              </div>
              {tab === "register" && (
                <div>
                  <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: ".06em", marginBottom: 6 }}>WHATSAPP</div>
                  <input type="text" value={wpp} onChange={e => setWpp(e.target.value)}
                    placeholder="5511999999999" style={inp}
                    onFocus={e => e.target.style.borderColor = C.purple}
                    onBlur={e => e.target.style.borderColor = C.border} />
                </div>
              )}
              <div>
                <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: ".06em", marginBottom: 6 }}>SENHA</div>
                <input type="password" value={pass} onChange={e => setPass(e.target.value)} required
                  placeholder="••••••••" style={inp}
                  onFocus={e => e.target.style.borderColor = C.purple}
                  onBlur={e => e.target.style.borderColor = C.border} />
              </div>
            </div>

            {msg.text && (
              <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, fontSize: 13,
                background: msg.type === "ok" ? `${C.green}18` : `${C.red}18`,
                border: `1px solid ${msg.type === "ok" ? C.green : C.red}44`,
                color: msg.type === "ok" ? C.green : C.red }}>
                {msg.text}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", marginTop: 20, padding: "13px 0", border: "none", borderRadius: 10,
              background: `linear-gradient(135deg, ${C.purple}, ${C.purpleHi})`,
              color: "#fff", fontSize: 15, fontWeight: 600,
              opacity: loading ? .7 : 1, cursor: loading ? "not-allowed" : "pointer",
              boxShadow: `0 4px 20px ${C.purple}55`,
              transition: "opacity .15s, transform .12s",
            }}
              onMouseEnter={e => { if (!loading) e.target.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => e.target.style.transform = "translateY(0)"}>
              {loading ? "Aguarde..." : tab === "login" ? "Entrar →" : "Criar conta →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", icon: "⬡", label: "Dashboard" },
  { id: "budget", icon: "◈", label: "Orçamento" },
  { id: "transactions", icon: "≡", label: "Transações" },
  { id: "new", icon: "+", label: "Nova" },
];

function Sidebar({ page, setPage, email, onLogout }) {
  return (
    <div style={{ width: 64, background: C.panel, borderRight: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0",
      position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ marginBottom: 28 }}>
        <SnakeLogo size={36} />
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
        {NAV_ITEMS.map(n => {
          const active = page === n.id;
          return (
            <button key={n.id} onClick={() => setPage(n.id)} title={n.label}
              className="nav-btn"
              style={{
                width: 42, height: 42, border: `1px solid ${active ? C.purple : "transparent"}`,
                borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                background: active ? `${C.purple}22` : "transparent",
                color: active ? C.purpleHi : C.textMuted,
                fontSize: n.id === "new" ? 22 : 17, fontWeight: 500,
                transition: "all .15s",
              }}>
              {n.icon}
            </button>
          );
        })}
      </nav>

      {/* User avatar */}
      <button onClick={onLogout} title={email}
        style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${C.border}`,
          background: `${C.purple}33`, color: C.purpleHi, fontSize: 13, fontWeight: 600,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {email?.[0]?.toUpperCase() || "U"}
      </button>
    </div>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({ title, value, sub, subColor, sparkData, sparkColor, badge, delay = 0 }) {
  return (
    <div className={`card-btn fu fu${delay}`} style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
      padding: "18px 20px", flex: "1 1 180px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: ".06em" }}>{title}</div>
        {badge && (
          <div style={{ fontSize: 10, padding: "3px 7px", borderRadius: 20,
            background: `${badge.color}22`, color: badge.color, fontWeight: 600 }}>
            {badge.text}
          </div>
        )}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.02em", marginBottom: 6,
        fontFamily: "'JetBrains Mono'", color: C.text }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: subColor || C.textSub }}>{sub}</div>}
      {sparkData && (
        <div style={{ marginTop: 12 }}>
          <Sparkline data={sparkData} color={sparkColor || C.purple} height={36} width="100%" />
        </div>
      )}
    </div>
  );
}

// ── DASHBOARD PAGE ────────────────────────────────────────────────────────────
function DashboardPage({ txs, loading }) {
  const now = new Date();
  const thisMo = txs.filter(t => {
    const d = new Date(t.transaction_date + "T12:00:00");
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const total = thisMo.reduce((s, t) => s + Number(t.amount), 0);
  const maior = thisMo.length ? Math.max(...thisMo.map(t => Number(t.amount))) : 0;
  const waCount = thisMo.filter(t => t.source?.startsWith("whatsapp")).length;

  // Categoria donut
  const catMap = {};
  thisMo.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount); });
  const catSlices = Object.entries(catMap).sort((a,b) => b[1]-a[1]).map(([k,v]) => ({ label:k, v, color:cc(k) }));

  // Últimos 14 dias — barra
  const barData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().split("T")[0];
    const v = txs.filter(t => t.transaction_date === key).reduce((s,t)=>s+Number(t.amount),0);
    const isToday = i === 13;
    return { label: d.getDate() % 2 === 0 || isToday ? String(d.getDate()) : "", v, today: isToday };
  });

  // Heatmap simulado (7 horas × 7 dias baseado nos dados reais)
  const heatData = Array.from({ length: 7 }, (_, hi) =>
    Array.from({ length: 7 }, (_, di) => {
      const day = new Date(); day.setDate(day.getDate() - (6 - di));
      return txs.filter(t => t.transaction_date === day.toISOString().split("T")[0]).length > 0
        ? Math.random() * 3 : 0;
    })
  );

  // Sparkline dos últimos 7 dias
  const spark7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6-i));
    return txs.filter(t => t.transaction_date === d.toISOString().split("T")[0]).reduce((s,t)=>s+Number(t.amount),0);
  });

  if (loading) return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      {[1,2,3].map(i => <div key={i} style={{ height: 90, borderRadius: 14, background: C.card, animation: "pulse 1.5s infinite" }} />)}
    </div>
  );

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div className="fu fu0" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: ".08em", marginBottom: 4 }}>OVERVIEW</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.02em" }}>
            Dashboard <span style={{ fontSize: 13, fontWeight: 400, color: C.textSub }}>
              — {now.toLocaleDateString("pt-BR",{month:"long",year:"numeric"})}
            </span>
          </div>
        </div>
        {waCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: `${C.green}15`, border:`1px solid ${C.green}33`, borderRadius: 20, padding: "5px 12px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 12, color: C.green, fontWeight: 500 }}>{waCount} via WhatsApp</span>
          </div>
        )}
      </div>

      {/* Stat Cards Row */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard delay={1} title="TOTAL DO MÊS" value={fmt(total)} sub={`${thisMo.length} transações`}
          sparkData={spark7} sparkColor={C.green}
          badge={{ text: waCount > 0 ? `+${waCount} WA` : "—", color: C.green }} />
        <StatCard delay={2} title="MAIOR GASTO" value={fmt(maior)}
          sub="este mês" sparkData={spark7.map(v => v * 0.6)} sparkColor={C.purpleHi} />
        <StatCard delay={3} title="CATEGORIAS" value={Object.keys(catMap).length}
          sub="distintas" sparkData={spark7.map((v,i) => i+1)} sparkColor={C.cyan} />
        <StatCard delay={4} title="VIA WHATSAPP" value={waCount}
          sub={`${thisMo.length > 0 ? Math.round(waCount/thisMo.length*100) : 0}% do total`}
          sparkData={spark7.map(v => v > 0 ? 1 : 0)} sparkColor={C.amber} />
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12 }}>
        {/* Total Balance / Spending trend */}
        <div className="fu fu2 card-btn" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: ".06em", marginBottom: 6 }}>GASTOS POR DIA</div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'JetBrains Mono'", letterSpacing: "-.03em" }}>{fmt(total)}</div>
              <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>acumulado no mês</div>
            </div>
            <div style={{ fontSize: 11, color: C.green, background: `${C.green}18`, padding: "4px 10px", borderRadius: 20, fontWeight: 600 }}>14 dias</div>
          </div>
          <div style={{ marginTop: 20 }}>
            <BarChart data={barData} height={88} />
          </div>
        </div>

        {/* Top Spending donut */}
        <div className="fu fu3 card-btn" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: ".06em", marginBottom: 16 }}>TOP CATEGORIAS</div>
          {catSlices.length === 0 ? (
            <div style={{ color: C.textMuted, fontSize: 13, textAlign: "center", padding: 40 }}>Sem dados</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ position: "relative" }}>
                <Donut slices={catSlices} size={130} cx={65} cy={65} r={46} stroke={13} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 10, color: C.textMuted }}>TOTAL</div>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono'" }}>{fmtShort(total)}</div>
                </div>
              </div>
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 7 }}>
                {catSlices.slice(0, 4).map(s => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                      <span style={{ fontSize: 12, color: C.textSub, textTransform: "capitalize" }}>{s.label}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono'", color: C.text }}>{fmtShort(s.v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Heatmap */}
        <div className="fu fu4 card-btn" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: ".06em" }}>HEATMAP DE ATIVIDADE</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>Semana</div>
          </div>
          <Heatmap data={heatData} />
        </div>

        {/* Transaction History */}
        <div className="fu fu5 card-btn" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: ".06em" }}>HISTÓRICO RECENTE</div>
            <div style={{ display: "flex", gap: 6 }}>
              {["Todas","WA","Manual"].map(f => (
                <div key={f} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 12,
                  background: f==="Todas" ? `${C.purple}33` : "transparent",
                  color: f==="Todas" ? C.purpleHi : C.textMuted,
                  border: `1px solid ${f==="Todas" ? C.purple : C.border}`,
                  cursor: "pointer" }}>{f}</div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {txs.slice(0, 5).map((t, i) => (
              <div key={t.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none",
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  background: `${cc(t.category)}18`, border: `1px solid ${cc(t.category)}33`,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: cc(t.category) }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.text,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.description || "—"}
                  </div>
                  <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>
                    {fmtDate(t.transaction_date)}
                    {t.source?.startsWith("whatsapp") && <span style={{ marginLeft: 6, color: C.green }}>● WA</span>}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.red, fontFamily: "'JetBrains Mono'", flexShrink: 0 }}>
                  -{fmtShort(t.amount)}
                </div>
              </div>
            ))}
            {txs.length === 0 && (
              <div style={{ textAlign: "center", color: C.textMuted, fontSize: 12, padding: "24px 0" }}>
                Nenhuma transação ainda
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── BUDGET PAGE ───────────────────────────────────────────────────────────────
function BudgetPage({ txs }) {
  const BUDGETS = { alimentação: 600, transporte: 300, moradia: 1500, saúde: 400, lazer: 200, educação: 300, vestuário: 200, outros: 100 };
  const spent = {};
  txs.forEach(t => { spent[t.category] = (spent[t.category] || 0) + Number(t.amount); });

  return (
    <div style={{ padding: "20px 24px" }}>
      <div className="fu fu0" style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: ".08em", marginBottom: 4 }}>CONTROLE</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Orçamento</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 12 }}>
        {CATEGORIES.map((cat, i) => {
          const s = spent[cat] || 0;
          const b = BUDGETS[cat];
          const pct = Math.min((s / b) * 100, 100);
          const over = s > b;
          return (
            <div key={cat} className={`card-btn fu fu${i%4}`}
              style={{ background: C.card, border: `1px solid ${over ? C.red+"44" : C.border}`, borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: cc(cat) }} />
                  <span style={{ fontSize: 13, fontWeight: 500, textTransform: "capitalize" }}>{cat}</span>
                </div>
                {over && <span style={{ fontSize: 10, color: C.red, background: `${C.red}18`, padding: "2px 7px", borderRadius: 10, fontWeight: 600 }}>EXCEDIDO</span>}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: C.textSub }}>Gasto</span>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono'", color: over ? C.red : C.text }}>{fmt(s)}</span>
              </div>
              <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
                <div style={{ height: "100%", width: `${pct}%`,
                  background: over ? C.red : pct > 80 ? C.amber : cc(cat),
                  borderRadius: 2, transition: "width .6s ease" }} />
              </div>
              <div style={{ fontSize: 11, color: C.textMuted, textAlign: "right" }}>
                {fmt(s)} / {fmt(b)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── TRANSACTIONS PAGE ─────────────────────────────────────────────────────────
function TransactionsPage({ txs }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("todas");

  const filtered = txs.filter(t =>
    (cat === "todas" || t.category === cat) &&
    (!search || (t.description||"").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding: "20px 24px" }}>
      <div className="fu fu0" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: ".08em", marginBottom: 4 }}>HISTÓRICO</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Transações</div>
      </div>

      {/* Filters */}
      <div className="fu fu1" style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
          style={{ flex: "1 1 180px", padding: "9px 14px", borderRadius: 9,
            background: C.card, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: "none" }}
          onFocus={e => e.target.style.borderColor = C.purple}
          onBlur={e => e.target.style.borderColor = C.border} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["todas", ...CATEGORIES].map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: "7px 12px", borderRadius: 20, border: `1px solid ${cat===c ? cc(c==="todas"?"alimentação":c) : C.border}`,
              background: cat===c ? `${cc(c==="todas"?"alimentação":c)}18` : "transparent",
              color: cat===c ? cc(c==="todas"?C.purpleHi:c) : C.textMuted,
              fontSize: 11, fontWeight: cat===c ? 600 : 400, textTransform: "capitalize",
              transition: "all .15s", cursor: "pointer",
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="fu fu2" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>{filtered.length} transações</span>
          <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono'", color: C.red }}>
            -{fmt(filtered.reduce((s,t) => s+Number(t.amount), 0))}
          </span>
        </div>
        {filtered.map((t, i) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px",
            borderBottom: i < filtered.length-1 ? `1px solid ${C.border}` : "none",
            transition: "background .15s" }}
            onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: cc(t.category), flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{t.description || "—"}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2, textTransform: "capitalize" }}>{t.category}</div>
            </div>
            <div style={{ fontSize: 12, color: C.textMuted }}>{fmtDate(t.transaction_date)}</div>
            {t.source?.startsWith("whatsapp") && (
              <div style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10,
                background: `${C.green}18`, color: C.green, border: `1px solid ${C.green}33` }}>WA</div>
            )}
            <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono'", color: C.red, minWidth: 70, textAlign: "right" }}>
              -{fmt(t.amount)}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: C.textMuted, padding: 40, fontSize: 13 }}>Nenhuma transação</div>
        )}
      </div>
    </div>
  );
}

// ── NEW TX PAGE ───────────────────────────────────────────────────────────────
function NewTxPage({ onSaved }) {
  const [form, setForm] = useState({ amount: "", description: "", category: "alimentação", date: today() });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    if (!form.amount || !form.description) { setMsg({ type: "err", text: "Preencha todos os campos" }); return; }
    setLoading(true); setMsg({ type:"",text:"" });
    try {
      const text = `Gastei ${form.amount} reais em ${form.description} categoria ${form.category} data ${form.date}`;
      const r = await fetch(`${API_URL}/api/v1/messages/process`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: "dashboard", message_text: text, message_type: "text", n8n_secret: N8N_SECRET })
      });
      const d = await r.json();
      if (d.action === "saved") {
        setMsg({ type: "ok", text: `✓ Salvo! ${fmt(form.amount)} em ${form.category}` });
        setForm({ amount: "", description: "", category: "alimentação", date: today() });
        onSaved();
      } else setMsg({ type: "err", text: d.reply || "Erro ao salvar" });
    } catch { setMsg({ type: "err", text: "Erro de conexão" }); }
    setLoading(false);
  }

  const inp = { width: "100%", padding: "12px 16px", borderRadius: 10, background: C.bg,
    border: `1px solid ${C.border}`, color: C.text, fontSize: 15, outline: "none", fontFamily: "inherit" };

  return (
    <div style={{ padding: "20px 24px", maxWidth: 540 }}>
      <div className="fu fu0" style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: ".08em", marginBottom: 4 }}>REGISTRAR</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Nova Transação</div>
      </div>

      <form className="fu fu1" onSubmit={submit}
        style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: ".06em", marginBottom: 8 }}>VALOR (R$)</div>
          <input type="number" value={form.amount} onChange={e => set("amount", e.target.value)}
            placeholder="0,00" min="0.01" step="0.01" required style={{ ...inp, fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono'" }}
            onFocus={e => e.target.style.borderColor = C.purple}
            onBlur={e => e.target.style.borderColor = C.border} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: ".06em", marginBottom: 8 }}>DESCRIÇÃO</div>
          <input type="text" value={form.description} onChange={e => set("description", e.target.value)}
            placeholder="Ex: almoço, mercado, farmácia..." required style={inp}
            onFocus={e => e.target.style.borderColor = C.purple}
            onBlur={e => e.target.style.borderColor = C.border} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: ".06em", marginBottom: 10 }}>CATEGORIA</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {CATEGORIES.map(c => (
              <button type="button" key={c} onClick={() => set("category", c)} style={{
                padding: "7px 13px", borderRadius: 20,
                border: `1px solid ${form.category===c ? cc(c) : C.border}`,
                background: form.category===c ? `${cc(c)}18` : "transparent",
                color: form.category===c ? cc(c) : C.textMuted,
                fontSize: 12, fontWeight: form.category===c ? 600 : 400,
                textTransform: "capitalize", cursor: "pointer", transition: "all .15s",
              }}>{c}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: ".06em", marginBottom: 8 }}>DATA</div>
          <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={{ ...inp, colorScheme: "dark" }} />
        </div>

        {msg.text && (
          <div style={{ padding: "11px 14px", borderRadius: 9, fontSize: 13,
            background: msg.type==="ok" ? `${C.green}18` : `${C.red}18`,
            border: `1px solid ${msg.type==="ok" ? C.green : C.red}44`,
            color: msg.type==="ok" ? C.green : C.red }}>
            {msg.text}
          </div>
        )}

        <button type="submit" disabled={loading} style={{
          padding: "14px 0", border: "none", borderRadius: 10,
          background: `linear-gradient(135deg, ${C.purple}, ${C.purpleHi})`,
          color: "#fff", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? .7 : 1, boxShadow: `0 4px 18px ${C.purple}44`,
          transition: "opacity .15s, transform .12s",
        }}
          onMouseEnter={e => { if (!loading) e.target.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => e.target.style.transform = "translateY(0)"}>
          {loading ? "Salvando..." : "Salvar transação →"}
        </button>
      </form>
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("sf_token") || "");
  const [email, setEmail] = useState(() => localStorage.getItem("sf_email") || "");
  const [page, setPage] = useState("dashboard");
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(false);

  function handleLogin(t, e) {
    setToken(t); setEmail(e);
    localStorage.setItem("sf_token", t);
    localStorage.setItem("sf_email", e);
  }

  function handleLogout() {
    setToken(""); setEmail("");
    localStorage.removeItem("sf_token");
    localStorage.removeItem("sf_email");
  }

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/v1/transactions/`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setTxs(await r.json());
      else if (r.status === 401) handleLogout();
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, [token]);

  if (!token) return <><style>{CSS}</style><Login onLogin={handleLogin} /></>;

  return (
    <>
      <style>{CSS}</style>
      <div style={{ display: "flex", height: "100vh",
        backgroundImage: `radial-gradient(ellipse at 80% 10%, ${C.purpleDim}33 0%, transparent 50%)` }}>
        <Sidebar page={page} setPage={setPage} email={email} onLogout={handleLogout} />
        <main style={{ flex: 1, overflowY: "auto" }}>
          {page === "dashboard" && <DashboardPage txs={txs} loading={loading} />}
          {page === "budget" && <BudgetPage txs={txs} />}
          {page === "transactions" && <TransactionsPage txs={txs} />}
          {page === "new" && <NewTxPage onSaved={load} />}
        </main>
      </div>
    </>
  );
}