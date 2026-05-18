// ── TEMA ─────────────────────────────────────────────────────────────────────
export const T = {
  bg:"#0d0d14", panel:"#13131e", card:"#1a1a28", cardHover:"#1f1f30",
  border:"#252538", borderHi:"#353558",
  purple:"#7c3aed", purpleHi:"#9d5ff5", purpleDim:"#3d1f7a",
  green:"#00e676", red:"#ef5350", cyan:"#00bcd4", amber:"#ffb300",
  text:"#eeeef8", textSub:"#9090b8", textMuted:"#505070",
};

// ── CATEGORIAS ────────────────────────────────────────────────────────────────
export const BASE_CATS = [
  "alimentação","transporte","moradia","saúde",
  "lazer","educação","vestuário","outros",
];

export const BASE_COLORS = {
  alimentação:"#00e676", transporte:"#7c3aed", moradia:"#00bcd4",
  saúde:"#ef5350", lazer:"#ffb300", educação:"#4fc3f7",
  vestuário:"#f48fb1", outros:"#78909c",
};

export const PALETTE = [
  "#e040fb","#00e5ff","#69f0ae","#ff6d00",
  "#40c4ff","#f50057","#76ff03","#ffd740","#b0bec5","#ff4081",
];

export const DEFAULT_BUDGETS = {
  alimentação:600, transporte:300, moradia:1500, saúde:400,
  lazer:200, educação:300, vestuário:200, outros:100,
};

export const KEYWORDS = {
  alimentação:["ifood","rappi","mercado","supermercado","padaria","restaurante","lanche","pizza","hamburguer","feira","comida","almoço","jantar","café","hortifruti","refeição","sushi","delivery","mcdonalds","subway","churrasco","bebida","boteco","sorvete"],
  transporte:["uber","99","cabify","taxi","ônibus","metro","trem","gasolina","etanol","diesel","estacionamento","pedágio","multa","ipva","oficina","moto","bicicleta","passagem"],
  moradia:["aluguel","condominio","luz","energia","agua","gás","internet","telefone","netflix","spotify","amazon","disney","celular","fatura","iptu","reforma","pintura","encanador","eletricista","móveis","decoração"],
  saúde:["remedio","remédio","farmácia","farmacia","droga","ultrafarma","panvel","drogasil","hospital","clinica","médico","consulta","exame","dentista","psicólogo","terapia","academia","gym","smartfit","suplemento","vitamina","whey"],
  lazer:["cinema","teatro","show","ingresso","jogo","game","steam","playstation","xbox","viagem","hotel","airbnb","booking","latam","gol","azul","parque","passeio","balada","festa"],
  educação:["escola","faculdade","universidade","curso","udemy","alura","livro","livraria","papelaria","mensalidade","inglês","idioma","certificado","treinamento"],
  vestuário:["roupa","vestuario","vestuário","calçado","sapato","tenis","tênis","camisa","calça","vestido","shorts","bermuda","jaqueta","casaco","zara","renner","riachuelo","shein","nike","adidas"],
  investimento:["investimento","ações","fundos","tesouro","cripto","bitcoin","corretora","xp","clear","btg"],
};

// ── CSS GLOBAL ────────────────────────────────────────────────────────────────
export const CSS = `
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

// ── UTILITÁRIOS ───────────────────────────────────────────────────────────────
export const fmt = n =>
  `R$${Number(n).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}`;

export const fmtS = n => {
  n = Number(n);
  return n >= 1000 ? `R$${(n/1000).toFixed(1)}k` : `R$${n.toFixed(0)}`;
};

export const fmtD = d =>
  new Date(d+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"short"});

export const today = () => new Date().toISOString().split("T")[0];

export const cc = (cat, colors) => (colors||{})[cat] || "#78909c";

export const norm = s =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");

export function detectCat(desc, cats) {
  if (!desc || desc.length < 2) return null;
  const d = norm(desc);
  for (const cat of cats) {
    const words = KEYWORDS[cat] || [];
    if (words.some(w => d.includes(norm(w)))) return cat;
  }
  return null;
}

export function decodeToken(token) {
  try {
    const p = JSON.parse(atob(token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));
    return p.sub || "";
  } catch { return ""; }
}

// ── PERSISTÊNCIA DE CATEGORIAS ────────────────────────────────────────────────
export function loadCats() {
  try {
    const cats  = JSON.parse(localStorage.getItem("sf_cats")       || "null");
    const colors = JSON.parse(localStorage.getItem("sf_cat_colors") || "null");
    return { cats: cats || [...BASE_CATS], colors: colors || {...BASE_COLORS} };
  } catch {
    return { cats: [...BASE_CATS], colors: {...BASE_COLORS} };
  }
}

export function saveCats(cats, colors) {
  localStorage.setItem("sf_cats",       JSON.stringify(cats));
  localStorage.setItem("sf_cat_colors", JSON.stringify(colors));
}
