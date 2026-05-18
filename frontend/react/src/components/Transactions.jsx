import { useState, useMemo } from "react";
import { T, fmt, fmtD, cc } from "../constants";

export default function Transactions({ txs, cats, colors, onDeleteTx }) {
  const [search, setSearch] = useState("");
  const [cat, setCat]       = useState("todas");

  const filtered = useMemo(() => txs.filter(t =>
    (cat === "todas" || t.category === cat) &&
    (!search || (t.description || "").toLowerCase().includes(search.toLowerCase()))
  ), [txs, search, cat]);

  const total = filtered.reduce((s, t) => s + Number(t.amount), 0);

  const DeleteBtn = ({ tx }) => (
    <button onClick={() => onDeleteTx(tx)} title="Apagar"
      style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${T.border}`, background: "transparent", color: T.textMuted, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}
      onMouseEnter={e => { e.currentTarget.style.background = `${T.red}22`; e.currentTarget.style.color = T.red; e.currentTarget.style.borderColor = T.red; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; e.currentTarget.style.borderColor = T.border; }}>
      ×
    </button>
  );

  return (
    <div style={{ padding: "20px 24px" }}>
      <div className="fu fu0" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: ".08em", marginBottom: 4 }}>HISTÓRICO</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Transações</div>
      </div>

      <div className="fu fu1" style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por descrição..."
          style={{ flex: "1 1 180px", padding: "9px 14px", borderRadius: 9, background: T.card, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, outline: "none" }}
          onFocus={e => e.target.style.borderColor = T.purple}
          onBlur={e => e.target.style.borderColor = T.border} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["todas", ...cats].map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: "7px 12px", borderRadius: 20,
              border: `1px solid ${cat === c ? cc(c, colors) : T.border}`,
              background: cat === c ? `${cc(c, colors)}18` : "transparent",
              color: cat === c ? cc(c, colors) : T.textMuted,
              fontSize: 11, fontWeight: cat === c ? 600 : 400,
              textTransform: "capitalize", cursor: "pointer", transition: "all .15s",
            }}>{c}</button>
          ))}
        </div>
      </div>

      <div className="fu fu2" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: T.textMuted }}>{filtered.length} lançamentos</span>
          <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono'", color: T.red }}>-{fmt(total)}</span>
        </div>
        {filtered.map((t, i) => (
          <div key={t.id} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 18px",
            borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
            transition: "background .15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = T.cardHover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: cc(t.category, colors), flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{t.description || "—"}</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2, textTransform: "capitalize" }}>{t.category}</div>
            </div>
            <div style={{ fontSize: 12, color: T.textMuted }}>{fmtD(t.transaction_date)}</div>
            <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono'", color: T.red, minWidth: 70, textAlign: "right" }}>
              -{fmt(t.amount)}
            </div>
            <DeleteBtn tx={t} />
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: T.textMuted, padding: 40, fontSize: 13 }}>
            Nenhum lançamento encontrado
          </div>
        )}
      </div>
    </div>
  );
}
