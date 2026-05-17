# 🐍 SnakeFin — Agente Financeiro Inteligente via WhatsApp

> Projeto acadêmico com potencial de produto real (SaaS). Sistema que permite registrar gastos enviando mensagens de texto, áudio ou imagens de comprovantes pelo WhatsApp, com categorização automática por IA, dashboard web em tempo real e geração de insights financeiros.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Stack Tecnológica](#stack-tecnológica)
- [Pré-requisitos](#pré-requisitos)
- [Instalação Completa](#instalação-completa)
- [Configuração das Variáveis de Ambiente](#configuração-das-variáveis-de-ambiente)
- [Subindo os Serviços](#subindo-os-serviços)
- [Configuração do n8n](#configuração-do-n8n)
- [Configuração do WhatsApp (Evolution API)](#configuração-do-whatsapp-evolution-api)
- [Dashboard Web (React)](#dashboard-web-react)
- [Testando o Sistema](#testando-o-sistema)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Endpoints da API](#endpoints-da-api)
- [Solução de Problemas](#solução-de-problemas)

---

## Visão Geral

O SnakeFin é um sistema SaaS de controle financeiro pessoal e empresarial que funciona diretamente pelo WhatsApp. O usuário envia uma mensagem como _"Gastei 45 reais no iFood hoje"_ e o sistema extrai automaticamente o valor, a data e a categoria usando IA, salva no banco de dados e responde confirmando o registro. Um dashboard web exibe gráficos, histórico e análises em tempo real.

**Funcionalidades implementadas:**
- Recebimento de mensagens via WhatsApp (texto, imagem e áudio)
- Extração de dados financeiros com IA (Groq — gratuito)
- Categorização automática de gastos
- Confirmação instantânea via WhatsApp
- Dashboard com gráficos, histórico e filtros
- Controle de orçamento por categoria
- Inserção manual via dashboard
- Sistema de autenticação JWT
- Controle de planos (free/premium)

---

## Arquitetura

```
WhatsApp (usuário)
      ↓
Evolution API  →  n8n (webhook)  →  FastAPI (backend)
                                          ↓
                                    Groq AI (extração)
                                          ↓
                                      MySQL (dados)
                                          ↓
                                   Dashboard React
```

Todos os serviços rodam em containers Docker orquestrados pelo Docker Compose.

---

## Stack Tecnológica

| Camada | Tecnologia | Descrição |
|--------|-----------|-----------|
| Backend | Python + FastAPI | API REST principal |
| Automação | n8n | Orquestração de fluxos |
| WhatsApp | Evolution API | Integração com WhatsApp Business |
| IA | Groq (llama-3.1-8b) | Extração de dados — gratuito |
| Banco de dados | MySQL 8.0 | Persistência dos dados |
| Dashboard | React + Vite | Interface web |
| Infraestrutura | Docker + Docker Compose | Containerização |

---

## Pré-requisitos

Instale os itens abaixo **antes** de qualquer outro passo. Verifique com os comandos indicados.

### 1. Docker Desktop

Download: https://www.docker.com/products/docker-desktop

Após instalar, abra o Docker Desktop e aguarde iniciar completamente.

```bash
# Verificar instalação
docker --version
docker compose version
```

Saída esperada:
```
Docker version 24.x.x
Docker Compose version v2.x.x
```

### 2. Git

Download: https://git-scm.com/downloads

```bash
git --version
# git version 2.x.x
```

### 3. Node.js 18+ (para o dashboard React)

Download: https://nodejs.org (versão LTS)

```bash
node --version
# v18.x.x ou superior

npm --version
# 9.x.x ou superior
```

### 4. Chave de API Groq (gratuita)

1. Acesse https://console.groq.com
2. Crie uma conta gratuita
3. Vá em **API Keys** → **Create API Key**
4. Copie a chave (começa com `gsk_...`)

> O Groq oferece 14.400 requisições gratuitas por dia — mais que suficiente para uso e demonstração.

---

## Instalação Completa

### Passo 1 — Clonar o repositório

```bash
git clone https://github.com/Renan01032/saas-fin.git
cd saas-fin
```

### Passo 2 — Criar o arquivo de variáveis de ambiente

Copie o arquivo de exemplo:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Mac / Linux
cp .env.example .env
```

Abra o arquivo `.env` em qualquer editor de texto e preencha os valores (veja a seção abaixo).

### Passo 3 — Gerar a chave JWT

Execute no terminal para gerar uma chave segura:

```bash
# Windows (PowerShell) — Python já vem instalado com o sistema ou instale em python.org
python -c "import secrets; print(secrets.token_hex(32))"

# Mac / Linux
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Copie o resultado e cole no campo `JWT_SECRET_KEY` do arquivo `.env`.

---

## Configuração das Variáveis de Ambiente

Abra o arquivo `.env` e preencha conforme abaixo:

```env
# ── BANCO DE DADOS ─────────────────────────────────────────────
DB_HOST=mysql
DB_PORT=3306
DB_NAME=saas_fin
DB_USER=root
DB_PASSWORD=snakefin2024          # pode trocar por qualquer senha

# ── INTELIGÊNCIA ARTIFICIAL (Groq — gratuito) ──────────────────
GROQ_API_KEY=gsk_...              # chave gerada em console.groq.com
OPENAI_API_KEY=nao-usado          # deixar assim (não é necessário)

# ── AUTENTICAÇÃO JWT ───────────────────────────────────────────
JWT_SECRET_KEY=cole_aqui_a_chave_gerada_no_passo_3
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60

# ── SEGREDO INTERNO n8n ────────────────────────────────────────
N8N_WEBHOOK_SECRET=n8n-interno-saas2024

# ── EVOLUTION API (WhatsApp) ───────────────────────────────────
EVOLUTION_API_KEY=snakefin-evolution-key
EVOLUTION_INSTANCE=snakefin

# ── GOOGLE DRIVE (opcional — para comprovantes) ────────────────
GOOGLE_DRIVE_FOLDER_ID=
GOOGLE_CREDENTIALS_JSON=credentials.json
```

> **Atenção:** O arquivo `.env` nunca deve ser commitado no GitHub. Ele já está listado no `.gitignore`.

---

## Subindo os Serviços

Com o Docker Desktop aberto e rodando, execute no terminal dentro da pasta do projeto:

```bash
docker compose up -d --build
```

O comando vai baixar as imagens necessárias e iniciar todos os containers. Na primeira execução pode levar 5 a 10 minutos dependendo da conexão.

### Verificar se tudo subiu corretamente

```bash
docker compose ps
```

Saída esperada:

```
NAME              STATUS
saas_mysql        Up (healthy)
saas_backend      Up
saas_n8n          Up
saas_streamlit    Up
saas_evolution    Up
```

Todos devem estar **Up**. Se algum aparecer como **Restarting** ou **Exit**, veja a seção [Solução de Problemas](#solução-de-problemas).

### Serviços disponíveis

| Serviço | URL | Descrição |
|---------|-----|-----------|
| API Backend | http://localhost:8000/docs | Documentação interativa (Swagger) |
| n8n | http://localhost:5678 | Orquestrador de automações |
| Evolution API | http://localhost:8080 | Gateway WhatsApp |
| Dashboard Streamlit | http://localhost:8501 | Dashboard alternativo |

---

## Configuração do n8n

### 1. Criar conta admin

Acesse http://localhost:5678 e preencha:
- **Email:** qualquer email válido (ex: admin@snakefin.com)
- **First Name:** Admin
- **Last Name:** SnakeFin
- **Password:** mínimo 8 caracteres com número e maiúscula

### 2. Criar o workflow de integração com WhatsApp

1. Clique em **"Start from scratch"**
2. Renomeie o workflow para **"SnakeFin — WhatsApp"** (clique no nome no topo)

#### Nó 1 — Webhook (entrada das mensagens)

1. Clique no **+** e busque **"Webhook"**
2. Configure:
   - **HTTP Method:** `POST`
   - **Path:** `whatsapp-messages`
   - **Respond:** `Using 'Respond to Webhook' Node`
3. Salve as configurações

#### Nó 2 — HTTP Request (chama o backend)

1. Clique no **+** após o Webhook
2. Busque **"HTTP Request"**
3. Configure:
   - **Method:** `POST`
   - **URL:** `http://saas_backend:8000/api/v1/messages/process`
   - **Send Body:** ativado
   - **Body Content Type:** `JSON`
   - **JSON:**
   ```json
   {
     "phone_number": "={{ $json.body.phone_number }}",
     "message_text": "={{ $json.body.message_text }}",
     "message_type": "={{ $json.body.message_type }}",
     "n8n_secret": "n8n-interno-saas2024"
   }
   ```

#### Nó 3 — Respond to Webhook (resposta ao usuário)

1. Clique no **+** após o HTTP Request
2. Busque **"Respond to Webhook"**
3. Configure:
   - **Respond With:** `First Incoming Item's Data`

#### Ativar o workflow

Clique em **"Publish"** no canto superior direito. O status deve mudar para **"Published"**.

### 3. Testar o webhook

Execute no terminal:

```bash
# Windows (PowerShell)
Invoke-WebRequest -Uri "http://localhost:5678/webhook/whatsapp-messages" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"phone_number":"5511999999999","message_text":"Gastei 50 reais no mercado hoje","message_type":"text"}'

# Mac / Linux
curl -X POST http://localhost:5678/webhook/whatsapp-messages \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"5511999999999","message_text":"Gastei 50 reais no mercado hoje","message_type":"text"}'
```

Resposta esperada:
```json
{
  "reply": "✅ *Registrado!*\n💰 R$50.00 em Alimentação\n📝 mercado\n📅 11/05/2026",
  "action": "saved",
  "transaction_id": "uuid-aqui"
}
```

---

## Configuração do WhatsApp (Evolution API)

### 1. Acessar o painel da Evolution API

Acesse http://localhost:8080 e use a API Key configurada no `.env` (`EVOLUTION_API_KEY`).

### 2. Criar instância e conectar

Execute no terminal:

```bash
# Windows (PowerShell)
Invoke-WebRequest -Uri "http://localhost:8080/instance/create" `
  -Method POST `
  -Headers @{"apikey"="snakefin-evolution-key"; "Content-Type"="application/json"} `
  -Body '{"instanceName":"snakefin","qrcode":true}'

# Mac / Linux
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: snakefin-evolution-key" \
  -H "Content-Type: application/json" \
  -d '{"instanceName":"snakefin","qrcode":true}'
```

### 3. Escanear o QR Code

```bash
# Windows (PowerShell)
Invoke-WebRequest -Uri "http://localhost:8080/instance/connect/snakefin" `
  -Headers @{"apikey"="snakefin-evolution-key"}

# Mac / Linux
curl http://localhost:8080/instance/connect/snakefin \
  -H "apikey: snakefin-evolution-key"
```

A resposta contém um QR Code em base64. Acesse http://localhost:8080/manager para visualizá-lo graficamente e escaneie com o WhatsApp Business.

### 4. Configurar webhook na Evolution API

Após conectar o WhatsApp, configure o webhook para enviar mensagens ao n8n:

```bash
# Windows (PowerShell)
Invoke-WebRequest -Uri "http://localhost:8080/webhook/set/snakefin" `
  -Method POST `
  -Headers @{"apikey"="snakefin-evolution-key"; "Content-Type"="application/json"} `
  -Body '{
    "url": "http://saas_n8n:5678/webhook/whatsapp-messages",
    "webhook_by_events": false,
    "events": ["MESSAGES_UPSERT"]
  }'

# Mac / Linux
curl -X POST http://localhost:8080/webhook/set/snakefin \
  -H "apikey: snakefin-evolution-key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://saas_n8n:5678/webhook/whatsapp-messages",
    "webhook_by_events": false,
    "events": ["MESSAGES_UPSERT"]
  }'
```

> A partir deste momento, qualquer mensagem enviada para o número conectado será processada automaticamente pelo sistema.

---

## Dashboard Web (React)

### Instalação

```bash
cd frontend/react
npm install
```

### Rodar em desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:5173

### Criar conta e fazer login

1. Abra http://localhost:5173
2. Clique em **"Criar conta"**
3. Preencha email, WhatsApp e senha
4. Faça login

O dashboard exibe automaticamente todas as transações registradas via WhatsApp e pelo formulário manual.

### Build para produção

```bash
npm run build
# Arquivos gerados em frontend/react/dist/
```

---

## Testando o Sistema

### Teste 1 — API de saúde

```bash
# Windows
Invoke-WebRequest -Uri "http://localhost:8000/health"

# Mac / Linux
curl http://localhost:8000/health
```

Resposta: `{"status":"ok"}`

### Teste 2 — Criar usuário

```bash
# Windows (PowerShell)
Invoke-WebRequest -Uri "http://localhost:8000/api/v1/users/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"teste@snakefin.com","password":"Senha123!","whatsapp_number":"5511999999999"}'

# Mac / Linux
curl -X POST http://localhost:8000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@snakefin.com","password":"Senha123!","whatsapp_number":"5511999999999"}'
```

### Teste 3 — Processar mensagem com IA

```bash
# Windows (PowerShell)
Invoke-WebRequest -Uri "http://localhost:8000/api/v1/messages/process" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"phone_number":"5511999999999","message_text":"Gastei 75 reais no supermercado hoje","message_type":"text","n8n_secret":"n8n-interno-saas2024"}'

# Mac / Linux
curl -X POST http://localhost:8000/api/v1/messages/process \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"5511999999999","message_text":"Gastei 75 reais no supermercado hoje","message_type":"text","n8n_secret":"n8n-interno-saas2024"}'
```

### Teste 4 — Ver transações no banco

```bash
docker exec saas_mysql mysql -u root -psnakefin2024 \
  -e "SELECT amount, category, description, transaction_date, source FROM saas_fin.transactions;"
```

---

## Estrutura do Projeto

```
saas-fin/
├── .env.example                    # Modelo de variáveis de ambiente
├── .gitignore
├── docker-compose.yml              # Orquestração de todos os serviços
│
├── backend/                        # API FastAPI (Python)
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py                 # Entrada da aplicação
│       ├── api/v1/
│       │   ├── messages.py         # Endpoint de processamento de mensagens
│       │   ├── transactions.py     # CRUD de transações
│       │   └── users.py            # Autenticação e cadastro
│       ├── core/
│       │   ├── config.py           # Configurações via .env
│       │   └── security.py         # JWT e hashing de senha
│       ├── db/
│       │   └── database.py         # Conexão SQLAlchemy
│       ├── models/
│       │   ├── user.py             # Modelo de usuário
│       │   └── transaction.py      # Modelo de transação
│       ├── schemas/
│       │   └── transaction.py      # Validação Pydantic
│       └── services/
│           ├── ai_service.py       # Integração com Groq
│           └── user_service.py     # Lógica de planos e limites
│
├── frontend/
│   ├── react/                      # Dashboard principal (React + Vite)
│   │   ├── src/App.jsx             # Aplicação completa
│   │   └── package.json
│   └── streamlit/                  # Dashboard alternativo (Python)
│       ├── app.py
│       ├── Dockerfile
│       └── requirements.txt
│
└── infra/
    └── mysql/
        └── init.sql                # Schema inicial do banco
```

---

## Endpoints da API

Acesse a documentação interativa completa em http://localhost:8000/docs

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Status da API |
| POST | `/api/v1/users/register` | Criar novo usuário |
| POST | `/api/v1/users/login` | Login e geração de token JWT |
| POST | `/api/v1/messages/process` | Processar mensagem com IA |
| GET | `/api/v1/transactions/` | Listar transações |

### Exemplo de uso do token JWT

Após o login, use o token retornado no header das requisições:

```bash
# Mac / Linux
TOKEN="eyJhbGciOi..."

curl http://localhost:8000/api/v1/transactions/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## Solução de Problemas

### Container MySQL "unhealthy"

O volume pode estar corrompido com dados de uma instalação anterior.

```bash
docker compose down
docker volume rm saas-fin_mysql_data
docker compose up -d
```

### Backend não inicia (erro de importação)

Verifique os logs para ver o erro específico:

```bash
docker logs saas_backend --tail 30
```

Se for erro de módulo não encontrado, rebuilde sem cache:

```bash
docker compose build backend --no-cache
docker compose up -d backend
```

### n8n não recebe mensagens

1. Confirme que o workflow está **Published** (não apenas salvo)
2. Verifique a URL exata do webhook no nó Webhook → aba "Production URL"
3. Use exatamente essa URL no comando de teste

### Erro de CORS no dashboard React

Abra `backend/app/main.py` e adicione a origem:

```python
allow_origins=["http://localhost:5173", "http://localhost:8000"],
```

O uvicorn recarrega automaticamente — não precisa reiniciar.

### Groq retorna rate limit

O plano gratuito tem limite de requisições por minuto. Aguarde 60 segundos e tente novamente. Para uso intensivo, crie uma conta em https://groq.com para aumentar os limites.

### Reiniciar todos os serviços

```bash
docker compose restart
```

### Ver logs em tempo real

```bash
# Todos os serviços
docker compose logs -f

# Só o backend
docker logs saas_backend -f

# Só o n8n
docker logs saas_n8n -f
```

### Parar tudo

```bash
docker compose down
```

### Limpar tudo (containers, volumes e imagens)

```bash
docker compose down -v --rmi all
```

> **Atenção:** O comando acima apaga todos os dados do banco. Use apenas se quiser um reset completo.

---

## Informações do Projeto

**Desenvolvido por:** Renan Alves, Matheus Domeneghetti, Veronica Neves, Petterson Machado, e Natan Gleison 
**Curso:** Análise e Desenvolvimento de Sistema 
**Instituição:** Universidade Cruzeiro do Sul  
**Ano:** 2026  

**Tecnologias principais:** Python, FastAPI, React, MySQL, Docker, n8n, Groq AI, Evolution API

---

*SnakeFin — Controle financeiro inteligente via WhatsApp*