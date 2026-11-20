import { useEffect, useState } from 'react';
import api from '../services/apiClient';
import {
  PageHeader, Btn, Tag, Badge,
  Modal, Field, Input, Select, Textarea, Spinner, useToast, Toast, EmptyState
} from '../components/UI';

const EMPTY_FORM = {
  titulo:'', descripcion:'', institucion_receptora:'', modalidad:'', ubicacion:'', horario:'',
  fecha_inicio:'', fecha_fin:'', hora_inicio:'', hora_fin:'',
  horas_acreditar:25, cupo_maximo:1, id_carrera:'', imagen_url:'', activo:true, es_ambiental:false
};
const API_BASE_URL = 'http://localhost:4000';

function imageSrc(value) {
  if (!value) return '';
  return String(value).startsWith('/uploads') ? `${API_BASE_URL}${value}` : value;
}

function formatDate(value) {
  if (!value) return '';
  const [year, month, day] = String(value).slice(0, 10).split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function dateToInput(value) {
  return value ? String(value).slice(0, 10) : '';
}

function inputToDate(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return trimmed;
  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function formatTime(value) {
  return value ? String(value).slice(0, 5) : '';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatLongDate(value) {
  if (!value) return '&mdash;';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHtml(formatDate(value) || value);
  return date.toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric' });
}

function generarPDFOferta({ oferta, participantes }) {
  const hoy = new Date().toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric' });
  const codigo = `USO-SS-OFERTA-${oferta.id_oferta.toString().padStart(5, '0')}`;
  const logoUrl = `${window.location.origin}/logo-uso.png`;
  const totalHoras = participantes.reduce((acc, p) => acc + Number(p.horas_asignadas || 0), 0);

  const filas = participantes.map((p, index) => `
    <tr>
      <td style="text-align:center">${index + 1}</td>
      <td><strong>${escapeHtml(p.estudiante_nombre)}</strong><br/><span>Expediente: ${escapeHtml(p.numero_expediente || 'Pendiente')}</span><br/><span>${escapeHtml(p.correo_institucional || '')}</span></td>
      <td>${escapeHtml(p.nombre_carrera || p.carrera || p.estudiante_carrera || 'Carrera no asignada')}</td>
      <td style="text-align:center;font-weight:700;color:#1a3a6b">${escapeHtml(p.horas_asignadas)}h</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"/>
<title>Constancia de Oferta - ${escapeHtml(oferta.titulo)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Source Sans 3',sans-serif;background:#fff;color:#222}
  .wrap{max-width:760px;margin:28px auto;border:3px solid #1a3a6b;border-radius:4px;overflow:hidden}
  .top-green{background:#2c6e2f;height:8px}
  .top-blue{background:#1a3a6b;padding:6px 0;display:flex;justify-content:center}
  .top-blue span{color:#fff;font-size:11px;letter-spacing:1px;opacity:.75}
  .header-main{padding:26px 38px 18px;display:flex;align-items:center;gap:20px;border-bottom:3px solid #2c6e2f}
  .logo-box{width:68px;height:68px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .logo-box img{width:68px;height:68px;object-fit:contain;display:block}
  .univ-name{font-family:'Playfair Display',serif;color:#1a3a6b;font-size:22px;font-weight:600;line-height:1.2;margin:0}
  .univ-sub{color:#2c6e2f;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-top:4px}
  .body{padding:30px 38px 28px}
  .doc-title{font-family:'Playfair Display',serif;color:#1a3a6b;font-size:20px;font-weight:600;text-align:center;letter-spacing:1px;margin:0 0 6px}
  .doc-sub{text-align:center;color:#555;font-size:13px;margin:0 0 22px}
  .badge{display:flex;justify-content:center;margin-bottom:24px}
  .badge span{background:#2c6e2f;color:#fff;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;padding:6px 20px;border-radius:100px}
  .body-text{color:#222;font-size:14px;line-height:1.7;text-align:justify;margin-bottom:22px}
  .body-text strong{color:#1a3a6b}
  .info-table{width:100%;border-collapse:collapse;font-size:13.5px;margin-bottom:24px}
  .info-table tr:nth-child(even) td{background:#f0f4fb}
  .info-table td{padding:9px 14px;border:1px solid #d0dae8;vertical-align:top}
  .info-table td:first-child{font-weight:600;color:#1a3a6b;white-space:nowrap;width:34%}
  .section-title{color:#fff;background:#1a3a6b;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;padding:7px 14px;border-radius:3px 3px 0 0}
  .students-table{width:100%;border-collapse:collapse;font-size:12.5px;margin-bottom:26px}
  .students-table th{background:#2c6e2f;color:#fff;padding:8px 10px;text-align:left;font-weight:600;font-size:12px}
  .students-table th:first-child,.students-table th:last-child{text-align:center}
  .students-table td{border:1px solid #d0dae8;padding:8px 10px;color:#222;vertical-align:top}
  .students-table td span{color:#6b7a99;font-size:11.5px}
  .students-table tr:nth-child(even) td{background:#f6f9f2}
  .summary{background:#f0f4fb;border:1px solid #d0dae8;border-radius:4px;padding:10px 14px;font-size:13px;margin-bottom:24px;color:#1a3a6b;font-weight:600}
  .footer-line{border-top:2px solid #2c6e2f;padding-top:20px;display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:16px}
  .footer-date{color:#555;font-size:12px}
  .signature-block{text-align:center;font-size:12px;color:#555}
  .signature-line{width:160px;border-top:1.5px solid #1a3a6b;margin:0 auto 4px}
  .sig-name{color:#1a3a6b;font-weight:600;font-size:12px}
  .foot-code{background:#f0f4fb;border-top:1px solid #d0dae8;padding:8px 38px;font-size:10px;color:#6b7a99;text-align:right}
  .bot-green{background:#2c6e2f;height:6px}
  .bot-blue{background:#1a3a6b;height:10px}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
<script>
  window.addEventListener('load', function() {
    var el = document.querySelector('.wrap');
    var opt = {
      margin: [6, 6, 6, 6],
      filename: document.title + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(el).save();
  });
</script></head><body>
<div class="wrap">
  <div class="top-green"></div>
  <div class="top-blue"><span>DOCUMENTO OFICIAL</span></div>
  <div class="header-main">
    <div class="logo-box"><img src="${logoUrl}" alt="Logo USO"/></div>
    <div>
      <p class="univ-name">Universidad de Sonsonate</p>
      <p class="univ-sub">Sistema de Servicio Social</p>
    </div>
  </div>
  <div class="body">
    <p class="doc-title">CONSTANCIA DE ACTIVIDAD DE SERVICIO SOCIAL</p>
    <p class="doc-sub">Reporte de participantes y horas asignadas</p>
    <div class="badge"><span>&#10003; Actividad completada</span></div>
    <p class="body-text">
      La <strong>Universidad de Sonsonate</strong>, a trav&eacute;s del Sistema de Servicio Social,
      hace constar la informaci&oacute;n registrada para la actividad
      <strong>${escapeHtml(oferta.titulo)}</strong>, incluyendo los estudiantes participantes
      y las horas asignadas a cada uno.
    </p>
    <table class="info-table">
      <tr><td>Fecha de creaci&oacute;n de oferta</td><td>${formatLongDate(oferta.created_at)}</td></tr>
      <tr><td>Nombre de actividad</td><td>${escapeHtml(oferta.titulo)}</td></tr>
      <tr><td>Descripci&oacute;n</td><td>${oferta.descripcion ? escapeHtml(oferta.descripcion) : '&mdash;'}</td></tr>
      <tr><td>Fecha de inicio</td><td>${formatLongDate(oferta.fecha_inicio)}</td></tr>
      <tr><td>Fecha de finalizaci&oacute;n</td><td>${formatLongDate(oferta.fecha_fin)}</td></tr>
      <tr><td>Hora de inicio</td><td>${escapeHtml(formatTime(oferta.hora_inicio) || '--:--')}</td></tr>
      <tr><td>Hora de finalizaci&oacute;n</td><td>${escapeHtml(formatTime(oferta.hora_fin) || '--:--')}</td></tr>
    </table>
    <p class="section-title">Estudiantes participantes</p>
    <table class="students-table">
      <thead><tr><th>#</th><th>Estudiante</th><th>Carrera</th><th>Horas</th></tr></thead>
      <tbody>${filas}</tbody>
    </table>
    <div class="summary">Total: ${participantes.length} estudiante(s) participante(s) | ${totalHoras} horas asignadas</div>
    <div class="footer-line">
      <div class="footer-date">Sonsonate, El Salvador &mdash; ${hoy}</div>
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="sig-name">Coordinaci&oacute;n de Servicio Social</div>
        <div>Universidad de Sonsonate</div>
      </div>
    </div>
  </div>
  <div class="foot-code">C&oacute;digo: ${codigo} | Emitido el ${hoy}</div>
  <div class="bot-green"></div>
  <div class="bot-blue"></div>
</div></body></html>`;

  const v = window.open('', '_blank');
  v.document.write(html);
  v.document.close();
}

function timeToInput(value) {
  return value ? String(value).slice(0, 5) : '';
}

function inputToTime(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  return /^\d{2}:\d{2}$/.test(trimmed) ? trimmed : null;
}

function toBoolean(value) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function TimeSelect({ value, onChange, id, name }) {
  return (
    <Input
      id={id}
      name={name || 'hora-oferta'}
      type="time"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
    />
  );
}

function ImageDropField({ value, file, onFile, onUrlChange, id = 'oferta-imagen-archivo' }) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (!file) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreview(imageSrc(value));
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, value]);

  function pickFile(selectedFile) {
    if (!selectedFile || !selectedFile.type.startsWith('image/')) return;
    onFile(selectedFile);
  }

  return (
    <div>
      <label
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          pickFile(e.dataTransfer.files?.[0]);
        }}
        style={{
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          flexDirection:'column',
          gap:8,
          minHeight:140,
          border:'1px dashed rgba(10,27,78,.30)',
          borderRadius:10,
          background: dragging ? 'rgba(15,158,110,.08)' : '#f8f9fc',
          color:'var(--text2)',
          cursor:'pointer',
          overflow:'hidden',
          transition:'background .15s, border-color .15s'
        }}
      >
        <input
          id={id}
          name="oferta-imagen-archivo"
          type="file"
          accept="image/*"
          onChange={e => pickFile(e.target.files?.[0])}
          style={{ display:'none' }}
        />
        {preview ? (
          <img
            src={preview}
            alt="Vista previa"
            style={{ width:'100%', height:170, objectFit:'cover', display:'block' }}
          />
        ) : (
          <>
            <div style={{ fontSize:26, lineHeight:1 }}>▧</div>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>
              Selecciona o arrastra una imagen
            </div>
            <div style={{ fontSize:12, color:'var(--text3)' }}>PNG, JPG o WEBP. Máximo 5 MB.</div>
          </>
        )}
      </label>

      {file && (
        <div style={{ marginTop:8, fontSize:12, color:'var(--text3)' }}>
          Imagen seleccionada: {file.name}
        </div>
      )}

      {preview && (
        <button
          type="button"
          onClick={() => { onFile(null); onUrlChange(''); }}
          style={{
            marginTop:8,
            border:'1px solid rgba(217,48,37,.30)',
            background:'rgba(217,48,37,.08)',
            color:'#b52920',
            borderRadius:6,
            padding:'6px 10px',
            fontFamily:'inherit',
            fontSize:12,
            cursor:'pointer'
          }}
        >
          Quitar imagen
        </button>
      )}

      <div style={{ marginTop:10 }}>
        <Input
          name="oferta-imagen-url"
          value={value}
          onChange={e => { onFile(null); onUrlChange(e.target.value); }}
          placeholder="O pega una URL de imagen..."
        />
      </div>
    </div>
  );
}

export default function Ofertas({ historial = false, papelera = false }) {
  const [ofertas,   setOfertas]   = useState([]);
  const [carreras,  setCarreras]  = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [query,     setQuery]     = useState('');
  const [carreraFiltro, setCarreraFiltro] = useState('');
  const [fechaCreacionFiltro, setFechaCreacionFiltro] = useState('');
  const [modal,     setModal]     = useState(false);
  const [adminDetModal, setAdminDetModal] = useState(null);
  const [enrollModal, setEnrollModal] = useState(null);
  const [enrollQuery, setEnrollQuery] = useState('');
  const [enrollCandidates, setEnrollCandidates] = useState([]);
  const [selectedEnrollIds, setSelectedEnrollIds] = useState([]);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollingId, setEnrollingId] = useState(null);
  const [confirmEnroll, setConfirmEnroll] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(null);
  const [confirmacionPapelera, setConfirmacionPapelera] = useState(null);
  const [procesandoPapelera, setProcesandoPapelera] = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [editId,    setEditId]    = useState(null);
  const [saving,    setSaving]    = useState(false);
  const { toast, show } = useToast();

  async function load() {
    try {
      const [o, c, i] = await Promise.all([papelera ? api.get('/ofertas/trash') : api.get('/ofertas'), api.get('/carreras'), api.get('/inscripciones')]);
      setOfertas(o.data);
      setCarreras(c.data);
      setInscripciones(i.data);
    } catch { show('Error al cargar', 'error'); }
    finally { setLoading(false); }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [papelera]);

  function openNew()   { setForm(EMPTY_FORM); setImageFile(null); setEditId(null); setModal(true); }
  function openEdit(o) {
    setForm({
      titulo: o.titulo, descripcion: o.descripcion, institucion_receptora:o.institucion_receptora||'', modalidad:o.modalidad||'', ubicacion: o.ubicacion||'',
      horario: o.horario||'', horas_acreditar: o.horas_acreditar,
      fecha_inicio: dateToInput(o.fecha_inicio),
      fecha_fin: dateToInput(o.fecha_fin),
      hora_inicio: timeToInput(o.hora_inicio),
      hora_fin: timeToInput(o.hora_fin),
      cupo_maximo: o.cupo_maximo, id_carrera: o.id_carrera||'',
      imagen_url: o.imagen_url||'', activo: o.activo, es_ambiental: toBoolean(o.es_ambiental)
    });
    setImageFile(null);
    setEditId(o.id_oferta);
    setModal(true);
  }

  async function saveOferta() {
    if (!form.titulo || !form.descripcion || !form.ubicacion || !form.fecha_inicio || !form.fecha_fin || !form.hora_inicio || !form.hora_fin) {
      show('Completa título, descripción, ubicación, fechas y horas', 'error');
      return;
    }
    if (form.horas_acreditar < 1 || form.horas_acreditar > 500) {
      show('Las horas a acreditar deben estar entre 1 y 500', 'error');
      return;
    }
    if (form.cupo_maximo < 1) {
      show('El cupo máximo debe ser mayor o igual a 1', 'error');
      return;
    }
    const fechaInicio = inputToDate(form.fecha_inicio);
    const fechaFin = inputToDate(form.fecha_fin);
    const horaInicio = inputToTime(form.hora_inicio);
    const horaFin = inputToTime(form.hora_fin);

    if (fechaInicio && fechaFin && !/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio)) {
      show('La fecha de inicio debe tener formato dd/mm/aaaa', 'error');
      return;
    }
    if (fechaFin && !/^\d{4}-\d{2}-\d{2}$/.test(fechaFin)) {
      show('La fecha de finalización debe tener formato dd/mm/aaaa', 'error');
      return;
    }
    if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
      show('La fecha de finalización no puede ser anterior a la fecha de inicio', 'error');
      return;
    }
    if (form.hora_inicio && horaInicio === null) {
      show('La hora de inicio debe tener formato HH:mm', 'error');
      return;
    }
    if (form.hora_fin && horaFin === null) {
      show('La hora de finalización debe tener formato HH:mm', 'error');
      return;
    }
    if (fechaInicio && fechaFin && fechaInicio === fechaFin && horaInicio && horaFin && horaInicio > horaFin) {
      show('La hora de finalización no puede ser anterior a la hora de inicio', 'error');
      return;
    }
    setSaving(true);
    try {
      let imagenUrl = form.imagen_url;
      if (imageFile) {
        const data = new FormData();
        data.append('imagen', imageFile);
        const uploaded = await api.post('/ofertas/upload-imagen', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imagenUrl = uploaded.data.imagen_url;
      }

      const body = { ...form, horas_acreditar: form.es_ambiental ? 25 : form.horas_acreditar, imagen_url: imagenUrl, fecha_inicio: fechaInicio, fecha_fin: fechaFin, hora_inicio: horaInicio || '', hora_fin: horaFin || '', id_carrera: form.id_carrera || null };
      if (editId) await api.put(`/ofertas/${editId}`, body);
      else await api.post('/ofertas', body);
      show(editId ? 'Oferta actualizada' : 'Oferta creada');
      setModal(false);
      load();
    } catch (e) { show(e.response?.data?.error || 'Error al guardar','error'); }
    finally { setSaving(false); }
  }

  async function toggleOferta(id) {
    try {
      await api.patch(`/ofertas/${id}/toggle`);
      show(historial ? 'Oferta activada' : 'Oferta finalizada');
      setConfirmToggle(null);
      load();
    }
    catch { show('Error','error'); }
  }

  async function ejecutarAccionPapelera() {
    if (!confirmacionPapelera) return;
    setProcesandoPapelera(true);
    try {
      const { tipo, oferta } = confirmacionPapelera;
      if (tipo === 'mover') await api.delete(`/ofertas/${oferta.id_oferta}`);
      if (tipo === 'eliminar') await api.delete(`/ofertas/trash/${oferta.id_oferta}`);
      if (tipo === 'vaciar') await api.delete('/ofertas/trash');
      show(tipo === 'mover' ? 'Oferta movida a la papelera' : tipo === 'vaciar' ? 'Papelera vaciada' : 'Oferta eliminada definitivamente');
      setConfirmacionPapelera(null);
      await load();
    } catch (e) {
      show(e.response?.data?.error || 'No se pudo completar la acción', 'error');
    } finally { setProcesandoPapelera(false); }
  }

  async function restaurarOferta(id) {
    try {
      await api.patch(`/ofertas/trash/${id}/restore`);
      show('Oferta restaurada');
      await load();
    } catch (e) { show(e.response?.data?.error || 'No se pudo restaurar la oferta', 'error'); }
  }

  async function openAdminDetalle(o) {
    setAdminDetModal(o);
    try {
      const { data } = await api.get('/inscripciones');
      setInscripciones(data);
    } catch {
      show('Error al cargar inscritos', 'error');
    }
  }

  async function openEnrollModal(o) {
    setEnrollModal(o);
    setEnrollQuery('');
    setSelectedEnrollIds([]);
    setEnrollLoading(true);
    try {
      const { data } = await api.get('/usuarios');
      const inscritosEnOferta = new Set(inscripciones.filter(i => Number(i.id_oferta) === Number(o.id_oferta)).map(i => Number(i.id_estudiante)));
      const conInscripcionActiva = new Set(inscripciones.filter(i => ['pendiente', 'aceptado'].includes(i.estado)).map(i => Number(i.id_estudiante)));
      setEnrollCandidates(data.filter(student =>
        (!o.id_carrera || Number(student.id_carrera) === Number(o.id_carrera)) &&
        !inscritosEnOferta.has(Number(student.id_estudiante)) &&
        !conInscripcionActiva.has(Number(student.id_estudiante))
      ));
    } catch (e) {
      show(e.response?.data?.error || 'No se pudieron cargar los estudiantes', 'error');
      setEnrollModal(null);
    } finally {
      setEnrollLoading(false);
    }
  }

  async function inscribirSeleccionados() {
    if (!enrollModal) return;
    const cuposDisponibles = Math.max(0, Number(enrollModal.cupo_maximo) - Number(enrollModal.cupo_actual));
    const seleccionados = enrollCandidates.filter(student => selectedEnrollIds.includes(Number(student.id_estudiante))).slice(0, cuposDisponibles);
    if (!seleccionados.length) return show('Selecciona al menos un estudiante y verifica que haya cupos disponibles', 'error');

    setEnrollingId('batch');
    let inscritosCorrectamente = 0;
    const errores = [];
    for (const student of seleccionados) {
      try {
        await api.post('/inscripciones', { id_estudiante: student.id_estudiante, id_oferta: enrollModal.id_oferta });
        inscritosCorrectamente += 1;
      } catch (e) {
        errores.push(e.response?.data?.error || `No se pudo inscribir a ${student.nombre_completo}`);
      }
    }

    try {
      const [{ data: nuevasInscripciones }, { data: nuevasOfertas }] = await Promise.all([api.get('/inscripciones'), api.get('/ofertas')]);
      setInscripciones(nuevasInscripciones);
      setOfertas(nuevasOfertas);
      if (inscritosCorrectamente) {
        show(errores.length
          ? `${inscritosCorrectamente} estudiantes inscritos; ${errores.length} no se pudieron inscribir. ${errores[0]}`
          : `${inscritosCorrectamente} estudiantes inscritos en la oferta`);
        setEnrollModal(null);
      } else {
        show(errores[0] || 'No se pudo inscribir a los estudiantes', 'error');
      }
    } catch (e) {
      show(e.response?.data?.error || 'No se pudieron actualizar las inscripciones', 'error');
    } finally {
      setEnrollingId(null);
    }
  }

  async function acreditarHoras(inscripcionId, horas) {
    try {
      await api.patch(`/inscripciones/${inscripcionId}/horas`, { horas_acreditadas: horas });
      show('Horas acreditadas');
      const [{ data: nuevasInscripciones }, { data: nuevasOfertas }] = await Promise.all([
        api.get('/inscripciones'),
        api.get('/ofertas')
      ]);
      setInscripciones(nuevasInscripciones);
      setOfertas(nuevasOfertas);
    } catch (e) {
      show(e.response?.data?.error || 'Error al acreditar horas', 'error');
    }
  }

  async function eliminarInscripcion(inscripcionId) {
    try {
      await api.delete(`/inscripciones/${inscripcionId}`);
      show('Inscripción eliminada');
      const [{ data: nuevasInscripciones }, { data: nuevasOfertas }] = await Promise.all([
        api.get('/inscripciones'),
        api.get('/ofertas')
      ]);
      setInscripciones(nuevasInscripciones);
      setOfertas(nuevasOfertas);
    } catch (e) {
      show(e.response?.data?.error || 'Error al eliminar inscripción', 'error');
    }
  }

  async function cambiarEstadoInscripcion(inscripcionId, estado) {
    try {
      await api.patch(`/inscripciones/${inscripcionId}/estado`, { estado });
      show(estado === 'aceptado' ? 'Inscripción aceptada' : 'Inscripción rechazada');
      const [{ data: nuevasInscripciones }, { data: nuevasOfertas }] = await Promise.all([
        api.get('/inscripciones'),
        api.get('/ofertas')
      ]);
      setInscripciones(nuevasInscripciones);
      setOfertas(nuevasOfertas);
      if (adminDetModal) {
        const ofertaActualizada = nuevasOfertas.find(o => o.id_oferta === adminDetModal.id_oferta);
        if (ofertaActualizada) setAdminDetModal(ofertaActualizada);
      }
    } catch (e) {
      show(e.response?.data?.error || 'Error al actualizar inscripción', 'error');
    }
  }

  const filtered = ofertas.filter(o => {
    const coincideQuery   = !query || o.titulo.toLowerCase().includes(query.toLowerCase());
    const coincideEstado = papelera || (historial ? !toBoolean(o.activo) : toBoolean(o.activo));
    const coincideFechaCreacion =
      !historial ||
      !fechaCreacionFiltro ||
      String(o.created_at || '').slice(0, 10) === fechaCreacionFiltro;
    const coincideFiltroCarrera =
      !carreraFiltro ||
      (carreraFiltro === 'general' && !o.id_carrera) ||
      String(o.id_carrera || '') === carreraFiltro;
    return coincideQuery && coincideEstado && coincideFechaCreacion && coincideFiltroCarrera;
  });

  if (loading) return <Spinner />;

  return (
    <>
      <PageHeader
        title={historial ? 'Historial de ofertas' : 'Gestión de ofertas'}
        subtitle={historial ? 'Consulta ofertas finalizadas' : 'Administra las ofertas de servicio social'}
      />

      <div className="offer-filters" style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ position:'relative', flex:1 }}>
            <span style={{
              position:'absolute',
              left:12,
              top:'50%',
              transform:'translateY(-50%)',
              fontSize:14,
              color:'#8d97b8'
            }}>⌕</span>
            <input
              id="ofertas-buscar"
              name="ofertas-buscar"
              value={query} onChange={e=>setQuery(e.target.value)}
              placeholder="Buscar oferta..."
              style={{ width:'100%', background:'#fff', border:'1px solid rgba(10,27,78,.15)', borderRadius:8, padding:'9px 14px 9px 34px', fontFamily:'inherit', fontSize:13, color:'var(--text)', outline:'none', boxShadow:'0 1px 3px rgba(10,27,78,.06)' }}
            />
          </div>
          <select
            id="ofertas-filtro-carrera"
            name="ofertas-filtro-carrera"
            value={carreraFiltro}
            onChange={e => setCarreraFiltro(e.target.value)}
            style={{
              background:'#fff',
              border:'1px solid rgba(10,27,78,.15)',
              borderRadius:8,
              padding:'9px 12px',
              fontFamily:'inherit',
              fontSize:13,
              color:'#8d97b8',
              outline:'none',
              boxShadow:'0 1px 3px rgba(10,27,78,.06)',
              minWidth:220
            }}
          >
            <option value="">Todas las carreras</option>
            <option value="general">Oferta para todas las carreras</option>
            {carreras.map(c => <option key={c.id_carrera} value={c.id_carrera}>{c.nombre_carrera}</option>)}
          </select>
          {historial && (
            <input
              id="ofertas-filtro-fecha-creacion"
              name="ofertas-filtro-fecha-creacion"
              type="date"
              value={fechaCreacionFiltro}
              onChange={e => setFechaCreacionFiltro(e.target.value)}
              title="Filtrar por fecha de creación"
              style={{
                background:'#fff',
                border:'1px solid rgba(10,27,78,.15)',
                borderRadius:8,
                padding:'9px 12px',
                fontFamily:'inherit',
                fontSize:13,
                color:'#8d97b8',
                outline:'none',
                boxShadow:'0 1px 3px rgba(10,27,78,.06)',
                minWidth:180
              }}
            />
          )}
          {papelera && <Btn variant="outline" onClick={() => setConfirmacionPapelera({ tipo:'vaciar' })} disabled={!ofertas.length}>Vaciar papelera</Btn>}
          {!historial && !papelera && <Btn variant="accent" onClick={openNew}>+ Nueva oferta</Btn>}
        </div>

      {/* ADMIN CARDS */}
      {filtered.length === 0
          ? <EmptyState msg={papelera ? 'La papelera está vacía.' : historial ? 'No hay ofertas finalizadas en el historial.' : 'No hay ofertas activas registradas.'} />
          : <div className="offer-cards" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:18 }}>
              {filtered.map(o => (
                <AdminOfertaCard
                  key={o.id_oferta}
                  o={o}
                  papelera={papelera}
                  onOpen={() => !papelera && openAdminDetalle(o)}
                  onEdit={() => openEdit(o)}
                  onToggle={() => o.activo ? setConfirmToggle(o) : toggleOferta(o.id_oferta)}
                  onEnroll={() => openEnrollModal(o)}
                  onTrash={() => setConfirmacionPapelera({ tipo:'mover', oferta:o })}
                  onRestore={() => restaurarOferta(o.id_oferta)}
                  onDeleteForever={() => setConfirmacionPapelera({ tipo:'eliminar', oferta:o })}
                />
              ))}
            </div>
      }

      {/* MODAL FORM (admin) */}
      <Modal open={modal} onClose={() => setModal(false)}
        title={editId ? 'Editar oferta' : 'Nueva oferta'}
        footer={<>
          <Btn variant="outline" onClick={() => setModal(false)}>Cancelar</Btn>
          <Btn variant="accent"  onClick={saveOferta} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Btn>
        </>}
      >
        <Field label="Título"><Input required name="oferta-titulo" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})} placeholder="Escribir título" /></Field>
        <Field label="Descripción"><Textarea required name="oferta-descripcion" value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} placeholder="Escribir descripción" /></Field>
        <Field label="Institución o entidad receptora"><Input name="oferta-institucion" value={form.institucion_receptora} onChange={e=>setForm({...form,institucion_receptora:e.target.value})} placeholder="Nombre de la institución receptora" /></Field>
        <Field label="Modalidad"><Select name="oferta-modalidad" value={form.modalidad} onChange={e=>setForm({...form,modalidad:e.target.value})}><option value="">Selecciona modalidad</option><option value="Presencial">Presencial</option><option value="Virtual">Virtual</option><option value="Híbrida">Híbrida</option></Select></Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:12 }}>
          <Field label="Ubicación"><Input required name="oferta-ubicacion" value={form.ubicacion} onChange={e=>setForm({...form,ubicacion:e.target.value})} placeholder="Escribir ubicación" /></Field>
        </div>
        <div className="responsive-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Fecha de inicio"><Input required name="oferta-fecha-inicio" type="date" value={form.fecha_inicio} onChange={e=>setForm({...form,fecha_inicio:e.target.value})} /></Field>
          <Field label="Fecha de finalización"><Input required name="oferta-fecha-fin" type="date" value={form.fecha_fin} onChange={e=>setForm({...form,fecha_fin:e.target.value})} /></Field>
        </div>
        <div className="responsive-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Hora de inicio">
            <TimeSelect value={form.hora_inicio} onChange={value=>setForm({...form,hora_inicio:value})} />
          </Field>
          <Field label="Hora de finalización">
            <TimeSelect value={form.hora_fin} onChange={value=>setForm({...form,hora_fin:value})} />
          </Field>
        </div>
        <div className="responsive-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Horas a acreditar"><Input required name="oferta-horas" type="number" value={form.es_ambiental ? 25 : form.horas_acreditar} disabled={form.es_ambiental} onChange={e=>setForm({...form,horas_acreditar:+e.target.value})} min={1} max={500} /></Field>
          <Field label="Cupo máximo"><Input required name="oferta-cupo" type="number" value={form.cupo_maximo} onChange={e=>setForm({...form,cupo_maximo:+e.target.value})} min={1} /></Field>
        </div>
        <label style={{
          display:'flex',
          alignItems:'center',
          gap:10,
          margin:'2px 0 14px',
          fontSize:13,
          color:'var(--text2)',
          cursor:'pointer'
        }}>
          <input
            id="oferta-es-ambiental"
            name="oferta-es-ambiental"
            type="checkbox"
            checked={form.es_ambiental}
            onChange={e=>setForm({...form, es_ambiental:e.target.checked, horas_acreditar:e.target.checked ? 25 : form.horas_acreditar})}
          />
          Actividad ambiental (25 horas obligatorias)
        </label>
        <Field label="Carrera (opcional)">
          <Select required name="oferta-carrera" value={form.id_carrera} onChange={e=>setForm({...form,id_carrera:e.target.value})}>
            <option value="">Todas las carreras</option>
            {carreras.map(c => <option key={c.id_carrera} value={c.id_carrera}>{c.nombre_carrera}</option>)}
          </Select>
        </Field>
        <Field label="Imagen de la oferta (opcional)">
          <ImageDropField
            value={form.imagen_url}
            file={imageFile}
            onFile={file => setImageFile(file)}
            onUrlChange={url => setForm({...form, imagen_url:url})}
          />
        </Field>
      </Modal>

      {adminDetModal && (
        <AdminInscritosModal
          o={adminDetModal}
          inscritos={inscripciones.filter(i => i.id_oferta === adminDetModal.id_oferta && i.estado !== 'rechazado')}
          onClose={() => setAdminDetModal(null)}
          onAcreditar={acreditarHoras}
          onCambiarEstado={cambiarEstadoInscripcion}
          onEliminar={eliminarInscripcion}
        />
      )}

      {enrollModal && (
        <Modal
          open
          title={`Inscribir estudiantes · ${enrollModal.titulo}`}
          onClose={() => enrollingId === null && setEnrollModal(null)}
          width={620}
          footer={<>
            <Btn variant="outline" onClick={() => { setConfirmEnroll(false); setEnrollModal(null); }} disabled={enrollingId !== null}>Cerrar</Btn>
            <Btn variant="green" onClick={() => setConfirmEnroll(true)} disabled={enrollingId !== null || selectedEnrollIds.length === 0 || Number(enrollModal.cupo_actual) >= Number(enrollModal.cupo_maximo)}>
              {enrollingId !== null ? 'Inscribiendo...' : `Aceptar${selectedEnrollIds.length ? ` (${selectedEnrollIds.length})` : ''}`}
            </Btn>
          </>}
        >
          <p style={{ marginBottom:12, color:'var(--text2)', fontSize:13 }}>
            {enrollModal.nombre_carrera ? `Estudiantes de ${enrollModal.nombre_carrera}` : 'Estudiantes de cualquier carrera'}
          </p>
          <Input value={enrollQuery} onChange={e=>setEnrollQuery(e.target.value)} placeholder="Buscar por nombre o expediente" aria-label="Buscar estudiante para inscribir" />
          <div style={{ display:'grid', gap:8, marginTop:12, maxHeight:360, overflowY:'auto' }}>
            {enrollLoading ? <Spinner /> : enrollCandidates
              .filter(student => `${student.nombre_completo} ${student.numero_expediente || ''}`.toLowerCase().includes(enrollQuery.trim().toLowerCase()))
              .map(student => (
                <label key={student.id_estudiante} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', border:'1px solid var(--border)', borderRadius:8, cursor:'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedEnrollIds.includes(Number(student.id_estudiante))}
                    disabled={enrollingId !== null || (!selectedEnrollIds.includes(Number(student.id_estudiante)) && selectedEnrollIds.length >= Number(enrollModal.cupo_maximo) - Number(enrollModal.cupo_actual))}
                    onChange={e => setSelectedEnrollIds(current => e.target.checked
                      ? [...current, Number(student.id_estudiante)]
                      : current.filter(id => id !== Number(student.id_estudiante)))}
                  />
                  <span style={{ minWidth:0 }}>
                    <strong style={{ display:'block', color:'var(--text)', fontSize:13 }}>{student.nombre_completo}</strong>
                    <span style={{ color:'var(--text3)', fontSize:12 }}>Expediente {student.numero_expediente} · {student.nombre_carrera}</span>
                  </span>
                </label>
              ))}
            {!enrollLoading && enrollCandidates.filter(student => `${student.nombre_completo} ${student.numero_expediente || ''}`.toLowerCase().includes(enrollQuery.trim().toLowerCase())).length === 0 && (
              <EmptyState msg={enrollCandidates.length ? 'No hay estudiantes que coincidan con la búsqueda.' : 'No hay estudiantes disponibles de esta carrera para inscribir.'} />
            )}
          </div>
          <p style={{ marginTop:10, color:'var(--text3)', fontSize:12 }}>
            Cupos disponibles: {Math.max(0, Number(enrollModal.cupo_maximo) - Number(enrollModal.cupo_actual))}
          </p>
          {Number(enrollModal.cupo_actual) >= Number(enrollModal.cupo_maximo) && <p style={{ marginTop:4, color:'var(--red)', fontSize:12 }}>La oferta ya alcanzó su cupo máximo.</p>}
        </Modal>
      )}

      {confirmEnroll && enrollModal && (
        <Modal
          open
          title="Confirmar inscripción"
          onClose={() => setConfirmEnroll(false)}
          width={500}
          footer={<>
            <Btn variant="outline" onClick={() => setConfirmEnroll(false)} disabled={enrollingId !== null}>Cancelar</Btn>
            <Btn variant="green" onClick={() => { setConfirmEnroll(false); inscribirSeleccionados(); }} disabled={enrollingId !== null}>
              {enrollingId !== null ? 'Inscribiendo...' : 'Confirmar inscripción'}
            </Btn>
          </>}
        >
          <p style={{ color:'var(--text2)', fontSize:14, lineHeight:1.6 }}>
            ¿Estás seguro de inscribir a estos {selectedEnrollIds.length} estudiante(s) en <strong style={{ color:'var(--text)' }}>{enrollModal.titulo}</strong>?
          </p>
          <ul style={{ margin:'12px 0 0', paddingLeft:20, color:'var(--text2)', fontSize:13, lineHeight:1.7 }}>
            {enrollCandidates.filter(student => selectedEnrollIds.includes(Number(student.id_estudiante))).map(student => (
              <li key={student.id_estudiante}>{student.nombre_completo} · {student.numero_expediente}</li>
            ))}
          </ul>
        </Modal>
      )}

      {confirmacionPapelera && (
        <Modal
          open
          title={confirmacionPapelera.tipo === 'mover' ? 'Mover oferta a papelera' : confirmacionPapelera.tipo === 'vaciar' ? 'Vaciar papelera' : 'Eliminar oferta definitivamente'}
          onClose={() => !procesandoPapelera && setConfirmacionPapelera(null)}
          width={470}
          footer={<>
            <Btn variant="outline" onClick={() => setConfirmacionPapelera(null)} disabled={procesandoPapelera}>Cancelar</Btn>
            <Btn variant="outline" onClick={ejecutarAccionPapelera} disabled={procesandoPapelera} style={{ color:'#c53030', borderColor:'#f1a6a6' }}>
              {procesandoPapelera ? 'Procesando...' : confirmacionPapelera.tipo === 'mover' ? 'Mover a papelera' : confirmacionPapelera.tipo === 'vaciar' ? 'Vaciar papelera' : 'Eliminar ahora'}
            </Btn>
          </>}
        >
          <p style={{ color:'var(--text2)', lineHeight:1.6, fontSize:14 }}>
            {confirmacionPapelera.tipo === 'mover'
              ? <>¿Estás seguro de mover <strong>{confirmacionPapelera.oferta.titulo}</strong> a la papelera? Se eliminará automáticamente en 30 días. Solo se puede mover si no tiene inscripciones ni horas acreditadas.</>
              : confirmacionPapelera.tipo === 'vaciar'
                ? <>¿Estás seguro de vaciar la papelera? Se eliminarán definitivamente todas las ofertas que contiene y no se podrán recuperar.</>
                : <>¿Estás seguro de eliminar definitivamente <strong>{confirmacionPapelera.oferta.titulo}</strong>? Esta acción no se puede deshacer.</>}
          </p>
        </Modal>
      )}

      {confirmToggle && (
        <Modal
          open
          title="Finalizar oferta"
          onClose={() => setConfirmToggle(null)}
          width={430}
          footer={
            <>
              <Btn variant="outline" onClick={() => setConfirmToggle(null)}>Cancelar</Btn>
              <Btn
                variant="outline"
                onClick={() => toggleOferta(confirmToggle.id_oferta)}
                style={{
                  background: 'rgba(107,63,160,.10)',
                  color: '#5a2d91',
                  border: '1px solid rgba(107,63,160,.30)'
                }}
              >
                Finalizar
              </Btn>
            </>
          }
        >
          <div style={{ fontSize:14, color:'var(--text2)', lineHeight:1.6 }}>
            ¿Estás seguro de finalizar esta oferta? Se moverá al historial y dejará de aparecer entre las ofertas disponibles para los estudiantes.
          </div>
          <div style={{ marginTop:10, fontSize:13, fontWeight:700, color:'var(--text)' }}>
            {confirmToggle.titulo}
          </div>
        </Modal>
      )}

      <Toast toast={toast} />
    </>
  );
}

function AdminOfertaCard({ o, onOpen, onEdit, onToggle, onEnroll, papelera = false, onTrash, onRestore, onDeleteForever }) {
  const pct = o.cupo_maximo > 0 ? Math.round((o.cupo_actual/o.cupo_maximo)*100) : 0;
  const barColor = pct > 80 ? 'var(--red)' : pct > 50 ? 'var(--amber)' : 'var(--green)';

  return (
    <div style={{
      background:'#fff',
      border:'1px solid rgba(10,27,78,.10)',
      borderRadius:'var(--radius)',
      overflow:'hidden',
      boxShadow:'0 1px 4px rgba(10,27,78,.06)',
      display:'flex',
      flexDirection:'column',
      minHeight:'100%',
      cursor:'pointer',
      transition:'border-color .2s, box-shadow .2s, transform .2s'
    }}
      onClick={onOpen}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(10,27,78,.22)';e.currentTarget.style.boxShadow='0 4px 16px rgba(10,27,78,.10)';e.currentTarget.style.transform='translateY(-2px)'}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(10,27,78,.10)';e.currentTarget.style.boxShadow='0 1px 4px rgba(10,27,78,.06)';e.currentTarget.style.transform='translateY(0)'}}
    >
      {o.imagen_url
        ? <img src={imageSrc(o.imagen_url)} alt={o.titulo} style={{ width:'100%', height:150, objectFit:'cover' }} onError={e=>e.currentTarget.style.display='none'} />
        : <div style={{ width:'100%', height:150, background:'linear-gradient(135deg,#e8eaf2 0%,#d0d5ea 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>SS</div>
      }

      <div style={{ padding:16, display:'flex', flexDirection:'column', flex:1 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, marginBottom:8 }}>
          <div style={{ fontSize:16, fontWeight:700, lineHeight:1.35, color:'var(--text)' }}>{o.titulo}</div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6, flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              {o.es_ambiental ? <span title="Servicio ambiental" style={{ color:'var(--green)', fontSize:16, lineHeight:1 }}>🌱</span> : null}
              <Badge type={o.activo ? 'active' : 'finalizado'} style={{ width:86, boxSizing:'border-box', textAlign:'center' }}>
                {o.activo ? 'Activo' : 'Finalizada'}
              </Badge>
            </div>
            {papelera ? <span style={{ fontSize:11, color:'var(--text3)', whiteSpace:'nowrap' }}>Se elimina: {formatDate(o.eliminar_en)}</span> : o.created_at && (
              <span style={{ fontSize:11, color:'var(--text3)', whiteSpace:'nowrap' }}>
                Creada: {formatDate(o.created_at)}
              </span>
            )}
          </div>
        </div>

        <div style={{
          fontSize:13,
          color:'var(--text2)',
          lineHeight:1.6,
          marginBottom:12,
          display:'-webkit-box',
          WebkitLineClamp:2,
          WebkitBoxOrient:'vertical',
          overflow:'hidden'
        }}>
          {o.descripcion}
        </div>

        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
          <Tag color="blue">{o.horas_acreditar}h</Tag>
          {(o.fecha_inicio || o.fecha_fin) && <Tag color="gray">{formatDate(o.fecha_inicio) || 'Inicio'} - {formatDate(o.fecha_fin) || 'Fin'}</Tag>}
          {(o.hora_inicio || o.hora_fin) && <Tag color="gray">{formatTime(o.hora_inicio) || '--:--'} - {formatTime(o.hora_fin) || '--:--'}</Tag>}
          {o.institucion_receptora && <Tag color="gray">{o.institucion_receptora}</Tag>}
          {o.modalidad && <Tag color="gray">{o.modalidad}</Tag>}
          {o.ubicacion && <Tag color="gray">{o.ubicacion}</Tag>}
          {o.es_ambiental ? <Tag color="green">Ambiental</Tag> : null}
          {o.nombre_carrera ? <Tag color="green">{o.nombre_carrera}</Tag> : <Tag color="amber">Todas las carreras</Tag>}
        </div>

        <div style={{ paddingTop:12, borderTop:'1px solid rgba(10,27,78,.08)', marginTop:'auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', gap:10, fontSize:12, color:'var(--text3)', marginBottom:6 }}>
            <span>{o.cupo_actual}/{o.cupo_maximo} inscritos</span>
            <span>{pct}%</span>
          </div>
          <div style={{ height:5, background:'#e8eaf2', borderRadius:3, marginBottom:14 }}>
            <div style={{ height:'100%', width:`${pct}%`, background:barColor, borderRadius:3 }} />
          </div>

          {papelera ? <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <Btn variant="green" onClick={e => { e.stopPropagation(); onRestore(); }}>Restaurar</Btn>
            <Btn variant="outline" onClick={e => { e.stopPropagation(); onDeleteForever(); }} style={{ color:'#c53030', borderColor:'#f1a6a6' }}>Eliminar ahora</Btn>
          </div> : <>
            {o.activo && <Btn variant="green" onClick={e => { e.stopPropagation(); onEnroll(); }} style={{ width:'100%', justifyContent:'center', marginBottom:8 }}>
              Inscribir estudiantes
            </Btn>}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <Btn variant="outline" onClick={e => { e.stopPropagation(); onEdit(); }}>Editar</Btn>
              <Btn
                variant={o.activo ? 'outline' : 'green'}
                onClick={e => { e.stopPropagation(); onToggle(); }}
                style={o.activo ? { background:'rgba(107,63,160,.10)', color:'#5a2d91', border:'1px solid rgba(107,63,160,.30)' } : undefined}
              >{o.activo ? 'Finalizar' : 'Activar'}</Btn>
            </div>
            <Btn variant="outline" onClick={e => { e.stopPropagation(); onTrash(); }} style={{ width:'100%', justifyContent:'center', marginTop:8, color:'#c53030', borderColor:'#f1a6a6' }}>Eliminar oferta</Btn>
          </> }
        </div>
      </div>
    </div>
  );
}

function AdminInscritosModal({ o, inscritos, onClose, onAcreditar, onCambiarEstado, onEliminar }) {
  const [query, setQuery] = useState('');
  const [confirmEliminar, setConfirmEliminar] = useState(null);
  const [confirmMasiva, setConfirmMasiva] = useState(false);
  const [savingMasiva, setSavingMasiva] = useState(false);
  const inscritosKey = inscritos
    .map(i => `${i.id_inscripcion}:${i.horas_acreditadas ?? ''}:${i.horas_acreditar ?? ''}`)
    .join('|');
  const [horasPorInscripcion, setHorasPorInscripcion] = useState(() =>
    Object.fromEntries(inscritos.map(i => [
      i.id_inscripcion,
      i.horas_acreditadas ?? i.horas_acreditar ?? o.horas_acreditar
    ]))
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHorasPorInscripcion(Object.fromEntries(inscritos.map(i => [
      i.id_inscripcion,
      i.horas_acreditadas ?? i.horas_acreditar ?? o.horas_acreditar
    ])));
  }, [inscritosKey, o.horas_acreditar]);

  function setHoras(id, value) {
    setHorasPorInscripcion(prev => ({ ...prev, [id]: value }));
  }

  const inscritosFiltrados = inscritos.filter(i => {
    const carrera = i.nombre_carrera || i.carrera || i.estudiante_carrera || '';
    const texto = `${i.estudiante_nombre} ${i.numero_expediente || ''} ${i.correo_institucional} ${carrera}`.toLowerCase();
    return !query || texto.includes(query.trim().toLowerCase());
  });
  const participantesReporte = inscritos
    .filter(i => i.estado === 'finalizado')
    .map(i => ({
      ...i,
      horas_asignadas: horasPorInscripcion[i.id_inscripcion] ?? i.horas_acreditadas ?? i.horas_acreditar ?? o.horas_acreditar
    }));
  const candidatosMasiva = inscritos.filter(i =>
    i.estado === 'aceptado' &&
    i.horas_acreditadas === null
  );

  function descargarConstanciaOferta() {
    generarPDFOferta({ oferta: o, participantes: participantesReporte });
  }

  async function acreditarMasivamente() {
    setSavingMasiva(true);
    try {
      for (const inscrito of candidatosMasiva) {
        await onAcreditar(inscrito.id_inscripcion, o.horas_acreditar);
      }
      setConfirmMasiva(false);
    } finally {
      setSavingMasiva(false);
    }
  }

  return (
    <>
      <Modal open title={`Inscritos en ${o.titulo}`} onClose={onClose} width={640}
        footer={<Btn variant="outline" onClick={onClose}>Cerrar</Btn>}
      >
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:16 }}>
          <div style={{ fontSize:13, color:'var(--text2)' }}>
            {inscritos.length}/{o.cupo_maximo} estudiantes inscritos
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', justifyContent:'flex-end' }}>
            <Btn
              variant="green"
              onClick={() => setConfirmMasiva(true)}
              disabled={candidatosMasiva.length === 0}
              style={{ whiteSpace:'nowrap' }}
            >
              Acreditación Masiva
            </Btn>
            <Btn
              variant="accent"
              onClick={descargarConstanciaOferta}
              disabled={participantesReporte.length === 0}
              style={{ whiteSpace:'nowrap' }}
            >
              <span aria-hidden="true">{'\uD83D\uDCC4'}</span>
              Constancia de actividad
            </Btn>
          </div>
        </div>

        <div style={{ position:'relative', marginBottom:14 }}>
        <span style={{
          position:'absolute',
          left:12,
          top:'50%',
          transform:'translateY(-50%)',
          fontSize:14,
          color:'var(--text3)'
        }}>⌕</span>
        <input
          id="inscritos-buscar-alumno"
          name="inscritos-buscar-alumno"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar alumno..."
          style={{
            width:'100%',
            background:'#fff',
            border:'1px solid rgba(10,27,78,.15)',
            borderRadius:8,
            padding:'9px 14px 9px 34px',
            fontFamily:'inherit',
            fontSize:13,
            color:'var(--text)',
            outline:'none',
            boxShadow:'0 1px 3px rgba(10,27,78,.06)'
          }}
        />
      </div>

      {inscritos.length === 0 ? (
        <EmptyState msg="Aún no hay estudiantes inscritos en esta oferta." />
      ) : inscritosFiltrados.length === 0 ? (
        <EmptyState msg="No hay alumnos que coincidan con la búsqueda." />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {inscritosFiltrados.map(i => {
            const horasAcreditadas = i.estado === 'finalizado' || i.horas_acreditadas !== null && i.horas_acreditadas !== undefined;
            const estaPendiente = i.estado === 'pendiente';
            const estaAceptado = i.estado === 'aceptado';
            const esAmbiental = Boolean(o.es_ambiental);
            return (
            <div key={i.id_inscripcion} style={{
              border:'1px solid rgba(10,27,78,.10)',
              borderRadius:10,
              padding:'12px 14px',
              background:'var(--bg)'
            }}>
              <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) auto', alignItems:'center', gap:16 }}>
                <div style={{ minWidth:0, display:'flex', flexDirection:'column', gap:4 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', overflowWrap:'anywhere' }}>
                    {i.estudiante_nombre}
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', columnGap:12, rowGap:3, fontSize:11, color:'var(--text2)' }}>
                    <span>Expediente: {i.numero_expediente || 'Pendiente'}</span>
                    <span style={{ overflowWrap:'anywhere' }}>
                    {i.correo_institucional}
                    </span>
                  </div>
                  <div style={{ fontSize:11, color:'var(--text2)', overflowWrap:'anywhere' }}>
                    {i.nombre_carrera || i.carrera || i.estudiante_carrera || 'Carrera no asignada'}
                  </div>
                </div>

                <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:7, flexWrap:'wrap' }}>
                  <Badge type={i.estado}>{i.estado}</Badge>
                  {estaPendiente ? (
                    <>
                      <Btn
                        variant="green"
                        onClick={() => onCambiarEstado(i.id_inscripcion, 'aceptado')}
                        style={{ padding:'6px 10px' }}
                      >
                        Aceptar
                      </Btn>
                      <Btn
                        variant="danger"
                        onClick={() => onCambiarEstado(i.id_inscripcion, 'rechazado')}
                        style={{
                          padding:'6px 10px',
                          background: 'rgba(217,48,37,.08)',
                          color: '#b52920',
                          border: '1px solid rgba(217,48,37,.30)'
                        }}
                      >
                        Rechazar
                      </Btn>
                    </>
                  ) : (
                    <>
                      <input
                        id={`inscripcion-horas-${i.id_inscripcion}`}
                        name={`inscripcion-horas-${i.id_inscripcion}`}
                        type="number"
                        min="0"
                        max={i.horas_oferta || o.horas_acreditar}
                        value={esAmbiental ? o.horas_acreditar : horasPorInscripcion[i.id_inscripcion] ?? ''}
                        disabled={!estaAceptado || esAmbiental}
                        onChange={e => setHoras(i.id_inscripcion, e.target.value)}
                        title={esAmbiental ? 'Las actividades ambientales acreditan 25 horas' : 'Horas a acreditar'}
                        style={{
                          width:70,
                          background: estaAceptado && !esAmbiental ? '#fff' : 'rgba(10,27,78,.04)',
                          border:'1px solid var(--border2)',
                          borderRadius:6,
                          padding:'6px 8px',
                          fontFamily:'inherit',
                          fontSize:12,
                          color: estaAceptado && !esAmbiental ? 'var(--text)' : 'var(--text3)',
                          cursor: estaAceptado && !esAmbiental ? 'text' : 'not-allowed'
                        }}
                      />
                      <Btn
                        variant="green"
                        onClick={() => onAcreditar(i.id_inscripcion, esAmbiental ? o.horas_acreditar : horasPorInscripcion[i.id_inscripcion])}
                        disabled={!estaAceptado}
                        style={{ padding:'6px 10px' }}
                      >
                        Acreditar
                      </Btn>
                      <button
                        type="button"
                        onClick={() => setConfirmEliminar(i)}
                        disabled={horasAcreditadas}
                        title={horasAcreditadas ? 'No se puede eliminar una inscripción con horas acreditadas' : 'Eliminar inscripción'}
                        style={{
                          width:30,
                          height:30,
                          borderRadius:6,
                          border: horasAcreditadas ? '1px solid rgba(10,27,78,.12)' : '1px solid rgba(217,48,37,.30)',
                          background: horasAcreditadas ? 'rgba(10,27,78,.04)' : 'none',
                          color: horasAcreditadas ? 'var(--text3)' : '#b52920',
                          fontSize:16,
                          fontWeight:700,
                          cursor: horasAcreditadas ? 'not-allowed' : 'pointer',
                          opacity: horasAcreditadas ? .65 : 1,
                          lineHeight:1
                        }}
                      >
                        X
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
          })}
        </div>
        )}
      </Modal>

      {confirmEliminar && (
        <Modal
          open
          title="Eliminar inscripción"
          onClose={() => setConfirmEliminar(null)}
          width={420}
          footer={
            <>
              <Btn
                variant="danger"
                onClick={() => setConfirmEliminar(null)}
                style={{
                  background: 'rgba(217,48,37,.08)',
                  color: '#b52920',
                  border: '1px solid rgba(217,48,37,.30)'
                }}
              >
                Cancelar
              </Btn>
              <Btn
                variant="outline"
                onClick={async () => {
                  await onEliminar(confirmEliminar.id_inscripcion);
                  setConfirmEliminar(null);
                }}
              >
                Aceptar
              </Btn>
            </>
          }
        >
          <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6, margin:0 }}>
            ¿Estás seguro de eliminar la inscripción de{' '}
            <strong style={{ color:'var(--text)' }}>{confirmEliminar.estudiante_nombre}</strong>?
          </p>
        </Modal>
      )}

      {confirmMasiva && (
        <Modal
          open
          title="Acreditación masiva"
          onClose={() => !savingMasiva && setConfirmMasiva(false)}
          width={460}
          footer={
            <>
              <Btn variant="outline" onClick={() => setConfirmMasiva(false)} disabled={savingMasiva}>Cancelar</Btn>
              <Btn variant="green" onClick={acreditarMasivamente} disabled={savingMasiva}>
                {savingMasiva ? 'Acreditando...' : 'Aceptar'}
              </Btn>
            </>
          }
        >
          <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6, margin:0 }}>
            Se acreditarán <strong style={{ color:'var(--text)' }}>{o.horas_acreditar} horas</strong> a{' '}
            <strong style={{ color:'var(--text)' }}>{candidatosMasiva.length}</strong>{' '}
            estudiante{candidatosMasiva.length !== 1 ? 's' : ''} aceptado{candidatosMasiva.length !== 1 ? 's' : ''} sin horas acreditadas.
            Los estudiantes finalizados no se modificarán.
          </p>
        </Modal>
      )}
    </>
  );
}

