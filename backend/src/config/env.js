// Carga de configuración: variables de entorno + archivo .env (sin dependencias externas).
// Las credenciales (ORS_API_KEY, etc.) solo viven aquí, en el servidor; nunca se envían al frontend.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(here, '../../..');
export const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
export const STORAGE_DIR = path.join(ROOT_DIR, 'backend', 'storage');
export const CACHE_DIR = path.join(STORAGE_DIR, 'cache');

function loadDotEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || line.trim().startsWith('#')) continue;
    const value = m[2].replace(/^(['"])(.*)\1$/, '$2');
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}
loadDotEnv(path.join(ROOT_DIR, '.env'));

const env = (k, d = '') => (process.env[k] ?? '').trim() || d;
const num = (k, d) => {
  const v = parseFloat(env(k));
  return Number.isFinite(v) ? v : d;
};

export const config = {
  port: num('PORT', 4173),
  host: env('HOST', '127.0.0.1'),
  legacyRadarFile: path.join(FRONTEND_DIR, 'modules', 'radar-naranjal', 'radar_naranjal.html'),
  routing: {
    provider: env('ROUTING_PROVIDER', 'osrm').toLowerCase(),
    osrmUrl: env('OSRM_URL', 'https://router.project-osrm.org').replace(/\/$/, ''),
    orsUrl: env('ORS_URL', 'https://api.openrouteservice.org').replace(/\/$/, ''),
    orsApiKey: env('ORS_API_KEY'),
    cacheTtlDays: num('ROUTE_CACHE_TTL_DAYS', 30),
  },
  geocoding: {
    provider: env('GEOCODING_PROVIDER', 'nominatim').toLowerCase(),
    nominatimUrl: env('NOMINATIM_URL', 'https://nominatim.openstreetmap.org').replace(/\/$/, ''),
    nominatimEmail: env('NOMINATIM_EMAIL'),
  },
  traffic: {
    factorOverride: num('TRAFFIC_FACTOR', null),
  },
  userAgent: 'PLANSA-Plataforma-Logistica/1.0 (uso interno)',
};
