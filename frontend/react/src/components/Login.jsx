import { useState } from "react";
import { T } from "../constants";
import SnakeLogo from "./SnakeLogo";
import { Alert, Label } from "./UI";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Login({ onLogin }) {
  const [tab, setTab]       = useState("login");
  const [email, setEmail]   = useState("");
  const [pass, setPass]     = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]       = useState({ type: "", text: "" });

  const inp = {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    background: T.bg, border: `1px solid ${T.border}`,
    color: T.text, fontSize: 14, outline: "none",
  };

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const body = tab === "login"
        ? { email, password: pass }
        : { email, password: pass, whatsapp_number: "00000000000" };
      const r = await fetch(`${API_URL}/api/v1/users/${tab === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (r.ok) {
        if (tab === "login") onLogin(d.access_token, email);
        else { setMsg({ type: "ok", text: "Conta criada! Faça login." }); setTab("login"); }
      } else {
        setMsg({ type: "err", text: d.detail || "Erro ao processar" });
      }
    } catch {
      setMsg({ type: "err", text: "Erro de conexão com o servidor" });
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: T.bg,
      backgroundImage: `radial-gradient(ellipse at 60% 20%,${T.purpleDim}44 0%,transparent 60%)`,
    }}>
      <div className="si" style={{ width: "100%", maxWidth: 400, padding: 24 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <SnakeLogo size={44} animate />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.03em", lineHeight: 1 }}>
                Snake<span style={{ color: T.green }}>Fin</span>
              </div>
              <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: ".06em" }}>CONTROLE FINANCEIRO</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: T.textSub }}>Controle total das suas finanças pessoais</p>
        </div>

        <div style={{
          background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28,
          boxShadow: `0 0 0 1px ${T.purple}22, 0 32px 64px #00000088`,
        }}>
          <div style={{ display: "flex", background: T.bg, borderRadius: 9, padding: 3, marginBottom: 24 }}>
            {[["login", "Entrar"], ["register", "Criar conta"]].map(([id, label]) => (
              <button key={id} onClick={() => { setTab(id); setMsg({ type: "", text: "" }); }} style={{
                flex: 1, padding: "8px 0", border: "none", borderRadius: 7,
                background: tab === id ? T.purple : "transparent",
                color: tab === id ? "#fff" : T.textMuted,
                fontSize: 13, fontWeight: tab === id ? 600 : 400, cursor: "pointer", transition: "all .2s",
              }}>{label}</button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <Label text="EMAIL" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="seu@email.com" style={inp}
                onFocus={e => e.target.style.borderColor = T.purple}
                onBlur={e => e.target.style.borderColor = T.border} />
            </div>
            <div>
              <Label text="SENHA" />
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} required
                placeholder="••••••••" style={inp}
                onFocus={e => e.target.style.borderColor = T.purple}
                onBlur={e => e.target.style.borderColor = T.border} />
            </div>
            <Alert type={msg.type} text={msg.text} />
            <button type="submit" disabled={loading} style={{
              padding: "13px 0", border: "none", borderRadius: 10, marginTop: 4,
              background: `linear-gradient(135deg,${T.purple},${T.purpleHi})`,
              color: "#fff", fontSize: 15, fontWeight: 600,
              opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer",
              boxShadow: `0 4px 20px ${T.purple}55`,
            }}>
              {loading ? "Aguarde..." : tab === "login" ? "Entrar →" : "Criar conta →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
