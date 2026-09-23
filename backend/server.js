// Servidor de la plataforma: sirve el frontend (carpeta /frontend) y la API (/api/*).
// Sin dependencias externas: requiere solo Node.js >= 18.
import http from 'node:http';
import { config, FRONTEND_DIR } from './src/config/env.js';
import { sendError, serveStatic } from './src/lib/http.js';
import { handleApi } from './src/routes/api.js';
import { readRadarData } from './src/data/radar-source.js';

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405);
      return res.end();
    }
    // Los módulos originales no declaran ícono: el navegador pide /favicon.ico y se entrega el de la plataforma.
    serveStatic(req, res, FRONTEND_DIR, url.pathname === '/favicon.ico' ? '/favicon.svg' : url.pathname);
  } catch (err) {
    sendError(req, res, err);
  }
});

// Validación temprana de la fuente de datos: falla con un mensaje claro si no se puede leer.
try {
  const { meta } = readRadarData();
  console.log(`[datos] ${meta.registros} registros leídos de ${meta.archivo} (${meta.variable})`);
} catch (err) {
  console.error(`[datos] ERROR leyendo la data original: ${err.message}`);
}

server.listen(config.port, config.host, () => {
  const shownHost = config.host === '0.0.0.0' ? 'localhost' : config.host;
  console.log(`[plataforma] http://${shownHost}:${config.port}/`);
  console.log(`[routing] proveedor preferido: ${config.routing.provider}${config.routing.orsApiKey ? ' · OpenRouteService habilitado (perfil camión)' : ''}`);
});
