import { useState, useCallback } from "react";
import { T, fmt, today, cc, detectCat, decodeToken, BASE_CATS, PALETTE, saveCats, norm } from "../constants";
import { Alert, Label } from "./UI";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function NewTransaction({ onSaved, cats, setCats, colors, setColors }) {
  const [form, setForm]         = useState({ amount: "", description: "", category: cats[0], date: today() });
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState({ type: "", text: "" });
  const [catDetected, setCatDet] = useState(null);
  const [showNewCat, setShowNew] = useState(false);
  const [newCatName, setNewName] = useState("");
  const [newCatColor, setNewClr] = useState(PALETTE[0]);

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

  function handleDesc(e) {
    const desc = e.target.value;
    const detected = detectCat(desc, cats);
    setForm(f => ({ ...f, description: desc, ...(detected ? { category: detected } : {}) }));
    setCatDet(detected);
  }

  function addCat() {
    const name = newCatName.toLowerCase().trim();
    if (!name || cats.includes(name)) { setMsg({ type: "err", text: "Nome inválido ou já existe" }); return; }
    const newCats   = [...cats.filter(c => c !== "outros"), name, "outros"];
    const newColors = { ...colors, [name]: newCatColor };
    setCats(newCats); setColors(newColors); saveCats(newCats, newColors);
    setField("category", name);
    setShowNew(false); setNewName(""); setNewClr(PALETTE[0]);
  }

  function removeCat(name) {
    if (BASE_CATS.includes(name)) return;
    const newCats   = cats.filter(c => c !== name);
    const newColors = { ...colors }; delete newColors[name];
    setCats(newCats); setColors(newColors); saveCats(newCats, newColors);
    if (form.category === name) setField("category", newCats[0]);
  }

  const displayAmount = val =>
    val ? Number(val).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";

  async function submit(e) {
    e.preventDefault();
    if (!form.amount || !form.description) { setMsg({ type: "err", text: "Preencha todos os campos" }); return; }
    setLoading(true); setMsg({ type: "", text: "" });
    try {
      const userId = decodeToken(localStorage.getItem("sf_token") || "");
      if (!userId) { setMsg({ type: "err", text: "Sessão expirada. Faça login novamente." }); return; }

      const r = await fetch(`${API_URL}/api/v1/transactions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          // Garante que o valor enviado para a API seja sempre negativo (Despesa)
          amount: -Math.abs(parseFloat(form.amount)),
          category: form.category,
          description: form.description,
          transaction_date: form.date,
          source: "dashboard",
        }),
      });
      const d = await r.json();
      if (d.action === "saved") {
        setMsg({ type: "ok", text: `✓ Salvo! ${fmt(form.amount)} em ${form.category}` });
        setForm({ amount: "", description: "", category: cats[0], date: today() });
        setCatDet(null); onSaved();
      } else {
        setMsg({ type: "err", text: d.detail || "Erro ao salvar" });
      }
    } catch { setMsg({ type: "err", text: "Erro de conexão com o servidor" }); }
    setLoading(false);
  }

  return (
    <div style={{ padding: "20px 24px", maxWidth: 540 }}>
      <div className="fu fu0" style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: ".08em", marginBottom: 4 }}>REGISTRAR</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Novo Lançamento</div>
        <div style={{ fontSize: 13, color: T.textSub, marginTop: 4 }}>Adicione uma despesa manualmente</div>
      </div>

      <form className="fu fu1" onSubmit={submit} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Valor */}
        <div>
          <Label text="VALOR (R$)" />
          <input type="text" inputMode="numeric" value={displayAmount(form.amount)}
            onChange={handleAmount} placeholder="0,00" required
            style={{ ...inp, fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono'" }}
            onFocus={e => e.target.style.borderColor = T.purple}
            onBlur={e => e.target.style.borderColor = T.border} />
          <div style={{ fontSize: 10, color: T.textMuted, marginTop: 4 }}>Digite apenas os dígitos — vírgula inserida automaticamente</div>
        </div>

        {/* Descrição */}
        <div>
          <Label text="DESCRIÇÃO" />
          <input type="text" value={form.description} onChange={handleDesc}
            placeholder="Ex: remédio, mercado, aluguel, uber..." required style={inp}
            onFocus={e => e.target.style.borderColor = T.purple}
            onBlur={e => e.target.style.borderColor = T.border} />
          {catDetected && (
            <div style={{ fontSize: 11, color: T.green, marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}>
              <span>✦</span>
              <span>Categoria detectada: <strong style={{ textTransform: "capitalize" }}>{catDetected}</strong></span>
            </div>
          )}
        </div>

        {/* Categoria */}
        <div>
          <Label text="CATEGORIA" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 8 }}>
            {cats.map(c => (
              <div key={c} style={{ position: "relative", display: "inline-flex" }}>
                <button type="button" onClick={() => setField("category", c)} style={{
                  padding: `7px ${!BASE_CATS.includes(c) ? "22px" : "13px"} 7px 13px`,
                  borderRadius: 20,
                  border: `1px solid ${form.category === c ? cc(c, colors) : T.border}`,
                  background: form.category === c ? `${cc(c, colors)}18` : "transparent",
                  color: form.category === c ? cc(c, colors) : T.textMuted,
                  fontSize: 12, fontWeight: form.category === c ? 600 : 400,
                  textTransform: "capitalize", cursor: "pointer", transition: "all .15s",
                }}>{c}</button>
                {!BASE_CATS.includes(c) && (
                  <button type="button" onClick={() => removeCat(c)} style={{
                    position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)",
                    width: 14, height: 14, borderRadius: "50%", border: "none",
                    background: `${T.red}44`, color: T.red, fontSize: 10, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
                  }}>×</button>
                )}
              </div>
            ))}
          </div>

          {!showNewCat ? (
            <button type="button" onClick={() => setShowNew(true)} style={{
              fontSize: 11, color: T.purple, background: "transparent",
              border: `1px dashed ${T.purple}`, borderRadius: 20, padding: "4px 12px", cursor: "pointer",
            }}>{+ Nova categoria}</button>
          ) : (
            <div style={{ background: T.bg, borderRadius: 10, padding: 12, border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 10 }}>
              <input autoFocus value={newCatName} onChange={e => setNewName(e.target.value)}
                placeholder="nome da categoria" maxLength={20}
                style={{ padding: "8px 12px", borderRadius: 8, background: T.card, border: `1px solid ${T.purple}`, color: T.text, fontSize: 13, outline: "none" }}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCat(); } if (e.key === "Escape") setShowNew(false); }} />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {PALETTE.map(clr => (
                  <div key={clr} onClick={() => setNewClr(clr)} style={{
                    width: 22, height: 22, borderRadius: "50%", background: clr, cursor: "pointer",
                    border: newCatColor === clr ? "2px solid #fff" : "2px solid transparent", transition: "all .15s",
                  }} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={addCat} style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: 8, background: T.purple, color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                  Adicionar
                </button>
                <button type="button" onClick={() => { setShowNew(false); setNewName(""); }} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.textMuted, fontSize: 13, cursor: "pointer" }}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Data */}
        <div>
          <Label text="DATA" />
          <input type="date" value={form.date} onChange={e => setField("date", e.target.value)} style={{ ...inp, colorScheme: "dark" }} />
        </div>

        <Alert type={msg.type} text={msg.text} />

        <button type="submit" disabled={loading} style={{
          padding: "14px 0", border: "none", borderRadius: 10,
          background: `linear-gradient(135deg,${T.purple},${T.purpleHi})`,
          color: "#fff", fontSize: 15, fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
          boxShadow: `0 4px 18px ${T.purple}44`, transition: "opacity .15s",
        }}>
          {loading ? "Salvando..." : "Salvar lançamento →"}
        </button>
      </form>
    </div>
  );
}