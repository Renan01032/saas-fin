import { T } from "../constants";
import SnakeLogo from "./SnakeLogo";

export function Alert({ type, text }) {
  if (!text) return null;
  const ok = type === "ok";
  return (
    <div style={{
      padding: "11px 14px", borderRadius: 9, fontSize: 13,
      background: ok ? `${T.green}18` : `${T.red}18`,
      border: `1px solid ${ok ? T.green : T.red}44`,
      color: ok ? T.green : T.red,
    }}>{text}</div>
  );
}

export function Label({ text }) {
  return (
    <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: ".06em", marginBottom: 8 }}>
      {text}
    </div>
  );
}

export function StatCard({ title, value, sub, sparkData, sparkColor, delay = 0, Sparkline }) {
  return (
    <div className={`card fu fu${delay}`} style={{
      background: T.card, border: `1px solid ${T.border}`,
      borderRadius: 14, padding: "18px 20px", flex: "1 1 180px",
    }}>
      <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: ".06em", marginBottom: 12 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.02em", marginBottom: 6, fontFamily: "'JetBrains Mono'" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: T.textSub }}>{sub}</div>}
      {sparkData && Sparkline && (
        <div style={{ marginTop: 12 }}>
          <Sparkline data={sparkData} color={sparkColor || T.purple} height={36} width={120} />
        </div>
      )}
    </div>
  );
}

const NAV = [
  { id: "dashboard",    icon: "⬡", label: "Dashboard" },
  { id: "budget",       icon: "◈", label: "Orçamento" },
  { id: "transactions", icon: "≡", label: "Transações" },
  { id: "new",          icon: "+", label: "Novo Lançamento" },
];

export function Sidebar({ page, setPage, email, onLogout }) {
  return (
    <div style={{
      width: 64, background: T.panel, borderRight: `1px solid ${T.border}`,
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "16px 0", position: "sticky", top: 0, height: "100vh", flexShrink: 0,
    }}>
      <div style={{ marginBottom: 28 }}><SnakeLogo size={36} /></div>
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
        {NAV.map(n => {
          const active = page === n.id;
          return (
            <button key={n.id} onClick={() => setPage(n.id)} title={n.label} style={{
              width: 42, height: 42, border: `1px solid ${active ? T.purple : "transparent"}`,
              borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
              background: active ? `${T.purple}22` : "transparent",
              color: active ? T.purpleHi : T.textMuted,
              fontSize: n.id === "new" ? 22 : 17, cursor: "pointer", transition: "all .15s",
            }}>
              {n.icon}
            </button>
          );
        })}
      </nav>
      <button onClick={onLogout} title={`Sair (${email})`} style={{
        width: 36, height: 36, borderRadius: "50%", border: `1px solid ${T.border}`,
        background: `${T.purple}33`, color: T.purpleHi, fontSize: 13, fontWeight: 600,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {email?.[0]?.toUpperCase() || "U"}
      </button>
    </div>
  );
}

export function DeleteModal({ tx, onConfirm, onCancel, loading, fmt, fmtD }) {
  if (!tx) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#00000099",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }} onClick={() => !loading && onCancel()}>
      <div style={{
        background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
        padding: 28, maxWidth: 340, width: "90%", boxShadow: "0 24px 64px #000000cc",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Apagar lançamento?</div>
        <div style={{ fontSize: 13, color: T.textSub, marginBottom: 4 }}>{tx.description || "Sem descrição"}</div>
        <div style={{ fontSize: 11, color: T.textMuted, textTransform: "capitalize", marginBottom: 16 }}>
          {tx.category} · {fmtD(tx.transaction_date)}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono'", color: T.red, marginBottom: 24 }}>
          -{fmt(tx.amount)}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} disabled={loading} style={{
            flex: 1, padding: "10px 0", border: `1px solid ${T.border}`, borderRadius: 9,
            background: "transparent", color: T.textSub, fontSize: 14, cursor: "pointer",
          }}>Cancelar</button>
          <button onClick={onConfirm} disabled={loading} style={{
            flex: 1, padding: "10px 0", border: "none", borderRadius: 9,
            background: T.red, color: "#fff", fontSize: 14, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
          }}>{loading ? "Apagando..." : "Apagar"}</button>
        </div>
      </div>
    </div>
  );
}
