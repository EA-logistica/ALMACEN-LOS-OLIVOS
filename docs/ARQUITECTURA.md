# Arquitectura — Mapa de Almacenes

## Flujo de datos

```
radar_naranjal.html  (const DATA — original, solo lectura)
        │  backend/src/data/radar-source.js   → parsea y congela; relee si cambia el archivo
        ▼
services/warehouses.js
        │  + ubicacion   ← services/locations.js  (manual → datos existentes → caché de geocodificación)
        │  + logistica   ← storage/logistica.json
        ▼
GET /api/almacenes   { fuente, parametros, origen, almacenes: [{ key, original, ubicacion, logistica }] }
        ▼
frontend js/data/adapter.js   original → modelo de vista (área/precio interpretados, tipología, búsqueda…)
        ▼
main.js ──► map (marcadores + clustering) · filtros · búsqueda · lista · panel · ficha
        │
        └─► GET /api/ruta?origen=lat,lon&destino=lat,lon&perfil=auto|camion
                 services/routing.js → caché → providers/routing/{osrm|ors} → providers/traffic
```

`original` viaja sin modificaciones hasta la ficha, que lo muestra campo por campo. Ningún componente escribe sobre él.

## API

| Endpoint | Uso |
|---|---|
| `GET /api/almacenes` | Registros originales + ubicación resuelta + datos logísticos + planta |
| `GET /api/origen` | Planta principal con su ubicación resuelta |
| `GET /api/ruta?origen=&destino=&perfil=` | Distancia, tiempo vía libre, tiempo estimado (factor), geometría GeoJSON |
| `GET /api/geocodificar?direccion=` | Dirección → coordenadas (Nominatim, caché permanente, 1 req/s) |
| `GET /api/config` | Perfiles de vehículo disponibles y proveedores activos (sin credenciales) |

Las coordenadas se validan dentro de un rectángulo que abarca Perú, lo que evita usar la API para consultas ajenas a la plataforma.

## Cambiar de proveedor

| Capa | Dónde | Contrato |
|---|---|---|
| Motor de mapa | `frontend/.../js/map/map-adapter.js` | Métodos documentados en el archivo; hoy `leaflet-adapter.js` |
| Capas base | `frontend/.../js/config.js` → `BASE_LAYERS` | `{ id, nombre, urls[], opciones }` |
| Rutas | `backend/src/providers/routing/` | `{ id, nombre, perfiles[], route(from, to, perfil) }` |
| Geocodificación | `backend/src/providers/geocoding/` | `{ id, geocode(address) → { lat, lon, precision, etiqueta } }` |
| Tráfico | `backend/src/providers/traffic/` | `estimate(minVíaLibre) → { tiempoReal, factor, duracionEstimadaMin, metodo }` |

Un proveedor con tráfico real (Google Routes, TomTom, HERE) se agrega como nuevo archivo en `routing/` o `traffic/`, devolviendo `tiempoReal: true`. La interfaz ya muestra el método usado en cada cálculo.

## Rendimiento

- Sin build ni dependencias npm; Leaflet se sirve localmente con caché de 7 días.
- Respuestas comprimidas con gzip y ETag para los archivos propios.
- Clustering con `chunkedLoading`; los filtros reemplazan el conjunto visible en una sola operación (`addLayers`).
- Las rutas se piden solo al presionar **Ver ruta** y se cachean en memoria (sesión) y en disco (30 días).
- La geocodificación solo se ejecuta para registros sin coordenadas; hoy son 0.

## Módulos originales

Los módulos originales se cargan dentro de iframes persistentes (`frontend/assets/js/shell.js`), sin tocar su código. El estado en memoria de "Control de Espacios" se conserva al cambiar de módulo.

Nota: el guardado de revisiones y comentarios del Radar usa `window.claude` (almacenamiento de artefactos de claude.ai). Fuera de claude.ai funciona en modo local y así lo indica la propia página. Si se desea persistirlo, se puede exponer un endpoint en el backend sin modificar la data.
