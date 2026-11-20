import { useEffect, useState } from 'react';
import api from '../services/apiClient';
import { PageHeader, TableWrap, Th, Td, Badge, Spinner, useToast, Toast, Input, Select, Btn, EmptyState } from '../components/UI';

export default function Inscripciones() {
  const [inscripciones, setInscripciones] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [carrera, setCarrera] = useState('');
  const [estado, setEstado] = useState('');
  const [busquedaEstudiante, setBusquedaEstudiante] = useState('');
  const [estudiantesEncontrados, setEstudiantesEncontrados] = useState([]);
  const [estudianteElegido, setEstudianteElegido] = useState(null);
  const [ofertasDisponibles, setOfertasDisponibles] = useState([]);
  const [ofertaElegida, setOfertaElegida] = useState('');
  const { toast, show } = useToast();

  async function load() {
    try {
      const [inscripcionesRes, carrerasRes, ofertasRes] = await Promise.all([
        api.get('/inscripciones'),
        api.get('/carreras'),
        api.get('/ofertas')
      ]);
      setInscripciones(inscripcionesRes.data);
      setCarreras(carrerasRes.data);
      setOfertasDisponibles(ofertasRes.data.filter(o => o.activo));
    } catch {
      show('Error al cargar', 'error');
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  async function buscarEstudiante(event) {
    event.preventDefault();
    try {
      const { data } = await api.get('/usuarios/buscar', { params: { q: busquedaEstudiante } });
      setEstudiantesEncontrados(data);
      if (!data.length) show('No se encontraron estudiantes con ese número de expediente', 'error');
    } catch (e) { show(e.response?.data?.error || 'No se pudo buscar el expediente', 'error'); }
  }

  async function registrarInscripcion() {
    if (!estudianteElegido || !ofertaElegida) return show('Selecciona al estudiante y la oferta disponible', 'error');
    try {
      await api.post('/inscripciones', { id_estudiante: estudianteElegido.id_estudiante, id_oferta: Number(ofertaElegida) });
      show('Inscripción registrada');
      setEstudianteElegido(null); setEstudiantesEncontrados([]); setBusquedaEstudiante(''); setOfertaElegida('');
      await load();
    } catch (e) { show(e.response?.data?.error || 'No se pudo registrar la inscripción', 'error'); }
  }

  const filtered = inscripciones.filter(i => {
    const texto = `${i.estudiante_nombre || ''} ${i.numero_expediente || ''} ${i.correo_institucional || ''} ${i.oferta_titulo || ''} ${i.nombre_carrera || ''}`.toLowerCase();
    const matchQ = !query || texto.includes(query.trim().toLowerCase());
    const matchC = !carrera || i.nombre_carrera === carrera;
    const matchE = !estado || i.estado === estado;
    return matchQ && matchC && matchE;
  });

  if (loading) return <Spinner />;

  return (
    <>
      <PageHeader title="Inscripciones" subtitle="Gestiona todas las inscripciones de estudiantes" />

      <section className="enrollment-panel">
        <div className="enrollment-panel-heading"><div><h2>Registrar participante</h2><p>Busca el expediente y asigna al estudiante a una oferta aprobada.</p></div><span className="workflow-step">Nueva inscripción</span></div>
        <form onSubmit={buscarEstudiante} className="enrollment-search-row">
          <Input value={busquedaEstudiante} onChange={e=>setBusquedaEstudiante(e.target.value)} placeholder="Número de expediente" aria-label="Número de expediente" />
          <Btn type="submit" variant="outline">Buscar estudiante</Btn>
        </form>
        {estudiantesEncontrados.length > 0 && <div className="enrollment-candidates" aria-label="Resultados de búsqueda">{estudiantesEncontrados.map(e=><button className={`workflow-candidate${estudianteElegido?.id_estudiante===e.id_estudiante?' is-selected':''}`} type="button" key={e.id_estudiante} onClick={()=>setEstudianteElegido(e)}><span className="workflow-avatar">{e.nombre_completo?.trim()?.charAt(0)?.toUpperCase()||'E'}</span><span><strong>{e.nombre_completo}</strong><small>Expediente {e.numero_expediente} · {e.nombre_carrera}</small></span><span className="workflow-select-mark">{estudianteElegido?.id_estudiante===e.id_estudiante?'Seleccionado':'Elegir'}</span></button>)}</div>}
        {estudianteElegido && <div className="workflow-selected enrollment-selected"><span>Estudiante seleccionado</span><strong>{estudianteElegido.nombre_completo}</strong><small>{estudianteElegido.numero_expediente} · {estudianteElegido.nombre_carrera}</small></div>}
        <div className="enrollment-offer-row">
          <Select value={ofertaElegida} onChange={e=>setOfertaElegida(e.target.value)} aria-label="Oferta disponible">
            <option value="">Selecciona una oferta disponible</option>
            {ofertasDisponibles.map(o=><option key={o.id_oferta} value={o.id_oferta}>{o.titulo} · {o.cupo_actual}/{o.cupo_maximo}</option>)}
          </Select>
          <Btn variant="accent" onClick={registrarInscripcion}>Inscribir participante</Btn>
        </div>
      </section>

      <div className="inscriptions-filters">
        <div className="students-search">
          <span aria-hidden="true">⌕</span>
          <Input
            id="inscripciones-buscar-estudiante"
            name="inscripciones-buscar-estudiante"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar estudiante..."
            className="students-search-input"
            style={{ padding:'10px 12px 10px 34px' }}
          />
        </div>

        <Select
          id="inscripciones-filtro-carrera"
          name="inscripciones-filtro-carrera"
          value={carrera}
          onChange={e => setCarrera(e.target.value)}
          className="students-filter-select"
        >
          <option value="">Todas las carreras</option>
          {carreras.map(c => <option key={c.id_carrera} value={c.nombre_carrera}>{c.nombre_carrera}</option>)}
        </Select>

        <Select
          id="inscripciones-filtro-estado"
          name="inscripciones-filtro-estado"
          value={estado}
          onChange={e => setEstado(e.target.value)}
          className="students-filter-select"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aceptado">Aceptado</option>
          <option value="finalizado">Finalizado</option>
          <option value="rechazado">Rechazado</option>
        </Select>
      </div>

      <TableWrap>
        <thead>
          <tr>
            <Th>Estudiante</Th><Th>Expediente</Th><Th>Correo</Th><Th>Oferta</Th><Th>Horas</Th><Th>Fecha</Th><Th>Estado</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <Td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
                Sin inscripciones
              </Td>
            </tr>
          )}
          {filtered.map(i => (
            <tr key={i.id_inscripcion}>
              <Td><b style={{ color: 'var(--text)' }}>{i.estudiante_nombre}</b></Td>
              <Td>{i.numero_expediente || 'Pendiente'}</Td>
              <Td style={{ fontSize: 12 }}>{i.correo_institucional}</Td>
              <Td style={{ fontSize: 12 }}>{i.oferta_titulo}</Td>
              <Td><span style={{ fontSize: 12, color: 'var(--accent)' }}>{i.horas_acreditar}h</span></Td>
              <Td style={{ fontSize: 12 }}>{new Date(i.fecha_inscripcion).toLocaleDateString('es-SV')}</Td>
              <Td><Badge type={i.estado}>{({ pendiente:'Pendiente', aceptado:'Aceptado', finalizado:'Finalizado', rechazado:'Rechazado' })[i.estado] || i.estado}</Badge></Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>

      <Toast toast={toast} />
    </>
  );
}
