// Cliente de la API del backend. Todas las llamadas a servicios externos (rutas, geocodificación)
// pasan por el backend, que aplica caché y mantiene las credenciales fuera del navegador.
import { API_BASE } from '../config.js';

const memo = new Map(); // caché en memoria por sesión: evita repetir la misma consulta

async function get(path, params) {
  const qs = params ? '?' + new URLSearchParams(params) : '';
  const url = `${API_BASE}${path}${qs}`;
  if (memo.has(url)) return memo.get(url);
  const job = fetch(url, { headers: { Accept: 'application/json' } }).then(async (res) => {
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || `Error ${res.status}`);
    return body;
  });
  memo.set(url, job);
  job.catch(() => memo.delete(url)); // no memorizar errores
  return job;
}

export const api = {
  config: () => get('/config'),
  almacenes: () => get('/almacenes'),
  ruta: (origen, destino, perfil) =>
    get('/ruta', { origen: `${origen.lat},${origen.lon}`, destino: `${destino.lat},${destino.lon}`, perfil }),
  geocodificar: (direccion) => get('/geocodificar', { direccion }),
};
