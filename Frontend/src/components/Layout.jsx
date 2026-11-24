import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_MENU = [
  { to: '/dashboard', label: 'Dashboard', icon: '\u{1F4CA}' },
  { to: '/ofertas', label: 'Ofertas', icon: '\u{1F4BC}' },
  { to: '/historial-ofertas', label: 'Historial de ofertas', icon: '\u{1F5C2}\uFE0F' },
  { to: '/papelera-ofertas', label: 'Papelera', icon: '\u{1F5D1}\uFE0F' },
  { to: '/inscripciones', label: 'Inscripciones', icon: '\u{1F4CB}' },
  { to: '/usuarios', label: 'Usuarios', icon: '\u{1F465}' },
  { to: '/acerca', label: 'Sobre nosotros', icon: '\u2139\uFE0F' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="app-shell" style={{ display:'flex', flexDirection:'column', height:'100vh' }}>
      <header className="app-header" style={{
        height:56, background:'#0A1B4E', display:'flex', alignItems:'center',
        padding:'0 28px', gap:14, flexShrink:0, position:'sticky', top:0, zIndex:100
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <img src="/logo-uso.png" alt="Logo USO" style={{ width:30, height:30, objectFit:'contain', display:'block' }} />
          <span style={{ fontWeight:800, fontSize:17, color:'#fff', letterSpacing:-.5 }}>
            SSE<span style={{ color:'#6fe0b8' }}>.</span>USO
          </span>
        </div>
        <div style={{ flex:1 }} />
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:32, height:32, flexShrink:0, boxSizing:'border-box', borderRadius:'50%', background:'#1e3d8a', color:'#6fe0b8',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, lineHeight:1, textAlign:'center',
            fontWeight:700, border:'2px solid rgba(111,224,184,.35)'
          }}>MT</div>
          <span className="topbar-name" style={{ fontSize:13, color:'rgba(255,255,255,0.80)', fontWeight:500 }}>
            Ing. Mónica Margarita Torres Linares
          </span>
        </div>
        <button onClick={handleLogout} style={{
          background:'none', border:'1px solid rgba(255,255,255,0.25)',
          color:'rgba(255,255,255,0.75)', borderRadius:6, padding:'5px 14px',
          fontFamily:'inherit', fontSize:12, cursor:'pointer', transition:'background .15s'
        }}>Salir</button>
      </header>

      <div className="app-workspace" style={{ display:'flex', flex:1, overflow:'hidden' }}>
        <nav className="app-nav" aria-label="Menú de administración" style={{
          width:220, flexShrink:0, background:'#fff', borderRight:'1px solid rgba(10,27,78,.10)',
          padding:'20px 10px', overflowY:'auto'
        }}>
          <div className="nav-heading" style={{
            fontSize:10, fontWeight:700, color:'#aab1c8', letterSpacing:1.2,
            textTransform:'uppercase', padding:'0 10px', marginBottom:10
          }}>Administración</div>
          {ADMIN_MENU.map(item => (
            <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:10, padding:'9px 10px',
              borderRadius:8, marginBottom:2, fontSize:13, textDecoration:'none',
              color:isActive ? '#0A1B4E' : '#6b7593',
              background:isActive ? '#e8edf8' : 'transparent', fontWeight:isActive ? 600 : 400,
              transition:'background .15s, color .15s'
            })} className="nav-link">
              <span style={{ width:16, fontSize:15, opacity:.85, textAlign:'center', flexShrink:0 }}>{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <main className="app-main" style={{ flex:1, overflowY:'auto', padding:'32px 36px', background:'#f0f2f7' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
