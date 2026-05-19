import { useState, useCallback } from "react";
import { T, fmt, today, decodeToken, INCOME_TYPES, INCOME_COLOR } from "../constants";
import { Alert, Label } from "./UI";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Salva e carrega receitas no localStorage por usuário
function storageKey(userId) { return `sf_income_${userId}`; }

export function loadIncome(token) {
  try {
    const userId = decodeToken(token);
    if (!userId) return [];
    return JSON.parse(localStorage.getItem(storageKey(userId)) || "[]");
  } catch { return []; }
}

export function saveIncome(token, entries) {
  const userId = decodeToken(token);
  if (!userId) return;
  localStorage.setItem(storageKey(userId), JSON.stringify(entries));
}

// ── COMPONENTE ────────────────────────────────────────────────────────────────
export default function Income({ income, onSaved, onDelete }) {
  const [form, setForm]   = useState({ amount: "", type: INCOME_TYPES[0], description: "", date: today() });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]     = useState({ type: "", text: "" });

  const setField = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), []);

  const inp = {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    background: T.bg, border: `1px solid ${T.border}`,
    color: T.text, fontSize: 15, outline: "none", fontFamily: "inherit",
  };

  function handleAmount(e) {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) { setField("amount", ""); return; }
    setField("amount", (parseInt(raw, 10) / 100).toFixed(2));
  }

  const displayAmount = val =>
    val ? Number(val).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount) { setMsg({ type: "err", text: "Informe o valor" }); return; }
    setLoading(true);
    const entry = {
      id: crypto.randomUUID(),
      amount: parseFloat(form.amount),
      type: form.type,
      description: form.description || form.type,
      date: form.date,
      created_at: new Date().toISOString(),
    };
    onSaved(entry);
    setForm({ amount: "", type: INCOME_TYPES[0], description: "", date: today() });
    setMsg({ type: "ok", text: `✓ Receita de ${fmt(entry.amount)} registrada!` });
    setLoading(false);
  }

  const total = income.reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div style={{ padding: "20px 24px" }}>
      <div className="fu fu0" style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: ".08em", marginBottom: 4 }}>ENTRADAS</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Receitas</div>
        <div style={{ fontSize: 13, color: T.textSub, marginTop: 4 }}>Registre salários, freelances e outras entradas</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Formulário */}
        <form className="fu fu1" onSubmit={handleSubmit} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 18, alignSelf: "start" }}>
          <div>
            <Label text="VALOR RECEBIDO (R$)" />
            <input type="text" inputMode="numeric" value={displayAmount(form.amount)}
              onChange={handleAmount} placeholder="0,00" required
              style={{ ...inp, fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono'", color: INCOME_COLOR }}
              onFocus={e => e.target.style.borderColor = INCOME_COLOR}
              onBlur={e => e.target.style.borderColor = T.border} />
          </div>

          <div>
            <Label text="TIPO DE RECEITA" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {INCOME_TYPES.map(t => (
                <button type="button" key={t} onClick={() => setField("type", t)} style={{
                  padding: "7px 13px", borderRadius: 20, textTransform: "capitalize",
                  border: `1px solid ${form.type === t ? INCOME_COLOR : T.border}`,
                  background: form.type === t ? `${INCOME_COLOR}18` : "transparent",
                  color: form.type === t ? INCOME_COLOR : T.textMuted,
                  fontSize: 12, fontWeight: form.type === t ? 600 : 400, cursor: "pointer", transition: "all .15s",
                }}>{t}</button>
              ))}
            </div>
          </div>

          <div>
            <Label text="DESCRIÇÃO (opcional)" />
            <input type="text" value={form.description} onChange={e => setField("description", e.target.value)}
              placeholder="Ex: salário de maio, projeto X..." style={inp}
              onFocus={e => e.target.style.borderColor = INCOME_COLOR}
              onBlur={e => e.target.style.borderColor = T.border} />
          </div>

          <div>
            <Label text="DATA" />
            <input type="date" value={form.date} onChange={e => setField("date", e.target.value)}
              style={{ ...inp, colorScheme: "dark" }} />
          </div>

          <Alert type={msg.type} text={msg.text} />

          <button type="submit" disabled={loading} style={{
            padding: "14px 0", border: "none", borderRadius: 10,
            background: `linear-gradient(135deg,${INCOME_COLOR},#00c853)`,
            color: T.bg, fontSize: 15, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
            boxShadow: `0 4px 18px ${INCOME_COLOR}44`,
          }}>
            {loading ? "Salvando..." : "Registrar receita →"}
          </button>
        </form>

        {/* Histórico */}
        <div className="fu fu2" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Total */}
          <div style={{ background: T.card, border: `1px solid ${INCOME_COLOR}44`, borderRadius: 14, padding: "16px 20px" }}>
            <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: ".06em", marginBottom: 6 }}>TOTAL DE RECEITAS</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'JetBrains Mono'", color: INCOME_COLOR }}>{fmt(total)}</div>
            <div style={{ fontSize: 12, color: T.textSub, marginTop: 4 }}>{income.length} entrada{income.length !== 1 ? "s" : ""} registrada{income.length !== 1 ? "s" : ""}</div>
          </div>

          {/* Lista */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, fontSize: 11, color: T.textMuted, letterSpacing: ".06em" }}>
              HISTÓRICO
            </div>
            {income.length === 0 ? (
              <div style={{ textAlign: "center", color: T.textMuted, fontSize: 12, padding: "32px 0" }}>
                Nenhuma receita registrada ainda
              </div>
            ) : (
              [...income].sort((a, b) => new Date(b.date) - new Date(a.date)).map((item, i) => (
                <div key={item.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "11px 16px",
                  borderBottom: i < income.length - 1 ? `1px solid ${T.border}` : "none",
                  transition: "background .15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = T.cardHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: INCOME_COLOR, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{item.description}</div>
                    <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2, textTransform: "capitalize" }}>
                      {item.type} · {new Date(item.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono'", color: INCOME_COLOR }}>
                    +{fmt(item.amount)}
                  </div>
                  <button onClick={() => onDelete(item.id)} title="Remover"
                    style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${T.border}`, background: "transparent", color: T.textMuted, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${T.red}22`; e.currentTarget.style.color = T.red; e.currentTarget.style.borderColor = T.red; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; e.currentTarget.style.borderColor = T.border; }}>
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
