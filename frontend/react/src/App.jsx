import { useState, useEffect, useCallback, useMemo } from "react";

const API_URL = "http://localhost:8000";

// ── TEMA ──────────────────────────────────────────────────────────────────────
const T = {
  bg:"#0d0d14",panel:"#13131e",card:"#1a1a28",cardHover:"#1f1f30",
  border:"#252538",borderHi:"#353558",
  purple:"#7c3aed",purpleHi:"#9d5ff5",purpleDim:"#3d1f7a",
  green:"#00e676",red:"#ef5350",cyan:"#00bcd4",amber:"#ffb300",
  text:"#eeeef8",textSub:"#9090b8",textMuted:"#505070",
};

// ── CATEGORIAS ────────────────────────────────────────────────────────────────
const BASE_CATS = ["alimentação","transporte","moradia","saúde","lazer","educação","vestuário","outros"];
const BASE_COLORS = {
  alimentação:"#00e676",transporte:"#7c3aed",moradia:"#00bcd4",
  saúde:"#ef5350",lazer:"#ffb300",educação:"#4fc3f7",
  vestuário:"#f48fb1",outros:"#78909c",
};
const PALETTE = ["#e040fb","#00e5ff","#69f0ae","#ff6d00","#40c4ff","#f50057","#76ff03","#ffd740","#b0bec5","#ff4081"];
const DEFAULT_BUDGETS = {alimentação:600,transporte:300,moradia:1500,saúde:400,lazer:200,educação:300,vestuário:200,outros:100};

function loadCats() {
  try {
    const c = JSON.parse(localStorage.getItem("sf_cats")||"null");
    const clr = JSON.parse(localStorage.getItem("sf_cat_colors")||"null");
    return { cats: c || [...BASE_CATS], colors: clr || {...BASE_COLORS} };
  } catch { return { cats:[...BASE_CATS], colors:{...BASE_COLORS} }; }
}
function saveCats(cats, colors) {
  localStorage.setItem("sf_cats", JSON.stringify(cats));
  localStorage.setItem("sf_cat_colors", JSON.stringify(colors));
}

// ── UTILITÁRIOS ───────────────────────────────────────────────────────────────
const fmt = n => `R$${Number(n).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const fmtS = n => { n=Number(n); return n>=1000?`R$${(n/1000).toFixed(1)}k`:`R$${n.toFixed(0)}`; };
const fmtD = d => new Date(d+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"short"});
const today = () => new Date().toISOString().split("T")[0];

function cc(cat, colors) { return (colors||{})[cat] || "#78909c"; }

function detectCat(desc, cats, colors) {
  if (!desc || desc.length < 2) return null;
  const KEYWORDS = {
    alimentação:["ifood","rappi","mercado","supermercado","padaria","restaurante","lanche","pizza","hamburguer","feira","comida","almoço","jantar","café","hortifruti","refeição","sushi","delivery","mcdonalds","subway","churrasco","bebida","boteco","sorvete"],
    transporte:["uber","99","cabify","taxi","ônibus","metro","trem","gasolina","etanol","diesel","estacionamento","pedágio","multa","ipva","oficina","moto","bicicleta","passagem"],
    moradia:["aluguel","condominio","luz","energia","agua","gás","internet","telefone","netflix","spotify","amazon","disney","celular","fatura","iptu","reforma","pintura","encanador","eletricista","móveis","decoração"],
    saúde:["remedio","remédio","farmácia","farmacia","droga","ultrafarma","panvel","drogasil","hospital","clinica","médico","consulta","exame","dentista","psicólogo","terapia","academia","gym","smartfit","suplemento","vitamina","whey"],
    lazer:["cinema","teatro","show","ingresso","jogo","game","steam","playstation","xbox","viagem","hotel","airbnb","booking","latam","gol","azul","parque","passeio","balada","festa"],
    educação:["escola","faculdade","universidade","curso","udemy","alura","livro","livraria","papelaria","mensalidade","inglês","idioma","certificado","treinamento"],
    vestuário:["roupa","vestuario","vestuário","calçado","sapato","tenis","tênis","camisa","calça","vestido","shorts","bermuda","jaqueta","casaco","zara","renner","riachuelo","shein","nike","adidas"],
    investimento:["investimento","ações","fundos","tesouro","cripto","bitcoin","corretora","xp","clear","btg","rico"],
  };
  const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const d = norm(desc);
  for (const cat of cats) {
    const words = KEYWORDS[cat] || [];
    if (words.some(w => d.includes(norm(w)))) return cat;
  }
  return null;
}

function decodeToken(token) {
  try {
    const p = JSON.parse(atob(token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));
    return p.sub || "";
  } catch { return ""; }
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%}
body{background:${T.bg};color:${T.text};font-family:'DM Sans',sans-serif;font-size:14px}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px}
input,select,button{font-family:inherit}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
@keyframes snakeDraw{from{stroke-dashoffset:300}to{stroke-dashoffset:0}}
@keyframes barGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.fu{animation:fadeUp .4s ease both}
.fu0{animation-delay:0s}.fu1{animation-delay:.07s}.fu2{animation-delay:.14s}
.fu3{animation-delay:.21s}.fu4{animation-delay:.28s}.fu5{animation-delay:.35s}
.si{animation:scaleIn .35s ease both}
.card{transition:background .15s,border-color .15s}
.card:hover{background:${T.cardHover}!important;border-color:${T.borderHi}!important}
`;

// ── COMPONENTES BASE ──────────────────────────────────────────────────────────
function SnakeLogo({ size=32, animate=false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M12 48 C12 36,28 36,28 28 C28 20,44 20,44 12" stroke={T.green} strokeWidth="6" strokeLinecap="round"
        strokeDasharray="300" strokeDashoffset={animate?"300":"0"}
        style={animate?{animation:"snakeDraw 1.5s ease forwards"}:{}}/>
      <path d="M44 12 C44 4,56 4,56 12 C56 20,44 20,44 28 C44 36,56 36,56 44" stroke={T.green} strokeWidth="6" strokeLinecap="round"
        strokeDasharray="300" strokeDashoffset={animate?"300":"0"}
        style={animate?{animation:"snakeDraw 1.5s .2s ease forwards"}:{}}/>
      <ellipse cx="53" cy="48" rx="7" ry="5" fill={T.green}/>
      <circle cx="56" cy="46" r="1.5" fill={T.bg}/>
      <path d="M46 48 L42 47 M42 47 L40 45 M42 47 L40 49" stroke={T.green} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function Sparkline({ data, color, height=40, width=120 }) {
  if (!data||data.length<2) return <div style={{height}}/>;
  const max=Math.max(...data,1),min=Math.min(...data),range=max-min||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*width},${height-((v-min)/range)*(height-4)-2}`).join(" ");
  const [lx,ly]=pts.split(" ").pop().split(",");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{overflow:"visible"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx={lx} cy={ly} r="3" fill={color}/>
    </svg>
  );
}

function Donut({ slices, size=144 }) {
  const cx=size/2,cy=size/2,r=size*.36,stroke=size*.09;
  const total=slices.reduce((s,d)=>s+d.v,0)||1;
  const circ=2*Math.PI*r;
  let off=circ*.25;
  const arcs=slices.map(d=>{
    const dash=(d.v/total)*circ,gap=circ-dash;
    const a={...d,dash,gap,offset:-off}; off-=dash; return a;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth={stroke+2}/>
      {arcs.map((a,i)=>(
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={a.color} strokeWidth={stroke}
          strokeDasharray={`${a.dash} ${a.gap}`} strokeDashoffset={a.offset}
          style={{transition:"stroke-dasharray .6s ease"}}/>
      ))}
    </svg>
  );
}

function BarChart({ data, height=100 }) {
  const max=Math.max(...data.map(d=>d.v),1);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:5,height,padding:"0 2px"}}>
      {data.map((d,i)=>(
        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,height:"100%"}}>
          <div style={{flex:1,display:"flex",alignItems:"flex-end",width:"100%"}}>
            <div style={{width:"100%",height:`${Math.max((d.v/max)*86,3)}%`,
              background:d.today?`linear-gradient(180deg,${T.purpleHi},${T.purple})`:`${T.purple}44`,
              borderRadius:"3px 3px 0 0",transformOrigin:"bottom",
              animation:`barGrow .5s ease ${i*.04}s both`}}/>
          </div>
          <span style={{fontSize:10,color:d.today?T.purpleHi:T.textMuted,fontWeight:d.today?600:400}}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function Heatmap({ txs }) {
  const hours=["9h","10h","11h","12h","13h","14h","15h"];
  const days=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const data=useMemo(()=>Array.from({length:7},(_,hi)=>Array.from({length:7},(_,di)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-di));
    return txs.filter(t=>t.transaction_date===d.toISOString().split("T")[0]).length>0?Math.random()*3:0;
  })),[txs]);
  const max=Math.max(...data.flat(),1);
  return (
    <div style={{overflowX:"auto"}}>
      <div style={{display:"grid",gridTemplateColumns:"32px repeat(7,1fr)",gap:3,minWidth:240}}>
        <div/>
        {days.map(d=><div key={d} style={{fontSize:10,color:T.textMuted,textAlign:"center"}}>{d}</div>)}
        {hours.map((h,hi)=>[
          <div key={h} style={{fontSize:10,color:T.textMuted,display:"flex",alignItems:"center"}}>{h}</div>,
          ...days.map((_,di)=>{
            const v=data[hi]?.[di]||0;
            return <div key={di} style={{height:20,borderRadius:3,background:v>0?`rgba(124,58,237,${.15+v/max*.75})`:T.border}}/>;
          })
        ])}
      </div>
    </div>
  );
}

function Alert({ type, text }) {
  if (!text) return null;
  const ok=type==="ok";
  return (
    <div style={{padding:"11px 14px",borderRadius:9,fontSize:13,
      background:ok?`${T.green}18`:`${T.red}18`,
      border:`1px solid ${ok?T.green:T.red}44`,
      color:ok?T.green:T.red}}>{text}</div>
  );
}

function Label({ text }) {
  return <div style={{fontSize:11,color:T.textMuted,letterSpacing:".06em",marginBottom:8}}>{text}</div>;
}

function StatCard({ title, value, sub, sparkData, sparkColor, delay=0 }) {
  return (
    <div className={`card fu fu${delay}`} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"18px 20px",flex:"1 1 180px"}}>
      <div style={{fontSize:11,color:T.textMuted,letterSpacing:".06em",marginBottom:12}}>{title}</div>
      <div style={{fontSize:24,fontWeight:700,letterSpacing:"-.02em",marginBottom:6,fontFamily:"'JetBrains Mono'"}}>{value}</div>
      {sub&&<div style={{fontSize:12,color:T.textSub}}>{sub}</div>}
      {sparkData&&<div style={{marginTop:12}}><Sparkline data={sparkData} color={sparkColor||T.purple} height={36} width={120}/></div>}
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [whatsapp, setWhatsapp] = useState(""); // Novo estado para o número
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  
  const inp = { width: "100%", padding: "11px 14px", borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, color: T.text, fontSize: 14, outline: "none" };

  // Função para aplicar máscara (XX) XXXXX-XXXX e limitar tamanho
  const handleWhatsappChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número
    
    if (value.length > 11) value = value.slice(0, 11); // Limita a 11 dígitos
    
    // Aplica a máscara visual
    let formattedValue = value;
    if (value.length > 2) {
      formattedValue = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    if (value.length > 7) {
      formattedValue = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    }
    
    setWhatsapp(formattedValue);
  };

  async function submit(e) {
    e.preventDefault(); 
    setLoading(true); 
    setMsg({ type: "", text: "" });
    
    try {
      // Limpa a máscara antes de enviar para a API (envia apenas números)
      const rawWhatsapp = whatsapp.replace(/\D/g, "");

      const body = tab === "login" 
        ? { email, password: pass } 
        : { email, password: pass, whatsapp_number: rawWhatsapp }; // Utiliza o valor real sanitizado
        
      const r = await fetch(`${API_URL}/api/v1/users/${tab === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      const d = await r.json();
      
      if (r.ok) {
        if (tab === "login") {
          onLogin(d.access_token, email);
        } else { 
          setMsg({ type: "ok", text: "Conta criada! Faça login." }); 
          setTab("login"); 
          // Limpa os campos após registro
          setPass("");
          setWhatsapp("");
        }
      } else {
        setMsg({ type: "err", text: d.detail || "Erro ao processar" });
      }
    } catch { 
      setMsg({ type: "err", text: "Erro de conexão" }); 
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, backgroundImage: `radial-gradient(ellipse at 60% 20%,${T.purpleDim}44 0%,transparent 60%)` }}>
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
        
        <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, boxShadow: `0 0 0 1px ${T.purple}22,0 32px 64px #00000088` }}>
          <div style={{ display: "flex", background: T.bg, borderRadius: 9, padding: 3, marginBottom: 24 }}>
            {[["login", "Entrar"], ["register", "Criar conta"]].map(([id, label]) => (
              <button 
                key={id} 
                type="button" // Previne submissão acidental do form
                onClick={() => { setTab(id); setMsg({ type: "", text: "" }); }}
                style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: 7, background: tab === id ? T.purple : "transparent", color: tab === id ? "#fff" : T.textMuted, fontSize: 13, fontWeight: tab === id ? 600 : 400, cursor: "pointer", transition: "all .2s" }}>
                {label}
              </button>
            ))}
          </div>
          
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <Label text="EMAIL" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com" style={inp} onFocus={e => e.target.style.borderColor = T.purple} onBlur={e => e.target.style.borderColor = T.border} />
            </div>
            
            {/* Renderização condicional do campo de WhatsApp */}
            {tab === "register" && (
              <div>
                <Label text="TELEFONE" />
                <input 
                  type="tel" 
                  value={whatsapp} 
                  onChange={handleWhatsappChange} 
                  required={tab === "register"} // Só é required se estiver no cadastro
                  placeholder="(11) 99999-9999" 
                  style={inp} 
                  onFocus={e => e.target.style.borderColor = T.purple} 
                  onBlur={e => e.target.style.borderColor = T.border} 
                />
              </div>
            )}

            <div>
              <Label text="SENHA" />
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} required placeholder="••••••••" minLength={6} style={inp} onFocus={e => e.target.style.borderColor = T.purple} onBlur={e => e.target.style.borderColor = T.border} />
            </div>
            
            {msg.text && <Alert type={msg.type} text={msg.text} />}
            
            <button type="submit" disabled={loading} style={{ padding: "13px 0", border: "none", borderRadius: 10, background: `linear-gradient(135deg,${T.purple},${T.purpleHi})`, color: "#fff", fontSize: 15, fontWeight: 600, opacity: loading ? .7 : 1, cursor: loading ? "not-allowed" : "pointer", boxShadow: `0 4px 20px ${T.purple}55`, marginTop: 4 }}>
              {loading ? "Aguarde..." : tab === "login" ? "Entrar →" : "Criar conta →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
const NAV=[
  {id:"dashboard",icon:"⬡",label:"Dashboard"},
  {id:"budget",icon:"◈",label:"Orçamento"},
  {id:"transactions",icon:"≡",label:"Transações"},
  {id:"new",icon:"+",label:"Novo Lançamento"},
];

function Sidebar({ page, setPage, email, onLogout }) {
  return (
    <div style={{width:64,background:T.panel,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",alignItems:"center",padding:"16px 0",position:"sticky",top:0,height:"100vh",flexShrink:0}}>
      <div style={{marginBottom:28}}><SnakeLogo size={36}/></div>
      <nav style={{flex:1,display:"flex",flexDirection:"column",gap:6,alignItems:"center"}}>
        {NAV.map(n=>{
          const active=page===n.id;
          return (
            <button key={n.id} onClick={()=>setPage(n.id)} title={n.label}
              style={{width:42,height:42,border:`1px solid ${active?T.purple:"transparent"}`,borderRadius:12,
                display:"flex",alignItems:"center",justifyContent:"center",
                background:active?`${T.purple}22`:"transparent",
                color:active?T.purpleHi:T.textMuted,
                fontSize:n.id==="new"?22:17,cursor:"pointer",transition:"all .15s"}}>
              {n.icon}
            </button>
          );
        })}
      </nav>
      <button onClick={onLogout} title={`Sair (${email})`}
        style={{width:36,height:36,borderRadius:"50%",border:`1px solid ${T.border}`,background:`${T.purple}33`,color:T.purpleHi,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {email?.[0]?.toUpperCase()||"U"}
      </button>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function DashboardPage({ txs, loading, colors, onDeleteTx }) {
  const now=new Date();
  const days=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
  const thisMo=useMemo(()=>txs.filter(t=>{
    const d=new Date(t.transaction_date+"T12:00:00");
    return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();
  }),[txs]);
  const total=thisMo.reduce((s,t)=>s+Number(t.amount),0);
  const maior=thisMo.length?Math.max(...thisMo.map(t=>Number(t.amount))):0;
  const catMap=useMemo(()=>{const m={};thisMo.forEach(t=>{m[t.category]=(m[t.category]||0)+Number(t.amount);});return m;},[thisMo]);
  const catSlices=Object.entries(catMap).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({label:k,v,color:cc(k,colors)}));
  const barData=useMemo(()=>Array.from({length:14},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(13-i));
    const key=d.toISOString().split("T")[0];
    const v=txs.filter(t=>t.transaction_date===key).reduce((s,t)=>s+Number(t.amount),0);
    return {label:d.getDate()%2===0||i===13?String(d.getDate()):"",v,today:i===13};
  }),[txs]);
  const spark7=useMemo(()=>Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i));
    return txs.filter(t=>t.transaction_date===d.toISOString().split("T")[0]).reduce((s,t)=>s+Number(t.amount),0);
  }),[txs]);

  if (loading) return (
    <div style={{padding:24,display:"flex",flexDirection:"column",gap:16}}>
      {[1,2,3].map(i=><div key={i} style={{height:90,borderRadius:14,background:T.card,animation:"pulse 1.5s infinite"}}/>)}
    </div>
  );

  return (
    <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:16}}>
      <div className="fu fu0" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontSize:11,color:T.textMuted,letterSpacing:".08em",marginBottom:4}}>VISÃO GERAL</div>
          <div style={{fontSize:22,fontWeight:700}}>
            Dashboard <span style={{fontSize:13,fontWeight:400,color:T.textSub}}>— {now.toLocaleDateString("pt-BR",{month:"long",year:"numeric"})}</span>
          </div>
        </div>
        <div style={{fontSize:12,color:T.textMuted,background:`${T.purple}18`,border:`1px solid ${T.purple}33`,borderRadius:20,padding:"5px 14px"}}>
          {txs.length} transações registradas
        </div>
      </div>

      <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
        <StatCard delay={1} title="TOTAL DO MÊS" value={fmt(total)} sub={`${thisMo.length} transações`} sparkData={spark7} sparkColor={T.green}/>
        <StatCard delay={2} title="MAIOR GASTO" value={fmt(maior)} sub="este mês" sparkData={spark7.map(v=>v*.6)} sparkColor={T.purpleHi}/>
        <StatCard delay={3} title="CATEGORIAS" value={Object.keys(catMap).length} sub="distintas" sparkData={spark7.map((_,i)=>i+1)} sparkColor={T.cyan}/>
        <StatCard delay={4} title="MÉDIA DIÁRIA" value={fmt(total/days)} sub="estimativa mensal" sparkData={spark7} sparkColor={T.amber}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:12}}>
        <div className="card fu fu2" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"18px 20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
            <div>
              <div style={{fontSize:11,color:T.textMuted,letterSpacing:".06em",marginBottom:6}}>GASTOS POR DIA</div>
              <div style={{fontSize:28,fontWeight:700,fontFamily:"'JetBrains Mono'",letterSpacing:"-.03em"}}>{fmt(total)}</div>
              <div style={{fontSize:12,color:T.textSub,marginTop:2}}>acumulado no mês</div>
            </div>
            <div style={{fontSize:11,color:T.green,background:`${T.green}18`,padding:"4px 10px",borderRadius:20,fontWeight:600}}>14 dias</div>
          </div>
          <div style={{marginTop:20}}><BarChart data={barData} height={88}/></div>
        </div>
        <div className="card fu fu3" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"18px 20px"}}>
          <div style={{fontSize:11,color:T.textMuted,letterSpacing:".06em",marginBottom:16}}>TOP CATEGORIAS</div>
          {catSlices.length===0?(
            <div style={{color:T.textMuted,fontSize:13,textAlign:"center",padding:40}}>Nenhum dado ainda</div>
          ):(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
              <div style={{position:"relative"}}>
                <Donut slices={catSlices} size={130}/>
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <div style={{fontSize:10,color:T.textMuted}}>TOTAL</div>
                  <div style={{fontSize:14,fontWeight:700,fontFamily:"'JetBrains Mono'"}}>{fmtS(total)}</div>
                </div>
              </div>
              <div style={{width:"100%",display:"flex",flexDirection:"column",gap:7}}>
                {catSlices.slice(0,4).map(s=>(
                  <div key={s.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <div style={{width:7,height:7,borderRadius:"50%",background:s.color,boxShadow:`0 0 6px ${s.color}`}}/>
                      <span style={{fontSize:12,color:T.textSub,textTransform:"capitalize"}}>{s.label}</span>
                    </div>
                    <span style={{fontSize:12,fontWeight:600,fontFamily:"'JetBrains Mono'"}}>{fmtS(s.v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div className="card fu fu4" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"18px 20px"}}>
          <div style={{fontSize:11,color:T.textMuted,letterSpacing:".06em",marginBottom:14}}>ATIVIDADE SEMANAL</div>
          <Heatmap txs={txs}/>
        </div>
        <div className="card fu fu5" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"18px 20px"}}>
          <div style={{fontSize:11,color:T.textMuted,letterSpacing:".06em",marginBottom:14}}>LANÇAMENTOS RECENTES</div>
          {txs.slice(0,5).map((t,i)=>(
            <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<4?`1px solid ${T.border}`:"none"}}>
              <div style={{width:32,height:32,borderRadius:9,flexShrink:0,background:`${cc(t.category,colors)}18`,border:`1px solid ${cc(t.category,colors)}33`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:cc(t.category,colors)}}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.description||"—"}</div>
                <div style={{fontSize:10,color:T.textMuted,marginTop:2,textTransform:"capitalize"}}>{t.category} · {fmtD(t.transaction_date)}</div>
              </div>
              <div style={{fontSize:13,fontWeight:600,color:T.red,fontFamily:"'JetBrains Mono'",flexShrink:0}}>-{fmtS(t.amount)}</div>
              <button onClick={()=>onDeleteTx(t)} title="Apagar"
                style={{width:24,height:24,borderRadius:6,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.background=`${T.red}22`;e.currentTarget.style.color=T.red;e.currentTarget.style.borderColor=T.red;}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.textMuted;e.currentTarget.style.borderColor=T.border;}}>
                ×
              </button>
            </div>
          ))}
          {txs.length===0&&<div style={{textAlign:"center",color:T.textMuted,fontSize:12,padding:"24px 0"}}>Nenhum lançamento ainda</div>}
        </div>
      </div>
    </div>
  );
}

// ── ORÇAMENTO ─────────────────────────────────────────────────────────────────
function BudgetPage({ txs, cats, colors }) {
  const [budgets,setBudgets]=useState(()=>{try{return JSON.parse(localStorage.getItem("sf_budgets")||"{}");}catch{return{};}});
  const [editing,setEditing]=useState(null);
  const [editVal,setEditVal]=useState("");
  const [expanded,setExpanded]=useState(null);
  const getBudget=cat=>budgets[cat]??DEFAULT_BUDGETS[cat]??200;
  function saveEdit(cat){
    const val=parseFloat(editVal);
    if(!isNaN(val)&&val>0){const nb={...budgets,[cat]:val};setBudgets(nb);localStorage.setItem("sf_budgets",JSON.stringify(nb));}
    setEditing(null);
  }
  const now=new Date();
  const thisMo=useMemo(()=>txs.filter(t=>{const d=new Date(t.transaction_date+"T12:00:00");return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();}),[txs]);
  const spent=useMemo(()=>{const m={};thisMo.forEach(t=>{m[t.category]=(m[t.category]||0)+Number(t.amount);});return m;},[thisMo]);
  const catDetails=useMemo(()=>{const m={};txs.forEach(t=>{if(!m[t.category])m[t.category]=[];m[t.category].push(t);});return m;},[txs]);

  return (
    <div style={{padding:"20px 24px"}}>
      <div className="fu fu0" style={{marginBottom:8}}>
        <div style={{fontSize:11,color:T.textMuted,letterSpacing:".08em",marginBottom:4}}>CONTROLE</div>
        <div style={{fontSize:22,fontWeight:700}}>Orçamento Mensal</div>
        <div style={{fontSize:13,color:T.textSub,marginTop:4}}>Clique no limite para editar · Clique na categoria para ver detalhes</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12,marginTop:20}}>
        {cats.map((cat,i)=>{
          const s=spent[cat]||0,b=getBudget(cat),pct=Math.min((s/b)*100,100),over=s>b;
          const items=catDetails[cat]||[],isExp=expanded===cat;
          return (
            <div key={cat} className={`fu fu${i%4}`} style={{background:T.card,border:`1px solid ${over?T.red+"55":isExp?T.purple+"55":T.border}`,borderRadius:14,padding:"16px 18px",transition:"border-color .2s"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:12,alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setExpanded(isExp?null:cat)}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:cc(cat,colors),boxShadow:`0 0 6px ${cc(cat,colors)}`}}/>
                  <span style={{fontSize:13,fontWeight:600,textTransform:"capitalize"}}>{cat}</span>
                  {items.length>0&&<span style={{fontSize:10,color:T.textMuted}}>({items.length})</span>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  {over&&<span style={{fontSize:10,color:T.red,background:`${T.red}18`,padding:"2px 7px",borderRadius:10,fontWeight:600}}>EXCEDIDO</span>}
                  <span style={{fontSize:10,color:T.textMuted}}>{isExp?"▲":items.length>0?"▼":""}</span>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,alignItems:"center"}}>
                <div>
                  <div style={{fontSize:10,color:T.textMuted,marginBottom:2}}>GASTO</div>
                  <div style={{fontSize:16,fontWeight:700,fontFamily:"'JetBrains Mono'",color:over?T.red:T.text}}>{fmt(s)}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:10,color:T.textMuted,marginBottom:2}}>LIMITE</div>
                  {editing===cat?(
                    <input autoFocus type="number" value={editVal} onChange={e=>setEditVal(e.target.value)}
                      onBlur={()=>saveEdit(cat)} onKeyDown={e=>{if(e.key==="Enter")saveEdit(cat);if(e.key==="Escape")setEditing(null);}}
                      style={{width:80,padding:"2px 6px",borderRadius:6,background:T.bg,border:`1px solid ${T.purple}`,color:T.text,fontSize:13,fontFamily:"'JetBrains Mono'",outline:"none",textAlign:"right"}}/>
                  ):(
                    <div style={{fontSize:16,fontWeight:700,fontFamily:"'JetBrains Mono'",color:T.textSub,cursor:"pointer",borderBottom:`1px dashed ${T.border}`}}
                      onClick={()=>{setEditing(cat);setEditVal(String(b));}} title="Clique para editar">{fmt(b)}</div>
                  )}
                </div>
              </div>
              <div style={{height:5,background:T.border,borderRadius:3,overflow:"hidden",marginBottom:6}}>
                <div style={{height:"100%",width:`${pct}%`,background:over?T.red:pct>80?T.amber:cc(cat,colors),borderRadius:3,transition:"width .6s ease"}}/>
              </div>
              <div style={{fontSize:10,color:T.textMuted,textAlign:"right",marginBottom:isExp&&items.length>0?12:0}}>
                {Math.round(pct)}% utilizado · restam {fmt(Math.max(b-s,0))}
              </div>
              {isExp&&items.length>0&&(
                <div style={{borderTop:`1px solid ${T.border}`,paddingTop:10,display:"flex",flexDirection:"column",gap:6}}>
                  {[...items].sort((a,b)=>new Date(b.transaction_date)-new Date(a.transaction_date)).slice(0,5).map((t,j)=>(
                    <div key={j} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:500}}>{t.description||"—"}</div>
                        <div style={{fontSize:10,color:T.textMuted}}>{fmtD(t.transaction_date)}</div>
                      </div>
                      <div style={{fontSize:12,fontWeight:600,color:T.red,fontFamily:"'JetBrains Mono'"}}>{fmt(t.amount)}</div>
                    </div>
                  ))}
                  {items.length>5&&<div style={{fontSize:10,color:T.textMuted,textAlign:"center"}}>+{items.length-5} mais</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── TRANSAÇÕES ────────────────────────────────────────────────────────────────
function TransactionsPage({ txs, cats, colors, onDeleteTx }) {
  const [search,setSearch]=useState("");
  const [cat,setCat]=useState("todas");
  const filtered=useMemo(()=>txs.filter(t=>(cat==="todas"||t.category===cat)&&(!search||(t.description||"").toLowerCase().includes(search.toLowerCase()))),[txs,search,cat]);
  const total=filtered.reduce((s,t)=>s+Number(t.amount),0);

  return (
    <div style={{padding:"20px 24px"}}>
      <div className="fu fu0" style={{marginBottom:20}}>
        <div style={{fontSize:11,color:T.textMuted,letterSpacing:".08em",marginBottom:4}}>HISTÓRICO</div>
        <div style={{fontSize:22,fontWeight:700}}>Transações</div>
      </div>
      <div className="fu fu1" style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por descrição..."
          style={{flex:"1 1 180px",padding:"9px 14px",borderRadius:9,background:T.card,border:`1px solid ${T.border}`,color:T.text,fontSize:13,outline:"none"}}
          onFocus={e=>e.target.style.borderColor=T.purple} onBlur={e=>e.target.style.borderColor=T.border}/>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["todas",...cats].map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{padding:"7px 12px",borderRadius:20,
              border:`1px solid ${cat===c?cc(c,colors):T.border}`,
              background:cat===c?`${cc(c,colors)}18`:"transparent",
              color:cat===c?cc(c,colors):T.textMuted,
              fontSize:11,fontWeight:cat===c?600:400,textTransform:"capitalize",cursor:"pointer",transition:"all .15s"}}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="fu fu2" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
        <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:12,color:T.textMuted}}>{filtered.length} lançamentos</span>
          <span style={{fontSize:13,fontWeight:600,fontFamily:"'JetBrains Mono'",color:T.red}}>-{fmt(total)}</span>
        </div>
        {filtered.map((t,i)=>(
          <div key={t.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 18px",
            borderBottom:i<filtered.length-1?`1px solid ${T.border}`:"none",transition:"background .15s"}}
            onMouseEnter={e=>e.currentTarget.style.background=T.cardHover}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{width:8,height:8,borderRadius:"50%",background:cc(t.category,colors),flexShrink:0}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:500}}>{t.description||"—"}</div>
              <div style={{fontSize:11,color:T.textMuted,marginTop:2,textTransform:"capitalize"}}>{t.category}</div>
            </div>
            <div style={{fontSize:12,color:T.textMuted}}>{fmtD(t.transaction_date)}</div>
            <div style={{fontSize:13,fontWeight:600,fontFamily:"'JetBrains Mono'",color:T.red,minWidth:70,textAlign:"right"}}>-{fmt(t.amount)}</div>
            <button onClick={()=>onDeleteTx(t)} title="Apagar"
              style={{width:28,height:28,borderRadius:7,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=`${T.red}22`;e.currentTarget.style.color=T.red;e.currentTarget.style.borderColor=T.red;}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.textMuted;e.currentTarget.style.borderColor=T.border;}}>
              ×
            </button>
          </div>
        ))}
        {filtered.length===0&&<div style={{textAlign:"center",color:T.textMuted,padding:40,fontSize:13}}>Nenhum lançamento encontrado</div>}
      </div>
    </div>
  );
}

// ── NOVO LANÇAMENTO ───────────────────────────────────────────────────────────
function NewTxPage({ onSaved, cats, setCats, colors, setColors }) {
  const [form,setForm]=useState({amount:"",description:"",category:cats[0],date:today()});
  const [loading,setLoading]=useState(false);
  const [msg,setMsg]=useState({type:"",text:""});
  const [catDetected,setCatDetected]=useState(null);
  const [showNewCat,setShowNewCat]=useState(false);
  const [newCatName,setNewCatName]=useState("");
  const [newCatColor,setNewCatColor]=useState(PALETTE[0]);

  const setField=useCallback((k,v)=>setForm(f=>({...f,[k]:v})),[]);
  const inp={width:"100%",padding:"12px 16px",borderRadius:10,background:T.bg,border:`1px solid ${T.border}`,color:T.text,fontSize:15,outline:"none",fontFamily:"inherit"};

  function handleAmount(e) {
    const raw=e.target.value.replace(/\D/g,"");
    if(!raw){setField("amount","");return;}
    setField("amount",(parseInt(raw,10)/100).toFixed(2));
  }

  function handleDesc(e) {
    const desc=e.target.value;
    const detected=detectCat(desc,cats,colors);
    setForm(f=>({...f,description:desc,...(detected?{category:detected}:{})}));
    setCatDetected(detected);
  }

  function addCat() {
    const name=newCatName.toLowerCase().trim();
    if(!name||cats.includes(name)){setMsg({type:"err",text:"Nome inválido ou já existe"});return;}
    const newCats=[...cats.filter(c=>c!=="outros"),name,"outros"];
    const newColors={...colors,[name]:newCatColor};
    setCats(newCats); setColors(newColors);
    saveCats(newCats,newColors);
    setField("category",name);
    setShowNewCat(false); setNewCatName(""); setNewCatColor(PALETTE[0]);
  }

  function removeCat(name) {
    if(BASE_CATS.includes(name))return;
    const newCats=cats.filter(c=>c!==name);
    const newColors={...colors}; delete newColors[name];
    setCats(newCats); setColors(newColors);
    saveCats(newCats,newColors);
    if(form.category===name) setField("category",newCats[0]);
  }

  const displayAmount=val=>val?Number(val).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2}):"";

  async function submit(e) {
    e.preventDefault();
    if(!form.amount||!form.description){setMsg({type:"err",text:"Preencha todos os campos"});return;}
    setLoading(true); setMsg({type:"",text:""});
    try {
      const token=localStorage.getItem("sf_token")||"";
      const userId=decodeToken(token);
      if(!userId){setMsg({type:"err",text:"Sessão expirada. Faça login novamente."});setLoading(false);return;}
      const r=await fetch(`${API_URL}/api/v1/transactions/`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({user_id:userId,amount:parseFloat(form.amount),category:form.category,description:form.description,transaction_date:form.date,source:"dashboard"})
      });
      const d=await r.json();
      if(d.action==="saved"){
        setMsg({type:"ok",text:`✓ Salvo! ${fmt(form.amount)} em ${form.category}`});
        setForm({amount:"",description:"",category:cats[0],date:today()});
        setCatDetected(null); onSaved();
      } else setMsg({type:"err",text:d.detail||"Erro ao salvar"});
    } catch {setMsg({type:"err",text:"Erro de conexão"});}
    setLoading(false);
  }

  return (
    <div style={{padding:"20px 24px",maxWidth:540}}>
      <div className="fu fu0" style={{marginBottom:28}}>
        <div style={{fontSize:11,color:T.textMuted,letterSpacing:".08em",marginBottom:4}}>REGISTRAR</div>
        <div style={{fontSize:22,fontWeight:700}}>Novo Lançamento</div>
        <div style={{fontSize:13,color:T.textSub,marginTop:4}}>Adicione uma despesa manualmente</div>
      </div>
      <form className="fu fu1" onSubmit={submit} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,display:"flex",flexDirection:"column",gap:18}}>
        <div>
          <Label text="VALOR (R$)"/>
          <input type="text" inputMode="numeric" value={displayAmount(form.amount)} onChange={handleAmount} placeholder="0,00" required
            style={{...inp,fontSize:22,fontWeight:700,fontFamily:"'JetBrains Mono'"}}
            onFocus={e=>e.target.style.borderColor=T.purple} onBlur={e=>e.target.style.borderColor=T.border}/>
          <div style={{fontSize:10,color:T.textMuted,marginTop:4}}>Digite apenas os dígitos — vírgula inserida automaticamente</div>
        </div>
        <div>
          <Label text="DESCRIÇÃO"/>
          <input type="text" value={form.description} onChange={handleDesc} placeholder="Ex: remédio, mercado, aluguel, uber..." required style={inp}
            onFocus={e=>e.target.style.borderColor=T.purple} onBlur={e=>e.target.style.borderColor=T.border}/>
          {catDetected&&(
            <div style={{fontSize:11,color:T.green,marginTop:5,display:"flex",alignItems:"center",gap:5}}>
              <span>✦</span><span>Categoria detectada: <strong style={{textTransform:"capitalize"}}>{catDetected}</strong></span>
            </div>
          )}
        </div>
        <div>
          <Label text="CATEGORIA"/>
          <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:8}}>
            {cats.map(c=>(
              <div key={c} style={{position:"relative",display:"inline-flex"}}>
                <button type="button" onClick={()=>setField("category",c)} style={{
                  padding:`7px ${!BASE_CATS.includes(c)?"22px":"13px"} 7px 13px`,
                  borderRadius:20,border:`1px solid ${form.category===c?cc(c,colors):T.border}`,
                  background:form.category===c?`${cc(c,colors)}18`:"transparent",
                  color:form.category===c?cc(c,colors):T.textMuted,
                  fontSize:12,fontWeight:form.category===c?600:400,textTransform:"capitalize",cursor:"pointer",transition:"all .15s"}}>
                  {c}
                </button>
                {!BASE_CATS.includes(c)&&(
                  <button type="button" onClick={()=>removeCat(c)}
                    style={{position:"absolute",right:4,top:"50%",transform:"translateY(-50%)",width:14,height:14,borderRadius:"50%",border:"none",background:`${T.red}44`,color:T.red,fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          {!showNewCat?(
            <button type="button" onClick={()=>setShowNewCat(true)}
              style={{fontSize:11,color:T.purple,background:"transparent",border:`1px dashed ${T.purple}`,borderRadius:20,padding:"4px 12px",cursor:"pointer"}}>
              + Nova categoria
            </button>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:10,background:T.bg,borderRadius:10,padding:12,border:`1px solid ${T.border}`}}>
              <input autoFocus value={newCatName} onChange={e=>setNewCatName(e.target.value)}
                placeholder="nome da categoria" maxLength={20}
                style={{padding:"8px 12px",borderRadius:8,background:T.card,border:`1px solid ${T.purple}`,color:T.text,fontSize:13,outline:"none"}}
                onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addCat();}if(e.key==="Escape")setShowNewCat(false);}}/>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {PALETTE.map(clr=>(
                  <div key={clr} onClick={()=>setNewCatColor(clr)}
                    style={{width:22,height:22,borderRadius:"50%",background:clr,cursor:"pointer",
                      border:newCatColor===clr?"2px solid #fff":"2px solid transparent",transition:"all .15s"}}/>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button type="button" onClick={addCat}
                  style={{flex:1,padding:"8px 0",border:"none",borderRadius:8,background:T.purple,color:"#fff",fontSize:13,cursor:"pointer",fontWeight:600}}>
                  Adicionar
                </button>
                <button type="button" onClick={()=>{setShowNewCat(false);setNewCatName("");}}
                  style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,fontSize:13,cursor:"pointer"}}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
        <div>
          <Label text="DATA"/>
          <input type="date" value={form.date} onChange={e=>setField("date",e.target.value)} style={{...inp,colorScheme:"dark"}}/>
        </div>
        <Alert type={msg.type} text={msg.text}/>
        <button type="submit" disabled={loading} style={{padding:"14px 0",border:"none",borderRadius:10,
          background:`linear-gradient(135deg,${T.purple},${T.purpleHi})`,color:"#fff",fontSize:15,fontWeight:600,
          cursor:loading?"not-allowed":"pointer",opacity:loading?.7:1,boxShadow:`0 4px 18px ${T.purple}44`,transition:"opacity .15s"}}>
          {loading?"Salvando...":"Salvar lançamento →"}
        </button>
      </form>
    </div>
  );
}

// ── MODAL DELETE ──────────────────────────────────────────────────────────────
function DeleteModal({ tx, onConfirm, onCancel, loading }) {
  if (!tx) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"#00000099",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}
      onClick={()=>!loading&&onCancel()}>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:28,maxWidth:340,width:"90%",boxShadow:"0 24px 64px #000000cc"}}
        onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:16,fontWeight:600,marginBottom:8}}>Apagar lançamento?</div>
        <div style={{fontSize:13,color:T.textSub,marginBottom:4}}>{tx.description||"Sem descrição"}</div>
        <div style={{fontSize:11,color:T.textMuted,textTransform:"capitalize",marginBottom:16}}>{tx.category} · {fmtD(tx.transaction_date)}</div>
        <div style={{fontSize:22,fontWeight:700,fontFamily:"'JetBrains Mono'",color:T.red,marginBottom:24}}>-{fmt(tx.amount)}</div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} disabled={loading}
            style={{flex:1,padding:"10px 0",border:`1px solid ${T.border}`,borderRadius:9,background:"transparent",color:T.textSub,fontSize:14,cursor:"pointer"}}>
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading}
            style={{flex:1,padding:"10px 0",border:"none",borderRadius:9,background:T.red,color:"#fff",fontSize:14,fontWeight:600,cursor:loading?"not-allowed":"pointer",opacity:loading?.6:1}}>
            {loading?"Apagando...":"Apagar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [token,setToken]=useState(()=>localStorage.getItem("sf_token")||"");
  const [email,setEmail]=useState(()=>localStorage.getItem("sf_email")||"");
  const [page,setPage]=useState("dashboard");
  const [txs,setTxs]=useState([]);
  const [loading,setLoading]=useState(false);
  const [confirmDelete,setConfirmDelete]=useState(null);
  const [deleting,setDeleting]=useState(false);

  // Categorias como state para re-render ao adicionar
  const [cats,setCats]=useState(()=>loadCats().cats);
  const [colors,setColors]=useState(()=>loadCats().colors);

  const handleLogin=useCallback((t,e)=>{
    setToken(t);setEmail(e);
    localStorage.setItem("sf_token",t);
    localStorage.setItem("sf_email",e);
  },[]);

  const handleLogout=useCallback(()=>{
    setToken("");setEmail("");
    localStorage.removeItem("sf_token");
    localStorage.removeItem("sf_email");
  },[]);

  const load=useCallback(async()=>{
    if(!token)return;
    setLoading(true);
    try {
      const userId=decodeToken(token);
      const url=userId?`${API_URL}/api/v1/transactions/?user_id=${userId}`:`${API_URL}/api/v1/transactions/`;
      const r=await fetch(url,{headers:{Authorization:`Bearer ${token}`}});
      if(r.ok)setTxs(await r.json());
      else if(r.status===401)handleLogout();
    } catch {}
    setLoading(false);
  },[token,handleLogout]);

  useEffect(()=>{load();},[load]);

  async function handleDelete() {
    if(!confirmDelete)return;
    setDeleting(true);
    try {
      const r=await fetch(`${API_URL}/api/v1/transactions/${confirmDelete.id}`,{method:"DELETE"});
      if(r.ok){await load();setConfirmDelete(null);}
    } catch {}
    setDeleting(false);
  }

  if(!token) return <><style>{CSS}</style><Login onLogin={handleLogin}/></>;

  return (
    <>
      <style>{CSS}</style>
      <div style={{display:"flex",height:"100vh",backgroundImage:`radial-gradient(ellipse at 80% 10%,${T.purpleDim}33 0%,transparent 50%)`}}>
        <Sidebar page={page} setPage={setPage} email={email} onLogout={handleLogout}/>
        <main style={{flex:1,overflowY:"auto"}}>
          {page==="dashboard"    && <DashboardPage txs={txs} loading={loading} colors={colors} onDeleteTx={setConfirmDelete}/>}
          {page==="budget"       && <BudgetPage txs={txs} cats={cats} colors={colors}/>}
          {page==="transactions" && <TransactionsPage txs={txs} cats={cats} colors={colors} onDeleteTx={setConfirmDelete}/>}
          {page==="new"          && <NewTxPage onSaved={load} cats={cats} setCats={setCats} colors={colors} setColors={setColors}/>}
        </main>
      </div>
      <DeleteModal tx={confirmDelete} onConfirm={handleDelete} onCancel={()=>setConfirmDelete(null)} loading={deleting}/>
    </>
  );
}
