import { useMemo } from "react";
import { T, fmt, fmtS, fmtD, cc } from "../constants";
import { Sparkline, Donut, BarChart, WeekChart } from "./Charts";
import { StatCard } from "./UI";

export default function Dashboard({ txs = [], income = [], loading, colors, onDeleteTx }) {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // Filtra as transações pertencentes ao mês e ano atuais
  const thisMo = useMemo(() => txs.filter(t => {
    if (!t.transaction_date) return false;
    const [year, month] = t.transaction_date.split("-");
    return parseInt(month, 10) === (now.getMonth() + 1) && parseInt(year, 10) === now.getFullYear();
  }), [txs]);

  // Usamos Math.abs para converter os valores negativos em somas positivas para os Cards e Gráficos
  const total = thisMo.reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  
  // Encontra o maior gasto tirando o sinal de menos da avaliação
  const maior = thisMo.length ? Math.max(...thisMo.map(t => Math.abs(Number(t.amount)))) : 0;

  // Receitas do mês
  const incomeMo = income.filter(i => {
    if (!i.date) return false;
    const [year, month] = i.date.split("-");
    return parseInt(month, 10) === (now.getMonth() + 1) && parseInt(year, 10) === now.getFullYear();
  });
  
  const totalIncome = incomeMo.reduce((s, i) => s + Math.abs(Number(i.amount)), 0);
  const balance = totalIncome - total;
  const hasIncome = totalIncome > 0;

  // Mapeamento por categorias (Forçando valores positivos para o gráfico Donut funcionar)
  const catMap = useMemo(() => {
    const m = {};
    thisMo.forEach(t => { 
      m[t.category] = (m[t.category] || 0) + Math.abs(Number(t.amount)); 
    });
    return m;
  }, [thisMo]);

  const catSlices = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({ label: k, v, color: cc(k, colors) }));

  // Dados do gráfico de barras dos últimos 14 dias (valores convertidos para positivos)
  const barData = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().split("T")[0];
    const v = txs.filter(t => t.transaction_date === key).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    return { label: d.getDate() % 2 === 0 || i === 13 ? String(d.getDate()) : "", v, today: i === 13 };
  }), [txs]);

  // Dados dos mini-gráficos (Sparklines) das caixas de status
  const spark7 = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return txs
      .filter(t => t.transaction_date === d.toISOString().split("T")[0])
      .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  }), [txs]);

  if (loading) {
    return (
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: 90, borderRadius: 14, background: T.card, animation: "pulse 1.5s infinite" }} />
        ))}
      </div>
    );
  }

  const DeleteBtn = ({ tx }) => (
    <button onClick={() => onDeleteTx(tx)} title="Apagar"
      style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${T.border}`, background: "transparent", color: T.textMuted, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}
      onMouseEnter={e => { e.currentTarget.style.background = `${T.red}22`; e.currentTarget.style.color = T.red; e.currentTarget.style.borderColor = T.red; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; e.currentTarget.style.borderColor = T.border; }}>
      ×
    </button>
  );

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div className="fu fu0" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: ".08em", marginBottom: 4 }}>VISÃO GERAL</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            Dashboard{" "}
            <span style={{ fontSize: 13, fontWeight: 400, color: T.textSub }}>
              — {now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: T.textMuted, background: `${T.purple}18`, border: `1px solid ${T.purple}33`, borderRadius: 20, padding: "5px 14px" }}>
          {txs.length} transações registradas
        </div>
      </div>

      {/* Balanço mensal — só aparece quando há receita registrada */}
      {hasIncome && (
        <div className="fu fu1" style={{ background: balance >= 0 ? `${T.green}12` : `${T.red}12`, border: `1px solid ${balance >= 0 ? T.green : T.red}44`, borderRadius: 14, padding: "14px 20px", display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: ".08em", marginBottom: 4 }}>RECEITAS DO MÊS</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'JetBrains Mono'", color: T.green }}>+{fmt(totalIncome)}</div>
          </div>
          <div style={{ fontSize: 22, color: T.textMuted }}>−</div>
          <div>
            <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: ".08em", marginBottom: 4 }}>GASTOS DO MÊS</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'JetBrains Mono'", color: T.red }}>-{fmt(total)}</div>
          </div>
          <div style={{ fontSize: 22, color: T.textMuted }}>=</div>
          <div>
            <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: ".08em", marginBottom: 4 }}>SALDO</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'JetBrains Mono'", color: balance >= 0 ? T.green : T.red }}>
              {balance >= 0 ? "+" : ""}{fmt(balance)}
            </div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 12, color: T.textMuted }}>
            {balance >= 0 ? "✓ Mês positivo" : "⚠ Gastos acima da receita"}
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard delay={1} title="TOTAL DO MÊS" value={fmt(total)} sub={`${thisMo.length} transações`} sparkData={spark7} sparkColor={T.green} Sparkline={Sparkline} />
        <StatCard delay={2} title="MAIOR GASTO" value={fmt(maior)} sub="este mês" sparkData={spark7.map(v => v * 0.6)} sparkColor={T.purpleHi} Sparkline={Sparkline} />
        <StatCard delay={3} title="CATEGORIAS" value={Object.keys(catMap).length} sub="distintas" sparkData={spark7.map((_, i) => i + 1)} sparkColor={T.cyan} Sparkline={Sparkline} />
        <StatCard delay={4} title="MÉDIA DIÁRIA" value={fmt(total / daysInMonth)} sub="estimativa mensal" sparkData={spark7} sparkColor={T.amber} Sparkline={Sparkline} />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12 }}>
        <div className="card fu fu2" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: ".06em", marginBottom: 6 }}>GASTOS POR DIA</div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'JetBrains Mono'", letterSpacing: "-.03em" }}>{fmt(total)}</div>
              <div style={{ fontSize: 12, color: T.textSub, marginTop: 2 }}>acumulado no mês</div>
            </div>
            <div style={{ fontSize: 11, color: T.green, background: `${T.green}18`, padding: "4px 10px", borderRadius: 20, fontWeight: 600 }}>14 dias</div>
          </div>
          <div style={{ marginTop: 20 }}><BarChart data={barData} height={88} /></div>
        </div>

        <div className="card fu fu3" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: ".06em", marginBottom: 16 }}>TOP CATEGORIAS</div>
          {catSlices.length === 0 ? (
            <div style={{ color: T.textMuted, fontSize: 13, textAlign: "center", padding: 40 }}>Nenhum dado ainda</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ position: "relative" }}>
                <Donut slices={catSlices} size={130} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 10, color: T.textMuted }}>TOTAL</div>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono'" }}>{fmtS(total)}</div>
                </div>
              </div>
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 7 }}>
                {catSlices.slice(0, 4).map(s => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                      <span style={{ fontSize: 12, color: T.textSub, textTransform: "capitalize" }}>{s.label}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono'" }}>{fmtS(s.v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="card fu fu4" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: ".06em" }}>GASTOS POR DIA DA SEMANA</div>
            <div style={{ fontSize: 10, color: T.textMuted }}>histórico completo</div>
          </div>
          <WeekChart txs={txs} />
        </div>

        <div className="card fu fu5" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: ".06em", marginBottom: 14 }}>LANÇAMENTOS RECENTES</div>
          {txs.slice(0, 5).map((t, i) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < 4 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: `${cc(t.category, colors)}18`, border: `1px solid ${cc(t.category, colors)}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: cc(t.category, colors) }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description || "—"}</div>
                <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2, textTransform: "capitalize" }}>{t.category} · {fmtD(t.transaction_date)}</div>
              </div>
              {/* Exibe o valor de forma limpa na listagem de recentes */}
              <div style={{ fontSize: 13, fontWeight: 600, color: T.red, fontFamily: "'JetBrains Mono'", flexShrink: 0 }}>-{fmtS(Math.abs(t.amount))}</div>
              <DeleteBtn tx={t} />
            </div>
          ))}
          {txs.length === 0 && <div style={{ textAlign: "center", color: T.textMuted, fontSize: 12, padding: "24px 0" }}>Nenhum lançamento ainda</div>}
        </div>
      </div>
    </div>
  );
}