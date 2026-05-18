import { useMemo } from "react";
import { T, fmt, fmtS } from "../constants";

export function Sparkline({ data, color, height = 40, width = 120 }) {
  if (!data || data.length < 2) return <div style={{ height }} />;
  const max = Math.max(...data, 1), min = Math.min(...data), range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4) - 2}`)
    .join(" ");
  const [lx, ly] = pts.split(" ").pop().split(",");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="3" fill={color} />
    </svg>
  );
}

export function Donut({ slices, size = 144 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.36, stroke = size * 0.09;
  const total = slices.reduce((s, d) => s + d.v, 0) || 1;
  const circ = 2 * Math.PI * r;
  let off = circ * 0.25;
  const arcs = slices.map(d => {
    const dash = (d.v / total) * circ, gap = circ - dash;
    const a = { ...d, dash, gap, offset: -off }; off -= dash; return a;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth={stroke + 2} />
      {arcs.map((a, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={a.color} strokeWidth={stroke}
          strokeDasharray={`${a.dash} ${a.gap}`} strokeDashoffset={a.offset}
          style={{ transition: "stroke-dasharray .6s ease" }} />
      ))}
    </svg>
  );
}

export function BarChart({ data, height = 100 }) {
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height, padding: "0 2px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
            <div style={{
              width: "100%", height: `${Math.max((d.v / max) * 86, 3)}%`,
              background: d.today
                ? `linear-gradient(180deg,${T.purpleHi},${T.purple})`
                : `${T.purple}44`,
              borderRadius: "3px 3px 0 0", transformOrigin: "bottom",
              animation: `barGrow .5s ease ${i * 0.04}s both`,
            }} />
          </div>
          <span style={{ fontSize: 10, color: d.today ? T.purpleHi : T.textMuted, fontWeight: d.today ? 600 : 400 }}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function WeekChart({ txs }) {
  const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const data = useMemo(() => {
    const totals = Array(7).fill(0);
    const counts = Array(7).fill(0);
    txs.forEach(t => {
      const dow = new Date(t.transaction_date + "T12:00:00").getDay();
      totals[dow] += Number(t.amount);
      counts[dow]++;
    });
    return DAYS.map((label, i) => ({ label, total: totals[i], count: counts[i] }));
  }, [txs]);

  const max = Math.max(...data.map(d => d.total), 1);
  const totalGeral = data.reduce((s, d) => s + d.total, 0);
  const topDay = data.reduce((a, b) => b.total > a.total ? b : a, data[0]);

  if (totalGeral === 0) {
    return (
      <div style={{ textAlign: "center", color: T.textMuted, fontSize: 12, padding: "32px 0" }}>
        Nenhum dado ainda — registre gastos para ver o padrão semanal
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 2 }}>DIA QUE MAIS GASTA</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.purpleHi }}>{topDay.label}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 2 }}>TOTAL NO PERÍODO</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{fmt(totalGeral)}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100 }}>
        {data.map((d, i) => {
          const pct = (d.total / max) * 84;
          const isTop = d.label === topDay.label && d.total > 0;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", width: "100%" }}
                title={d.total > 0 ? `${d.label}: ${fmt(d.total)} (${d.count} lançamento${d.count !== 1 ? "s" : ""})` : d.label}>
                {d.total > 0 && (
                  <div style={{ fontSize: 9, color: isTop ? T.purpleHi : T.textMuted, textAlign: "center", marginBottom: 3, fontFamily: "'JetBrains Mono'", fontWeight: isTop ? 600 : 400 }}>
                    {fmtS(d.total)}
                  </div>
                )}
                <div style={{
                  width: "100%",
                  height: d.total > 0 ? `${Math.max(pct, 6)}%` : "3%",
                  background: isTop
                    ? `linear-gradient(180deg,${T.purpleHi},${T.purple})`
                    : d.total > 0 ? `${T.purple}55` : T.border,
                  borderRadius: "3px 3px 0 0", transition: "height .5s ease",
                }} />
              </div>
              <span style={{ fontSize: 10, color: isTop ? T.purpleHi : T.textMuted, fontWeight: isTop ? 600 : 400 }}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
