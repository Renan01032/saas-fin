import streamlit as st
import requests
import pandas as pd
import plotly.express as px
from datetime import datetime
import os

API_URL = os.getenv("API_URL", "http://localhost:8000")

st.set_page_config(
    page_title="SaaS Fin",
    page_icon="💰",
    layout="wide",
    initial_sidebar_state="expanded"
)

# CSS customizado
st.markdown("""
<style>
    .metric-card {
        background: #f8f9fa;
        border-radius: 10px;
        padding: 20px;
        border-left: 4px solid #00c853;
    }
    .stMetric { background: #f8f9fa; border-radius: 8px; padding: 10px; }
</style>
""", unsafe_allow_html=True)

# LOGIN
if "token" not in st.session_state:
    st.title("💰 SaaS Fin")
    st.subheader("Seu agente financeiro inteligente")
    st.divider()

    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        tab_login, tab_register = st.tabs(["Entrar", "Criar conta"])

        with tab_login:
            email = st.text_input("Email", key="login_email")
            password = st.text_input("Senha", type="password", key="login_pass")
            if st.button("Entrar", use_container_width=True, type="primary"):
                try:
                    resp = requests.post(
                        f"{API_URL}/api/v1/users/login",
                        json={"email": email, "password": password}
                    )
                    if resp.status_code == 200:
                        st.session_state.token = resp.json()["access_token"]
                        st.session_state.email = email
                        st.rerun()
                    else:
                        st.error("Email ou senha incorretos")
                except Exception as e:
                    st.error(f"Erro de conexão: {e}")

        with tab_register:
            reg_email = st.text_input("Email", key="reg_email")
            reg_whats = st.text_input("WhatsApp (com DDD)", placeholder="5511999999999")
            reg_pass = st.text_input("Senha", type="password", key="reg_pass")
            if st.button("Criar conta", use_container_width=True):
                try:
                    resp = requests.post(
                        f"{API_URL}/api/v1/users/register",
                        json={"email": reg_email, "password": reg_pass, "whatsapp_number": reg_whats}
                    )
                    if resp.status_code == 200:
                        st.success("Conta criada! Faça login.")
                    else:
                        st.error(resp.json().get("detail", "Erro ao criar conta"))
                except Exception as e:
                    st.error(f"Erro: {e}")
    st.stop()

# DASHBOARD PRINCIPAL
headers = {"Authorization": f"Bearer {st.session_state.token}"}

# Sidebar
with st.sidebar:
    st.title("💰 SaaS Fin")
    st.caption(f"Olá, {st.session_state.get('email', 'usuário')}")
    st.divider()
    pagina = st.radio("Menu", ["📊 Dashboard", "📋 Transações", "➕ Nova transação"])
    st.divider()
    if st.button("Sair"):
        del st.session_state.token
        st.rerun()

# Buscar transações
@st.cache_data(ttl=30)
def get_transactions():
    try:
        resp = requests.get(f"{API_URL}/api/v1/transactions/", headers=headers)
        if resp.status_code == 200:
            return pd.DataFrame(resp.json())
        return pd.DataFrame()
    except:
        return pd.DataFrame()

df = get_transactions()

# ── PÁGINA: DASHBOARD ──
if pagina == "📊 Dashboard":
    st.title("📊 Dashboard Financeiro")

    if df.empty:
        st.info("Nenhuma transação ainda. Envie uma mensagem no WhatsApp ou adicione manualmente!")
    else:
        df["amount"] = pd.to_numeric(df["amount"])
        df["transaction_date"] = pd.to_datetime(df["transaction_date"])

        # Filtro de mês
        now = datetime.now()
        df_mes = df[
            (df["transaction_date"].dt.month == now.month) &
            (df["transaction_date"].dt.year == now.year)
        ]

        # Métricas
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("💸 Total do mês", f"R$ {df_mes['amount'].sum():.2f}")
        col2.metric("📝 Transações", len(df_mes))
        col3.metric("📈 Maior gasto", f"R$ {df_mes['amount'].max():.2f}" if not df_mes.empty else "R$ 0,00")
        col4.metric("📉 Menor gasto", f"R$ {df_mes['amount'].min():.2f}" if not df_mes.empty else "R$ 0,00")

        st.divider()

        col_pizza, col_barra = st.columns(2)

        with col_pizza:
            st.subheader("Por categoria")
            fig_pizza = px.pie(
                df_mes.groupby("category")["amount"].sum().reset_index(),
                values="amount",
                names="category",
                hole=0.4,
                color_discrete_sequence=px.colors.qualitative.Set3
            )
            fig_pizza.update_layout(margin=dict(t=20, b=20))
            st.plotly_chart(fig_pizza, use_container_width=True)

        with col_barra:
            st.subheader("Gastos por dia")
            df_dia = df_mes.groupby(df_mes["transaction_date"].dt.day)["amount"].sum().reset_index()
            df_dia.columns = ["Dia", "Total"]
            fig_barra = px.bar(df_dia, x="Dia", y="Total", color_discrete_sequence=["#00c853"])
            fig_barra.update_layout(margin=dict(t=20, b=20))
            st.plotly_chart(fig_barra, use_container_width=True)

# ── PÁGINA: TRANSAÇÕES ──
elif pagina == "📋 Transações":
    st.title("📋 Histórico de Transações")

    if df.empty:
        st.info("Nenhuma transação encontrada.")
    else:
        df["amount"] = pd.to_numeric(df["amount"])

        # Filtros
        col1, col2 = st.columns(2)
        with col1:
            categorias = ["Todas"] + sorted(df["category"].unique().tolist())
            cat_filtro = st.selectbox("Categoria", categorias)
        with col2:
            fonte_filtro = st.selectbox("Fonte", ["Todas", "whatsapp_text", "whatsapp_image", "dashboard"])

        df_filtrado = df.copy()
        if cat_filtro != "Todas":
            df_filtrado = df_filtrado[df_filtrado["category"] == cat_filtro]
        if fonte_filtro != "Todas":
            df_filtrado = df_filtrado[df_filtrado["source"] == fonte_filtro]

        st.dataframe(
            df_filtrado[["transaction_date", "description", "category", "amount", "source"]].rename(columns={
                "transaction_date": "Data",
                "description": "Descrição",
                "category": "Categoria",
                "amount": "Valor (R$)",
                "source": "Fonte"
            }),
            use_container_width=True,
            hide_index=True
        )
        st.caption(f"Total filtrado: R$ {df_filtrado['amount'].sum():.2f}")

# ── PÁGINA: NOVA TRANSAÇÃO ──
elif pagina == "➕ Nova transação":
    st.title("➕ Nova Transação")
    st.caption("Adicione um gasto manualmente")

    with st.form("nova_tx"):
        col1, col2 = st.columns(2)
        with col1:
            valor = st.number_input("Valor (R$)", min_value=0.01, step=0.01)
            categoria = st.selectbox("Categoria", [
                "alimentação", "transporte", "moradia", "saúde",
                "lazer", "educação", "vestuário", "outros"
            ])
        with col2:
            descricao = st.text_input("Descrição")
            data = st.date_input("Data")

        submitted = st.form_submit_button("Salvar", type="primary", use_container_width=True)

        if submitted:
            try:
                resp = requests.post(
                    f"{API_URL}/api/v1/messages/process",
                    json={
                        "phone_number": "dashboard",
                        "message_text": f"Gastei {valor} reais em {descricao} categoria {categoria}",
                        "message_type": "text",
                        "n8n_secret": "n8n-interno-saas2024"
                    }
                )
                if resp.status_code == 200:
                    st.success(f"✅ Transação salva! R${valor:.2f} em {categoria}")
                    st.cache_data.clear()
                else:
                    st.error("Erro ao salvar")
            except Exception as e:
                st.error(f"Erro: {e}")