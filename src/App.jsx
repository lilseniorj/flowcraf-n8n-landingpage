import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { getWorkflows } from "./services/workflows";
import { WORKFLOWS } from "./data/seed";

import Landing from "./pages/Landing";
import Login from "./pages/admin/Login";
import AdminLayout from "./pages/admin/Layout";
import WorkflowList from "./pages/admin/WorkflowList";
import WorkflowForm from "./pages/admin/WorkflowForm";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <span style={{ color: "var(--fg-3)", fontFamily: "var(--mono)", fontSize: 13 }}>Cargando…</span>
    </div>
  );

  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />;

  return children;
}

function LandingPage() {
  const [workflows, setWorkflows] = useState(WORKFLOWS);

  useEffect(() => {
    getWorkflows()
      .then(setWorkflows)
      .catch(console.error);
  }, []);

  return <Landing workflows={workflows} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/admin/login" element={<Login />} />

        <Route path="/admin" element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }>
          <Route index element={<WorkflowList />} />
          <Route path="nuevo" element={<WorkflowForm />} />
          <Route path="editar/:id" element={<WorkflowForm />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
