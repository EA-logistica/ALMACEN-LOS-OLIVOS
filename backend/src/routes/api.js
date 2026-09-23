// Endpoints REST. Frontend -> Backend -> proveedores externos (las credenciales nunca salen del servidor).
import { HttpError, sendJson } from '../lib/http.js';
import { config } from '../config/env.js';
import { capabilities } from '../providers/routing/index.js';
import { geocode, isInPeru, PERU_BOUNDS } from '../services/locations.js';
import { computeRoute } from '../services/routing.js';
import { getOrigin, getWarehouses } from '../services/warehouses.js';

function parsePoint(value, name) {
  const [lat, lon] = String(value || '').split(',').map(Number);
  if (!isInPeru(lat, lon)) throw new HttpError(400, `Parámetro "${name}" inválido: se espera "lat,lon" dentro de Perú`);
  return { lat, lon };
}

const routes = {
  '/api/salud': () => ({ ok: true, hora: new Date().toISOString() }),

  '/api/config': () => ({
    routing: { proveedorPreferido: config.routing.provider, perfiles: capabilities(), traficoTiempoReal: false },
    geocodificacion: { proveedor: config.geocoding.provider },
    limitesPeru: PERU_BOUNDS,
  }),

  '/api/almacenes': () => getWarehouses(),

  '/api/origen': () => getOrigin(),

  '/api/geocodificar': async (q) => {
    const direccion = (q.get('direccion') || '').trim();
    if (direccion.length < 5 || direccion.length > 300) throw new HttpError(400, 'Parámetro "direccion" requerido (5–300 caracteres)');
    return geocode(direccion);
  },

  '/api/ruta': async (q) => {
    const origen = parsePoint(q.get('origen'), 'origen');
    const destino = parsePoint(q.get('destino'), 'destino');
    return computeRoute(origen, destino, q.get('perfil') || 'auto');
  },
};

export async function handleApi(req, res, url) {
  if (req.method !== 'GET' && req.method !== 'HEAD') throw new HttpError(405, 'Método no permitido');
  const handler = routes[url.pathname.replace(/\/$/, '')];
  if (!handler) throw new HttpError(404, 'Endpoint no encontrado');
  sendJson(req, res, 200, await handler(url.searchParams));
}
