import { useState, useMemo } from "react";
import { T, fmt, fmtD, cc, DEFAULT_BUDGETS } from "../constants";

export default function Budget({ txs, cats, colors }) {
  const [budgets, setBudgets] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sf_budgets") || "{}"); } catch { return {}; }
  });
  const [editing, setEditing]   = useState(null);
  const [editVal, setEditVal]   = useState("");
  const [expanded, setExpanded] = useState(null);

  const getBudget = cat => budgets[cat] ?? DEFAULT_BUDGETS[cat] ?? 200;

  function saveEdit(cat) {
    const val = parseFloat(editVal);
    if (!isNaN(val) && val > 0) {
      const nb = { ...budgets, [cat]: val };
      setBudgets(nb);
      localStorage.setItem("sf_budgets", JSON.stringify(nb));
    }
    setEditing(null);
  }

  const now = new Date();

  const thisMo = useMemo(() => txs.filter(t => {
    const d = new Date(t.transaction_date + "T12:00:00");
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }), [txs]);

  const spent = useMemo(() => {
    const m = {};
    thisMo.forEach(t => { m[t.category] = (m[t.category] || 0) + Number(t.amount); });
    return m;
  }, [thisMo]);

  const catDetails = useMemo(() => {
    const m = {};
    txs.forEach(t => { if (!m[t.category]) m[t.category] = []; m[t.category].push(t); });
    return m;
  }, [txs]);

  return (
    <div style={{ padding: "20px 24px" }}>
      <div className="fu fu0" style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: ".08em", marginBottom: 4 }}>CONTROLE</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Orçamento Mensal</div>
        <div style={{ fontSize: 13, color: T.textSub, marginTop: 4 }}>
          Clique no limite para editar · Clique na categoria para ver detalhes
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12, marginTop: 20 }}>
        {cats.map((cat, i) => {
          const s = spent[cat] || 0, b = getBudget(cat);
          const pct = Math.min((s / b) * 100, 100), over = s > b;
          const items = catDetails[cat] || [], isExp = expanded === cat;
          return (
            <div key={cat} className={`fu fu${i % 4}`} style={{
              background: T.card,
              border: `1px solid ${over ? T.red + "55" : isExp ? T.purple + "55" : T.border}`,
              borderRadius: 14, padding: "16px 18px", transition: "border-color .2s",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                  onClick={() => setExpanded(isExp ? null : cat)}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: cc(cat, colors), boxShadow: `0 0 6px ${cc(cat, colors)}` }} />
                  <span style={{ fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>{cat}</span>
                  {items.length > 0 && <span style={{ fontSize: 10, color: T.textMuted }}>({items.length})</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {over && <span style={{ fontSize: 10, color: T.red, background: `${T.red}18`, padding: "2px 7px", borderRadius: 10, fontWeight: 600 }}>EXCEDIDO</span>}
                  <span style={{ fontSize: 10, color: T.textMuted }}>{isExp ? "▲" : items.length > 0 ? "▼" : ""}</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 2 }}>GASTO</div>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono'", color: over ? T.red : T.text }}>{fmt(s)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 2 }}>LIMITE</div>
                  {editing === cat ? (
                    <input autoFocus type="number" value={editVal} onChange={e => setEditVal(e.target.value)}
                      onBlur={() => saveEdit(cat)}
                      onKeyDown={e => { if (e.key === "Enter") saveEdit(cat); if (e.key === "Escape") setEditing(null); }}
                      style={{ width: 80, padding: "2px 6px", borderRadius: 6, background: T.bg, border: `1px solid ${T.purple}`, color: T.text, fontSize: 13, fontFamily: "'JetBrains Mono'", outline: "none", textAlign: "right" }} />
                  ) : (
                    <div onClick={() => { setEditing(cat); setEditVal(String(b)); }} title="Clique para editar"
                      style={{ fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono'", color: T.textSub, cursor: "pointer", borderBottom: `1px dashed ${T.border}` }}>
                      {fmt(b)}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ height: 5, background: T.border, borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: over ? T.red : pct > 80 ? T.amber : cc(cat, colors), borderRadius: 3, transition: "width .6s ease" }} />
              </div>
              <div style={{ fontSize: 10, color: T.textMuted, textAlign: "right", marginBottom: isExp && items.length > 0 ? 12 : 0 }}>
                {Math.round(pct)}% utilizado · restam {fmt(Math.max(b - s, 0))}
              </div>

              {isExp && items.length > 0 && (
                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                  {[...items].sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)).slice(0, 5).map((t, j) => (
                    <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{t.description || "—"}</div>
                        <div style={{ fontSize: 10, color: T.textMuted }}>{fmtD(t.transaction_date)}</div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.red, fontFamily: "'JetBrains Mono'" }}>{fmt(t.amount)}</div>
                    </div>
                  ))}
                  {items.length > 5 && <div style={{ fontSize: 10, color: T.textMuted, textAlign: "center" }}>+{items.length - 5} mais</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
