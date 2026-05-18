import { useState, useEffect, useCallback } from "react";
import { CSS, loadCats, decodeToken } from "./constants";
import { Sidebar, DeleteModal } from "./components/UI";
import { fmt, fmtD } from "./constants";
import Login       from "./components/Login";
import Dashboard   from "./components/Dashboard";
import Budget      from "./components/Budget";
import Transactions from "./components/Transactions";
import NewTransaction from "./components/NewTransaction";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [token, setToken]   = useState(() => localStorage.getItem("sf_token") || "");
  const [email, setEmail]   = useState(() => localStorage.getItem("sf_email") || "");
  const [page, setPage]     = useState("dashboard");
  const [txs, setTxs]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]           = useState(false);
  const [cats, setCats]     = useState(() => loadCats().cats);
  const [colors, setColors] = useState(() => loadCats().colors);

  const handleLogin = useCallback((t, e) => {
    setToken(t); setEmail(e);
    localStorage.setItem("sf_token", t);
    localStorage.setItem("sf_email", e);
  }, []);

  const handleLogout = useCallback(() => {
    setToken(""); setEmail("");
    localStorage.removeItem("sf_token");
    localStorage.removeItem("sf_email");
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const userId = decodeToken(token);
      const url = userId
        ? `${API_URL}/api/v1/transactions/?user_id=${userId}`
        : `${API_URL}/api/v1/transactions/`;
      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok)           setTxs(await r.json());
      else if (r.status === 401) handleLogout();
    } catch {}
    setLoading(false);
  }, [token, handleLogout]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const r = await fetch(`${API_URL}/api/v1/transactions/${confirmDelete.id}`, { method: "DELETE" });
      if (r.ok) { await load(); setConfirmDelete(null); }
    } catch {}
    setDeleting(false);
  }

  if (!token) {
    return <><style>{CSS}</style><Login onLogin={handleLogin} /></>;
  }

  return (
    <>
      <style>{CSS}</style>
      <div style={{ display: "flex", height: "100vh" }}>
        <Sidebar page={page} setPage={setPage} email={email} onLogout={handleLogout} />
        <main style={{ flex: 1, overflowY: "auto" }}>
          {page === "dashboard"    && <Dashboard txs={txs} loading={loading} colors={colors} onDeleteTx={setConfirmDelete} />}
          {page === "budget"       && <Budget txs={txs} cats={cats} colors={colors} />}
          {page === "transactions" && <Transactions txs={txs} cats={cats} colors={colors} onDeleteTx={setConfirmDelete} />}
          {page === "new"          && <NewTransaction onSaved={load} cats={cats} setCats={setCats} colors={colors} setColors={setColors} />}
        </main>
      </div>
      <DeleteModal tx={confirmDelete} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} loading={deleting} fmt={fmt} fmtD={fmtD} />
    </>
  );
}
