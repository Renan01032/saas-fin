// ── TEMA ─────────────────────────────────────────────────────────────────────
export const T = {
  bg:"#0d0d14", panel:"#13131e", card:"#1a1a28", cardHover:"#1f1f30",
  border:"#252538", borderHi:"#353558",
  purple:"#7c3aed", purpleHi:"#9d5ff5", purpleDim:"#3d1f7a",
  green:"#00e676", red:"#ef5350", cyan:"#00bcd4", amber:"#ffb300",
  text:"#eeeef8", textSub:"#9090b8", textMuted:"#505070",
};

// ── CATEGORIAS DE DESPESA ─────────────────────────────────────────────────────
export const BASE_CATS = [
  "alimentação","transporte","moradia","saúde",
  "lazer","educação","vestuário","outros",
];

export const BASE_COLORS = {
  alimentação:"#00e676", transporte:"#7c3aed", moradia:"#00bcd4",
  saúde:"#ef5350", lazer:"#ffb300", educação:"#4fc3f7",
  vestuário:"#f48fb1", outros:"#78909c",
};

// Cores sugeridas para futuras categorias
export const SUGGESTED_CAT_COLORS = {
  investimento:"#69f0ae", "animais domésticos":"#ffab40",
  beleza:"#f48fb1", tecnologia:"#40c4ff",
  "saúde mental":"#ce93d8", "presentes e datas":"#ffcc02",
  viagens:"#00e5ff", "assinaturas digitais":"#b39ddb",
};

export const PALETTE = [
  "#e040fb","#00e5ff","#69f0ae","#ff6d00",
  "#40c4ff","#f50057","#76ff03","#ffd740","#b0bec5","#ff4081",
];

export const DEFAULT_BUDGETS = {
  alimentação:600, transporte:300, moradia:1500, saúde:400,
  lazer:200, educação:300, vestuário:200, outros:100,
};

// ── PALAVRAS-CHAVE POR CATEGORIA (100+ por categoria) ────────────────────────
export const KEYWORDS = {
  alimentação: [
    // apps e delivery
    "ifood","rappi","uber eats","aiqfome","james delivery","loggi","shopper",
    // mercados e supermercados
    "mercado","supermercado","atacado","atacarejo","assaí","atacadão","carrefour",
    "extra","pão de açúcar","mundial","guanabara","prezunic","bistek","hiper",
    "hipermercado","mini mercado","mercearia","quitanda","hortifruti","frutaria",
    "feira","sacolão","açougue","peixaria","padaria","confeitaria","doceria",
    // refeições
    "restaurante","lanchonete","hamburgueria","pizzaria","sushis","rodízio",
    "churrascaria","boteco","bar","bistrô","cantina","cafeteria","café","lanche",
    "almoço","janta","jantar","refeição","marmita","quentinha","comida",
    "self service","buffet","food truck","trailer",
    // fast food e redes
    "mcdonalds","burguer king","subway","giraffas","bob's","frango assado",
    "china in box","gendai","temakeria","habibs","madero","outback","cvc",
    "pizza hut","domino","spoleto","vivenda do camarão",
    // compras de alimento
    "hortifruti","verdura","fruta","carne","frango","peixe","ovo","leite",
    "queijo","iogurte","pão","biscoito","bebida","refrigerante","suco",
    "cerveja","vinho","água","sorvete","chocolate","doce","salgado",
    "tempero","condimento","óleo","azeite","arroz","feijão","macarrão",
  ],

  transporte: [
    // apps e táxi
    "uber","99","cabify","taxi","99pop","uber flash","ladys driver","indriver",
    "blablacar","caroneta","ride","pop","comfort","black","pet taxi",
    // transporte público
    "ônibus","metro","metrô","trem","barca","ferry","van","lotação",
    "bilhete único","cartão transporte","recarga bom","recarga riocard",
    "cartão spt","vlt","brt","mototaxi","moto táxi",
    // combustível e veículo
    "gasolina","etanol","álcool","diesel","gnv","combustível","abastecimento",
    "posto","ipiranga","shell","br distribuidora","raízen","ale","petrobras",
    // manutenção
    "oficina","mecânico","borracharia","funilaria","pintura carro","revisão",
    "troca de óleo","alinhamento","balanceamento","pneu","bateria carro",
    "seguro carro","ipva","licenciamento","dpvat","multa","reboque","guincho",
    // pedágio e estacionamento
    "pedágio","praça de pedágio","estacionamento","valet","zona azul","rotativo",
    "parquímetro","convênio estacionamento",
    // viagem e passagem
    "passagem","embarque","terminal","rodoviária","aeroporto","ônibus intermunicipal",
    "executivo","leito","semileito","fretamento",
    // bicicleta e patinete
    "bicicleta","patinete","tembici","yellow","grin","itaú bike","bike sharing",
    "manutenção bike","capacete","câmara bike",
  ],

  moradia: [
    // pagamentos fixos
    "aluguel","condomínio","condominio","iptu","taxa de água","taxa de luz",
    "taxa de gás","taxa de lixo","fundo de reserva","taxa condominial",
    // energia e água
    "luz","energia elétrica","conta de luz","enel","cemig","copel","energisa",
    "coelce","celpe","água","saneamento","sabesp","cedae","sanepar","copasa",
    "gás","comgás","ceg","gás encanado","botijão",
    // internet e telefone
    "internet","banda larga","fibra","wi-fi","claro","vivo","tim","oi","net",
    "nextel","algar","sercomtel","telefone","linha fixa","voip",
    // streaming e assinaturas casa
    "netflix","amazon prime","prime video","disney","hbo max","max","globoplay",
    "star plus","apple tv","paramount","crunchyroll","spotify","deezer",
    "youtube premium","twitch","xbox game pass","playstation plus",
    // celular
    "celular","plano celular","recarga","chip","tim","claro","vivo","oi",
    // reparos e reformas
    "reforma","pintura","pedreiro","encanador","eletricista","marceneiro",
    "vidraceiro","chaveiro","dedetização","desentupimento","limpeza","faxina",
    "diarista","empregada","porteiro","zelador","consertar","conserto",
    // móveis e utensílios
    "móveis","sofá","cama","colchão","guarda-roupa","mesa","cadeira","prateleira",
    "tok stok","leroy merlin","telha norte","c&c","sodimac","dicico","etna",
    "casa bahia","magazine luiza","lojas americanas","shoptime",
    // manutenção
    "manutenção predial","spda","para-raios","elevador","hidráulica","elétrica",
    "telhado","impermeabilização","pintura predial","portão","interfone",
  ],

  saúde: [
    // farmácias e drogarias
    "farmácia","farmacia","drogaria","droga","ultrafarma","panvel","drogasil",
    "drogaraia","pacheco","nissei","extrafarma","drogaria são paulo","genial",
    "farmácia popular","manipulação","farmácia de manipulação","homeopática",
    // medicamentos
    "remedio","remédio","medicamento","comprimido","cápsula","pomada","xarope",
    "vitamina","suplemento","whey protein","creatina","colágeno","ômega 3",
    "anticoncepcional","insulina","injeção","soro","curativo","atadura",
    // consultas e exames
    "consulta","médico","médica","clínica","hospital","upa","pronto socorro",
    "internação","cirurgia","anestesia","exame","hemograma","raio-x","tomografia",
    "ressonância","ultrassom","endoscopia","colonoscopia","mamografia","papanicolau",
    "eletrocardiograma","ecocardiograma","densitometria","preventivo",
    // especialistas
    "dermatologista","cardiologista","ortopedista","neurologista","oftalmologista",
    "otorrinolaringologista","ginecologista","urologista","pediatra","geriatra",
    "psiquiatra","nutricionista","fonoaudióloga","fisioterapeuta","terapeuta",
    "psicólogo","psicanálise","terapia ocupacional","acupuntura","quiropraxia",
    // odonto
    "dentista","odontologia","ortodontia","aparelho dentário","limpeza dental",
    "extração","canal","coroa","implante","clareamento","faceta",
    // academias e bem-estar
    "academia","gym","smartfit","bluefit","bodytech","crossfit","pilates","yoga",
    "natação","personal trainer","musculação","spinning","zumba","dança",
    // plano de saúde
    "plano de saude","plano saúde","unimed","amil","bradesco saude","sulamerica",
    "hapvida","notredame","intermédica","porto seguro saude","careplus",
  ],

  lazer: [
    // entretenimento
    "cinema","teatro","show","concert","festival","ingresso","ticketmaster",
    "sympla","eventbrite","uhuu","bilheteria","ingressorapido","blueticket",
    // games e digital
    "jogo","game","steam","playstation","xbox","nintendo","epic games","origin",
    "battle.net","nuuvem","g2a","humble bundle","app store","google play",
    "in-app purchase","dlc","expansão","assinatura jogo",
    // viagem
    "viagem","hotel","pousada","hostel","airbnb","booking","trivago","expedia",
    "decolar","cvc","latam","gol","azul","avianca","passagem aérea",
    "mala","bagagem","passaporte","seguro viagem","chip internacional",
    // turismo e parques
    "parque","hopi hari","beto carrero","beach park","thermas","aquapark",
    "zoológico","aquário","museu","exposição","galeria","show de mágica",
    // passeio e saída
    "passeio","balada","boate","pub","karaokê","escape room","laser game",
    "bowling","sinuca","fliperama","parque de diversões","roda gigante",
    // hobbies
    "fotografia","instrumentos","guitarra","violão","teclado","bateria","aula música",
    "livro lazer","hq","mangá","livraria cultura","fnac","saraiva",
    "pintura hobby","artesanato","bordado","costura hobby","tricô",
    // esportes
    "futebol","vôlei","basquete","tênis","paddle","squash","surf","skate",
    "escalada","trilha","ciclismo","corrida","maratona","natação lazer",
    "equitação","golfe","paintball","kart","off-road",
    // pet lazer
    "parque dog","hotel pet","daycare pet","adestrador","pet fun",
  ],

  educação: [
    // instituições
    "escola","colégio","faculdade","universidade","instituto","curso técnico",
    "pós-graduação","mestrado","doutorado","extensão","ead","ensino médio",
    "ensino fundamental","creche","berçário","pré-escola",
    // mensalidades e taxas
    "mensalidade","anuidade","matrícula","rematrícula","taxa escolar",
    "taxa universitária","vestibular","fuvest","enem","inscrição prova",
    // cursos online
    "udemy","alura","coursera","edx","linkedin learning","domestika","hotmart",
    "kiwify","eduzz","lastlink","skillshare","masterclass","pluralsight",
    "rocketseat","dio","descomplica","stoodi","qconcursos","estratégia concursos",
    // idiomas
    "inglês","espanhol","francês","alemão","italiano","mandarim","japonês",
    "cursinho idioma","wizard","fisk","ccaa","cultura inglesa","babilônia",
    "berlitz","open english","preply","italki","duolingo","busuu",
    // material escolar
    "material escolar","livro didático","apostila","caderno","caneta","lápis",
    "mochila escolar","estojo","régua","compasso","calculadora","pen drive",
    "papel","impressão","encadernação","plastificação","livros","livraria",
    // tecnologia educacional
    "tablet escola","notebook estudo","microsoft office","adobe","autocad",
    "sofware educacional","plataforma ead","canvas","moodle",
    // outros
    "cursinho","pré-vestibular","reforço","aula particular","tutoria",
    "intercâmbio","programa de intercâmbio","vistos estudo","inscrição curso",
    "certificação","exame certificação","oab","crm","crea","crc",
  ],

  vestuário: [
    // roupas em geral
    "roupa","roupas","vestuário","vestuario","moda","look","outfit",
    "camiseta","camisa","polo","social","blusa","regata","top",
    "calça","jeans","legging","bermuda","shorts","saia","vestido",
    "blazer","terno","paletó","smoking","jaqueta","casaco","sobretudo",
    "moletom","agasalho","pijama","roupa íntima","cueca","sutiã","calcinha",
    // calçados
    "calçado","sapato","tênis","sapatilha","sandália","chinelo","rasteira",
    "bota","coturno","mocassim","oxford","salto alto","plataforma",
    // acessórios
    "bolsa","mochila","carteira","cinto","relógio","óculos","joalheria",
    "bijuteria","anel","brinco","colar","pulseira","chapéu","boné","lenço",
    "gravata","suspensório","meias","luvas","cachecol","gorro",
    // lojas e marcas
    "zara","hm","renner","riachuelo","cea","forever 21","shein","farm",
    "animale","arezzo","vans","all star","converse","nike","adidas","puma",
    "lacoste","tommy","calvin klein","guess","le lis blanc","shoulder",
    "amaro","dafiti","netshoes","brooksfield","forum","ellus",
    // serviços de roupa
    "alfaiate","costureira","conserto roupa","ajuste roupa","lavanderia",
    "tintoria","dry clean","passadeira","confecção","uniforme","bordado",
    // compras online
    "shopee","amazon moda","magalu moda","americanas moda","mercado livre roupa",
  ],

  investimento: [
    "investimento","aplicação","aporte","aporte mensal","reserva",
    "tesouro direto","tesouro selic","tesouro ipca","ntn-b","lft","ltn",
    "cdb","lci","lca","cri","cra","debênture","fundo imobiliário","fii",
    "ações","bolsa","b3","bovespa","ibovespa","dividendos","jcp","rendimento",
    "fundo de investimento","fundo multimercado","fundo renda fixa",
    "fundo ações","fundo cambial","fundo previdência","pgbl","vgbl",
    "previdência privada","aposentadoria privada","inss","previdência pública",
    "cripto","bitcoin","ethereum","stablecoin","usdt","defi","nft",
    "corretora","xp","clear","rico","modal","btg","avenue","inter","nubank",
    "itaú corretora","bradesco corretora","santander corretora",
    "ted investimento","pix investimento","custódia","emolumentos","come cotas",
    "imposto renda investimento","darf","carnê leão",
    "crowdfunding","startup investimento","angel","venture capital",
    "ouro","dólar","euro","câmbio","remessa internacional",
    "imóvel","financiamento","consórcio","fundo imobiliário","aluguel recebido",
  ],
};

// ── CATEGORIAS SUGERIDAS PARA FUTURAS ADIÇÕES ────────────────────────────────
// Sugestões que o usuário pode adicionar como categoria customizada:
// "animais domésticos" → pet, vet, ração, banho, vacina
// "beleza"            → salão, barbearia, manicure, estética, cosméticos
// "tecnologia"        → celular novo, notebook, acessórios tech, suporte
// "saúde mental"      → psicólogo, terapia, retiro, meditação, app mental
// "presentes e datas" → aniversário, natal, dia dos pais, casamento, flores
// "assinaturas"       → apps, serviços recorrentes separados da moradia
// "viagens"           → separado do lazer para controle de viagens específicas

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

// ── PERSISTÊNCIA ──────────────────────────────────────────────────────────────
export function loadCats() {
  try {
    const cats   = JSON.parse(localStorage.getItem("sf_cats")        || "null");
    const colors = JSON.parse(localStorage.getItem("sf_cat_colors")  || "null");
    return {
      cats:   cats   || [...BASE_CATS],
      colors: colors || {...BASE_COLORS},
    };
  } catch {
    return { cats: [...BASE_CATS], colors: {...BASE_COLORS} };
  }
}

export function saveCats(cats, colors) {
  localStorage.setItem("sf_cats",        JSON.stringify(cats));
  localStorage.setItem("sf_cat_colors",  JSON.stringify(colors));
}

// ── RECEITAS (entradas) ───────────────────────────────────────────────────────
export const INCOME_TYPES = [
  "salário","freelance","aluguel recebido","investimento","dividendos",
  "bônus","comissão","pensão","benefício","reembolso","transferência","outros",
];

export const INCOME_COLOR = "#00e676";
