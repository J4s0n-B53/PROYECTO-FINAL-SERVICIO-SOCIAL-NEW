import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Ofertas from './pages/Ofertas';
import Inscripciones from './pages/Inscripciones';
import Usuarios from './pages/Usuarios';
import Acerca from './pages/Acerca';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--text2)' }}>Cargando...</div>;
  if (!user || user.rol !== 'admin') return <Navigate to="/login" replace />;
  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<RootRedirect />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="ofertas" element={<Ofertas />} />
            <Route path="historial-ofertas" element={<Ofertas historial />} />
            <Route path="papelera-ofertas" element={<Ofertas papelera />} />
            <Route path="inscripciones" element={<Inscripciones />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="acerca" element={<Acerca />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
