import { useEffect, useState } from 'react';
import api from '../services/apiClient';
import { PageHeader, TableWrap, Th, Td, Badge, Spinner, useToast, Toast, Input, Select } from '../components/UI';

export default function Inscripciones() {
  const [inscripciones, setInscripciones] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [carrera, setCarrera] = useState('');
  const [estado, setEstado] = useState('');
  const { toast, show } = useToast();

  async function load() {
    try {
      const [inscripcionesRes, carrerasRes] = await Promise.all([
        api.get('/inscripciones'),
        api.get('/carreras')
      ]);
      setInscripciones(inscripcionesRes.data);
      setCarreras(carrerasRes.data);
    } catch {
      show('Error al cargar', 'error');
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

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
