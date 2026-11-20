import { useEffect, useState } from 'react';
import api from '../services/apiClient';
import { PageHeader, TableWrap, Th, Td, Modal, Spinner, useToast, Toast, Input, Select, Btn } from '../components/UI';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [query, setQuery] = useState('');
  const [carreraFiltro, setCarreraFiltro] = useState('');
  const [horasFiltro, setHorasFiltro] = useState('');
  const [editandoHorasId, setEditandoHorasId] = useState(null);
  const [horasManuales, setHorasManuales] = useState({});
  const [savingHorasId, setSavingHorasId] = useState(null);
  const [confirmacionHoras, setConfirmacionHoras] = useState(null);
  const [estudianteEditando, setEstudianteEditando] = useState(null);
  const [estudianteEliminar, setEstudianteEliminar] = useState(null);
  const [guardandoEstudiante, setGuardandoEstudiante] = useState(false);
  const [eliminandoEstudiante, setEliminandoEstudiante] = useState(false);
  const [catalogoCarreras, setCatalogoCarreras] = useState([]);
  const [nuevo, setNuevo] = useState({nombres:'',apellidos:'',numero_expediente:'',correo_institucional:'',id_carrera:'',materias_aprobadas:'',total_materias_plan:''});
  const [planes, setPlanes] = useState({});
  const [edicionEstudiante, setEdicionEstudiante] = useState({});
  const { toast, show } = useToast();

  async function loadUsuarios() {
    try {
      const r = await api.get('/usuarios');
      setUsuarios(r.data);
      setHorasManuales(Object.fromEntries(
        r.data.map(u => [u.id_usuario, 0])
      ));
    } catch {
      show('Error al cargar usuarios','error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsuarios();
    api.get('/carreras').then(({data})=>setCatalogoCarreras(data)).catch(()=>show('No se pudo cargar el catálogo de carreras','error'));
  }, []);

  async function crearEstudiante(e) {
    e.preventDefault();
    try {
      await api.post('/usuarios', { ...nuevo, nombre_completo: `${nuevo.nombres} ${nuevo.apellidos}`.trim() });
      show('Estudiante registrado sin credenciales de acceso');
      setNuevo({nombres:'',apellidos:'',numero_expediente:'',correo_institucional:'',id_carrera:'',materias_aprobadas:'',total_materias_plan:''});
      await loadUsuarios();
    } catch(err) { show(err.response?.data?.error || 'No se pudo registrar al estudiante','error'); }
  }

  function editarHoras(u) {
    setHorasManuales(prev => ({ ...prev, [u.id_usuario]: 0 }));
    setEditandoHorasId(u.id_usuario);
  }

  function cancelarHoras(u) {
    setHorasManuales(prev => ({ ...prev, [u.id_usuario]: 0 }));
    setEditandoHorasId(null);
  }

  async function confirmarHoras(u) {
    const horas = Number(horasManuales[u.id_usuario] ?? 0);
    if (!Number.isInteger(horas) || horas <= 0 || horas > 500) {
      show('Ingresa una cantidad valida entre 1 y 500 horas', 'error');
      return;
    }

    setConfirmacionHoras({ usuario: u, horas });
  }

  async function guardarHorasConfirmadas() {
    if (!confirmacionHoras) return;

    const u = confirmacionHoras.usuario;
    const horas = confirmacionHoras.horas;

    setSavingHorasId(u.id_usuario);
    try {
      const { data } = await api.patch(`/usuarios/${u.id_usuario}/horas-manuales`, { horas_manuales: horas });
      const acreditadas = Number(data.horas_acreditadas ?? horas);
      show(data.ajustado ? `Se acreditaron ${acreditadas} horas, que era el espacio disponible` : `${acreditadas} horas acreditadas`);
      setEditandoHorasId(null);
      setConfirmacionHoras(null);
      await loadUsuarios();
    } catch (e) {
      show(e.response?.data?.error || 'Error al acreditar horas', 'error');
    } finally {
      setSavingHorasId(null);
    }
  }

  function abrirEdicionEstudiante(estudiante) {
    setEstudianteEditando(estudiante);
    setEdicionEstudiante({
      nombre_completo: estudiante.nombre_completo || '',
      numero_expediente: estudiante.numero_expediente || '',
      correo_institucional: estudiante.correo_institucional || '',
      id_carrera: String(estudiante.id_carrera || ''),
      materias_aprobadas: String(estudiante.materias_aprobadas ?? ''),
      total_materias_plan: String(estudiante.total_materias_plan ?? ''),
    });
  }

  async function guardarEdicionEstudiante(event) {
    event?.preventDefault();
    if (!estudianteEditando) return;
    setGuardandoEstudiante(true);
    try {
      await api.patch(`/usuarios/${estudianteEditando.id_estudiante}`, edicionEstudiante);
      show('Datos del estudiante actualizados');
      setEstudianteEditando(null);
      setPlanes({});
      await loadUsuarios();
    } catch (e) {
      show(e.response?.data?.error || 'No se pudieron actualizar los datos', 'error');
    } finally {
      setGuardandoEstudiante(false);
    }
  }

  async function eliminarEstudiante() {
    if (!estudianteEliminar) return;
    setEliminandoEstudiante(true);
    try {
      await api.delete(`/usuarios/${estudianteEliminar.id_estudiante}`);
      show('Estudiante y sus inscripciones eliminados');
      setEstudianteEliminar(null);
      await loadUsuarios();
    } catch (e) {
      show(e.response?.data?.error || 'No se pudo eliminar al estudiante', 'error');
    } finally {
      setEliminandoEstudiante(false);
    }
  }

  if (loading) return <Spinner />;

  const usuariosFiltrados = usuarios.filter(u => {
    const horas = Number(u.horas_acumuladas ?? u.total_horas ?? u.horas ?? 0);
    const texto = `${u.nombre_completo} ${u.correo_institucional} ${u.numero_expediente || ''}`.toLowerCase();
    const coincideBusqueda = !query || texto.includes(query.trim().toLowerCase());
    const coincideCarrera = !carreraFiltro || u.nombre_carrera === carreraFiltro;
    const coincideHoras =
      !horasFiltro ||
      (horasFiltro === 'completos' && horas >= 500) ||
      (horasFiltro === 'pendientes' && horas < 500);

    return coincideBusqueda && coincideCarrera && coincideHoras;
  });

  return (
    <>
      <PageHeader title="Estudiantes" subtitle="Registros académicos administrados por el administrador general" />
      <form className="students-create-form" onSubmit={crearEstudiante}>
        <Input required placeholder="Nombres" aria-label="Nombres" value={nuevo.nombres} onChange={e=>setNuevo({...nuevo,nombres:e.target.value})}/>
        <Input required placeholder="Apellidos" aria-label="Apellidos" value={nuevo.apellidos} onChange={e=>setNuevo({...nuevo,apellidos:e.target.value})}/>
        <Input required placeholder="Número de expediente" aria-label="Número de expediente" value={nuevo.numero_expediente} onChange={e=>setNuevo({...nuevo,numero_expediente:e.target.value})}/>
        <Input required type="email" placeholder="Correo institucional" aria-label="Correo institucional" value={nuevo.correo_institucional} onChange={e=>setNuevo({...nuevo,correo_institucional:e.target.value})}/>
        <Select required aria-label="Carrera" value={nuevo.id_carrera} onChange={e=>{const carrera=catalogoCarreras.find(c=>String(c.id_carrera)===e.target.value);setNuevo({...nuevo,id_carrera:e.target.value,total_materias_plan:carrera?.total_materias_plan??''});}}><option value="">Selecciona carrera</option>{catalogoCarreras.map(c=><option key={c.id_carrera} value={c.id_carrera}>{c.nombre_carrera}{c.nombre_facultad?` · ${c.nombre_facultad}`:' · Maestrías'}</option>)}</Select>
        <Input required type="number" min="0" placeholder="Materias aprobadas" aria-label="Materias aprobadas" value={nuevo.materias_aprobadas} onChange={e=>setNuevo({...nuevo,materias_aprobadas:e.target.value})}/>
        <Input required type="number" min="1" placeholder="Materias totales del plan" aria-label="Materias totales del plan" value={nuevo.total_materias_plan} onChange={e=>setNuevo({...nuevo,total_materias_plan:e.target.value})}/>
        <Btn type="submit" variant="accent">Registrar estudiante</Btn>
      </form>
      <div className="students-filters">
        <div className="students-search">
          <span aria-hidden="true">⌕</span>
          <Input
            id="usuarios-buscar-estudiante"
            name="usuarios-buscar-estudiante"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar estudiante..."
            className="students-search-input"
            style={{ padding:'10px 12px 10px 34px' }}
          />
        </div>
        <Select
          id="usuarios-filtro-carrera"
          name="usuarios-filtro-carrera"
          value={carreraFiltro}
          onChange={e => setCarreraFiltro(e.target.value)}
          className="students-filter-select"
        >
          <option value="">Todas las carreras</option>
          {catalogoCarreras.map(carrera => <option key={carrera.id_carrera} value={carrera.nombre_carrera}>{carrera.nombre_carrera}</option>)}
        </Select>
        <Select
          id="usuarios-filtro-horas"
          name="usuarios-filtro-horas"
          value={horasFiltro}
          onChange={e => setHorasFiltro(e.target.value)}
          className="students-filter-select"
        >
          <option value="">Todos los estudiantes</option>
          <option value="completos">Servicio social completado</option>
          <option value="pendientes">Servicio social pendiente</option>
        </Select>
      </div>
      <TableWrap minWidth={0} fixedLayout className="students-records-table">
        <thead><tr>
          <Th style={{ width:'8%' }}>Nombre</Th>
          <Th style={{ width:'6%', textAlign:'left' }}>Expediente</Th>
          <Th style={{ width:'14%' }}>Correo</Th>
          <Th style={{ width:'9%' }}>Carrera</Th>
          <Th style={{ width:'8%' }}>Facultad</Th>
          <Th style={{ width:'6%' }}>Materias</Th>
          <Th style={{ width:'4%' }}>Horas</Th>
          <Th style={{ width:'10%' }}>Acreditar horas</Th>
          <Th style={{ width:'12%' }}>Plan de estudios</Th>
          <Th style={{ width:'12%' }}>Acciones</Th>
        </tr></thead>
        <tbody>
          {usuariosFiltrados.map(u => {
            const horas = Number(u.horas_acumuladas ?? u.total_horas ?? u.horas ?? 0);
            const editando = editandoHorasId === u.id_usuario;
            const saving = savingHorasId === u.id_usuario;
            const esEstudiante = true;
            const porcentajeMinimo = u.minimo_materias_porcentaje == null ? null : Number(u.minimo_materias_porcentaje);
            const porcentajeActual = Number(u.total_materias_plan) > 0 ? Number(u.materias_aprobadas) / Number(u.total_materias_plan) * 100 : 0;
            const cumpleMinimo = porcentajeMinimo !== null && porcentajeActual >= porcentajeMinimo;
            const rowActiveStyle = editando
              ? { background:'#0A1B4E', color:'#fff', transition:'background .2s ease, color .2s ease' }
              : {};
            const mainTextColor = editando ? '#fff' : 'var(--text)';
            const secondaryTextColor = editando ? 'rgba(255,255,255,.78)' : 'var(--text2)';

            return (
            <tr key={u.id_usuario}>
              <Td style={rowActiveStyle}><b style={{ color:mainTextColor }}>{u.nombre_completo}</b></Td>
              <Td style={{ ...rowActiveStyle, fontSize:12, color:secondaryTextColor, whiteSpace:'nowrap', textAlign:'left' }}>
                {esEstudiante ? (u.numero_expediente || '—') : <span style={{ color:'var(--text3)' }}>—</span>}
              </Td>
              <Td style={{ ...rowActiveStyle, fontSize:12, color:secondaryTextColor, whiteSpace:'nowrap' }}>{u.correo_institucional}</Td>
              <Td style={{ ...rowActiveStyle, fontSize:12, color:secondaryTextColor }}>{u.nombre_carrera || '-'}</Td>
              <Td style={{ ...rowActiveStyle, fontSize:12, color:secondaryTextColor }}>{u.nombre_facultad || '-'}</Td>
              <Td style={rowActiveStyle}>
                <span style={{
                  fontSize:12, padding:'3px 8px', borderRadius:4, fontWeight:500,
                  background: editando ? 'rgba(255,255,255,.16)' : porcentajeMinimo === null ? 'rgba(10,27,78,.08)' : cumpleMinimo ? 'rgba(34,199,138,.15)' : 'rgba(245,166,35,.15)',
                  color: editando ? '#fff' : porcentajeMinimo === null ? 'var(--text2)' : cumpleMinimo ? 'var(--green)' : 'var(--amber)'
                }} title={porcentajeMinimo === null ? 'Porcentaje mínimo aún no configurado' : `Requisito mínimo: ${porcentajeMinimo}%`}>{u.materias_aprobadas}/{u.total_materias_plan || '—'}</span>
              </Td>
              <Td style={rowActiveStyle}>
                <span style={{
                  fontSize:12, padding:'3px 8px', borderRadius:4, fontWeight:600,
                  background: editando ? 'rgba(255,255,255,.16)' : horas>=500 ? 'rgba(34,199,138,.15)' : 'rgba(10,27,78,.08)',
                  color: editando ? '#fff' : horas>=500 ? 'var(--green)' : 'var(--text2)'
                }}>{horas}h</span>
              </Td>
              <Td style={rowActiveStyle}>
                {esEstudiante ? (
                  <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                    <Input
                      id={`usuarios-horas-manuales-${u.id_usuario}`}
                      name={`usuarios-horas-manuales-${u.id_usuario}`}
                      type="number"
                      min="0"
                      max="500"
                      value={horasManuales[u.id_usuario] ?? 0}
                      disabled={!editando || saving}
                      onChange={e => setHorasManuales(prev => ({ ...prev, [u.id_usuario]: e.target.value }))}
                      title="Horas manuales externas"
                      style={{ width:68, padding:'6px 8px', fontSize:12 }}
                    />
                    {editando ? (
                      <>
                        <Btn variant="green" onClick={() => confirmarHoras(u)} disabled={saving} style={editando ? { color:'#b8ffe6', background:'rgba(111,224,184,.24)', borderColor:'rgba(111,224,184,.85)' } : { padding:'6px 9px' }}>
                          {saving ? 'Guardando...' : 'Acreditar'}
                        </Btn>
                        <Btn variant="outline" onClick={() => cancelarHoras(u)} disabled={saving} style={{ padding:'6px 9px', ...(editando ? { color:'#fff', borderColor:'rgba(255,255,255,.45)' } : {}) }}>
                          Cancelar
                        </Btn>
                      </>
                    ) : (
                      <Btn variant="green" onClick={() => editarHoras(u)} style={{ padding:'6px 9px' }}>
                        Acreditar
                      </Btn>
                    )}
                  </div>
                ) : (
                  <span style={{ color:'var(--text3)' }}>—</span>
                )}
              </Td>
              <Td style={rowActiveStyle}>
                <div className="study-plan-editor">
                  <label><span>Aprob.</span><Input aria-label={`Materias aprobadas de ${u.nombre_completo}`} title="Materias aprobadas" type="number" min="0" value={planes[u.id_usuario]?.aprobadas ?? u.materias_aprobadas} onChange={e=>setPlanes({...planes,[u.id_usuario]:{...planes[u.id_usuario],aprobadas:e.target.value,total:planes[u.id_usuario]?.total ?? u.total_materias_plan ?? ''}})} /></label>
                  <label><span>Total</span><Input aria-label={`Materias totales del plan de ${u.nombre_completo}`} title="Total de materias del plan" type="number" min="1" value={planes[u.id_usuario]?.total ?? u.total_materias_plan ?? ''} onChange={e=>setPlanes({...planes,[u.id_usuario]:{...planes[u.id_usuario],total:e.target.value,aprobadas:planes[u.id_usuario]?.aprobadas ?? u.materias_aprobadas}})} /></label>
                  <Btn variant="outline" style={{ width:'100%', justifyContent:'center', padding:'6px 8px', boxSizing:'border-box' }} onClick={async()=>{try{const p=planes[u.id_usuario]||{};await api.patch(`/usuarios/${u.id_usuario}/plan-estudios`,{materias_aprobadas:p.aprobadas??u.materias_aprobadas,total_materias_plan:p.total??u.total_materias_plan});show('Plan académico actualizado');setPlanes({...planes,[u.id_usuario]:{aprobadas:'',total:''}});loadUsuarios();}catch(e){show(e.response?.data?.error||'No se pudo actualizar el plan','error');}}}>Guardar plan</Btn>
                </div>
              </Td>
              <Td style={rowActiveStyle}>
                <div style={{ display:'grid', justifyItems:'center', gap:6 }}>
                  <Btn variant="outline" onClick={() => abrirEdicionEstudiante(u)} style={{ width:112, maxWidth:'100%', minHeight:36, boxSizing:'border-box', justifyContent:'center', padding:'8px 8px', fontSize:12, lineHeight:1.2, whiteSpace:'nowrap' }}>Editar</Btn>
                  <Btn variant="danger" onClick={() => setEstudianteEliminar(u)} style={{ width:112, maxWidth:'100%', minHeight:36, boxSizing:'border-box', justifyContent:'center', padding:'8px 8px', fontSize:12, lineHeight:1.2, whiteSpace:'nowrap' }}>Eliminar</Btn>
                </div>
              </Td>
            </tr>
            );
          })}
          {usuariosFiltrados.length === 0 && (
            <tr>
              <Td style={{ textAlign:'center', padding:40, color:'var(--text3)' }} colSpan={10}>
                No hay usuarios que coincidan con los filtros.
              </Td>
            </tr>
          )}
        </tbody>
      </TableWrap>
      <Modal
        open={!!estudianteEditando}
        onClose={() => !guardandoEstudiante && setEstudianteEditando(null)}
        title="Editar estudiante"
        width={620}
        footer={<>
          <Btn variant="outline" onClick={() => setEstudianteEditando(null)} disabled={guardandoEstudiante}>Cancelar</Btn>
          <Btn variant="accent" onClick={() => guardarEdicionEstudiante()} disabled={guardandoEstudiante}>{guardandoEstudiante ? 'Guardando...' : 'Guardar cambios'}</Btn>
        </>}
      >
        <form id="editar-estudiante-form" onSubmit={guardarEdicionEstudiante} style={{ display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:12 }}>
          <label style={{ display:'grid', gap:5, color:'var(--text2)', fontSize:12 }}>Nombre completo
            <Input required value={edicionEstudiante.nombre_completo || ''} onChange={e=>setEdicionEstudiante({ ...edicionEstudiante, nombre_completo:e.target.value })} />
          </label>
          <label style={{ display:'grid', gap:5, color:'var(--text2)', fontSize:12 }}>Número de expediente
            <Input required inputMode="numeric" pattern="[0-9]{1,20}" value={edicionEstudiante.numero_expediente || ''} onChange={e=>setEdicionEstudiante({ ...edicionEstudiante, numero_expediente:e.target.value })} />
          </label>
          <label style={{ display:'grid', gap:5, color:'var(--text2)', fontSize:12 }}>Correo institucional
            <Input required type="email" value={edicionEstudiante.correo_institucional || ''} onChange={e=>setEdicionEstudiante({ ...edicionEstudiante, correo_institucional:e.target.value })} />
          </label>
          <label style={{ display:'grid', gap:5, color:'var(--text2)', fontSize:12 }}>Carrera
            <Select required value={edicionEstudiante.id_carrera || ''} onChange={e=>setEdicionEstudiante({ ...edicionEstudiante, id_carrera:e.target.value })}>
              <option value="">Selecciona carrera</option>
              {catalogoCarreras.map(carrera => <option key={carrera.id_carrera} value={carrera.id_carrera}>{carrera.nombre_carrera}</option>)}
            </Select>
          </label>
          <label style={{ display:'grid', gap:5, color:'var(--text2)', fontSize:12 }}>Materias aprobadas
            <Input required type="number" min="0" value={edicionEstudiante.materias_aprobadas ?? ''} onChange={e=>setEdicionEstudiante({ ...edicionEstudiante, materias_aprobadas:e.target.value })} />
          </label>
          <label style={{ display:'grid', gap:5, color:'var(--text2)', fontSize:12 }}>Total de materias del plan
            <Input required type="number" min="1" value={edicionEstudiante.total_materias_plan ?? ''} onChange={e=>setEdicionEstudiante({ ...edicionEstudiante, total_materias_plan:e.target.value })} />
          </label>
        </form>
      </Modal>
      <Modal
        open={!!estudianteEliminar}
        onClose={() => !eliminandoEstudiante && setEstudianteEliminar(null)}
        title="Eliminar estudiante"
        width={480}
        footer={<>
          <Btn variant="outline" onClick={() => setEstudianteEliminar(null)} disabled={eliminandoEstudiante}>Cancelar</Btn>
          <Btn variant="danger" onClick={eliminarEstudiante} disabled={eliminandoEstudiante}>{eliminandoEstudiante ? 'Eliminando...' : 'Eliminar estudiante'}</Btn>
        </>}
      >
        <p style={{ color:'var(--text2)', fontSize:14, lineHeight:1.6 }}>
          ¿Eliminar a <strong style={{ color:'var(--text)' }}>{estudianteEliminar?.nombre_completo}</strong>? También se borrarán sus inscripciones y horas manuales acreditadas, y se actualizarán los cupos de las ofertas.
        </p>
      </Modal>
      <Modal
        open={!!confirmacionHoras}
        onClose={() => {
          if (!savingHorasId) setConfirmacionHoras(null);
        }}
        title="Acreditar horas"
        width={440}
        footer={(
          <>
            <Btn variant="outline" onClick={() => setConfirmacionHoras(null)} disabled={!!savingHorasId}>
              Cancelar
            </Btn>
            <Btn variant="green" onClick={guardarHorasConfirmadas} disabled={!!savingHorasId}>
              {savingHorasId ? 'Acreditando...' : 'Aceptar'}
            </Btn>
          </>
        )}
      >
        <p style={{ color:'var(--text2)', fontSize:14, lineHeight:1.6 }}>
          ¿Estas seguro de acreditar <strong style={{ color:'var(--text)' }}>{confirmacionHoras?.horas || 0} horas</strong> a{' '}
          <strong style={{ color:'var(--text)' }}>{confirmacionHoras?.usuario?.nombre_completo}</strong>?
        </p>
      </Modal>
      <Toast toast={toast} />
    </>
  );
}

