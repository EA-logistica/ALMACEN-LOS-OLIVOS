# Plataforma Logística PLANSA

Herramienta interna de Compras y Logística de **Plásticos Nacionales**. Reúne en una sola plataforma:

| Módulo | Ruta | Descripción |
|---|---|---|
| **Mapa de Almacenes** (nuevo) | `#/mapa` | Mapa interactivo de Perú centrado en Lima: almacenes, filtros, búsqueda, clustering y ruta desde la planta. |
| Radar Naranjal | `#/radar` | Evaluación de almacenes candidatos: KPIs, proximidad vs. capacidad, resumen por distrito y tabla con filtro en cada encabezado, exportación CSV y seguimiento de evaluación. |
| Almacén Los Olivos | `#/almacen` | Módulo original: plano a escala, costos y control de espacios. |

## Acceso directo

| | |
|---|---|
| **Ejecutor** | Doble clic en `INICIAR-PLATAFORMA.cmd` (o en el acceso **"Plataforma PLANSA"** del escritorio). Inicia el servidor, lo publica en Tailscale y abre el navegador. |
| **Detener** | `DETENER-PLATAFORMA.cmd` |
| **Link Tailscale** | https://desktop-d9jnq1p.tail4abc20.ts.net/ — solo equipos conectados al tailnet `tail4abc20.ts.net` |
| **Host** | `desktop-d9jnq1p` · IP Tailscale `100.93.169.28` |
| **Local** | http://127.0.0.1:4173/ |

La publicación usa `tailscale serve` (HTTPS con certificado válido, **solo dentro del tailnet**, no es pública en internet). El servidor sigue escuchando únicamente en `127.0.0.1`, sin abrir puertos en el firewall. El link funciona mientras esta PC esté encendida y el servidor en ejecución. Registro del servidor: `plataforma.log`.

## Cómo iniciar

Requisito: **Node.js 18 o superior** (no se instala ningún paquete adicional).

```bash
npm start          # http://127.0.0.1:4173
npm run verificar  # confirma que los archivos originales siguen intactos
```

Opcional: copiar `.env.example` como `.env` para cambiar el puerto, exponer la plataforma en la red interna (`HOST=0.0.0.0`) o habilitar el perfil camión.

> Los módulos deben abrirse a través del servidor (no con doble clic en el HTML), porque el mapa lee la data y calcula rutas mediante la API.

## Estructura

```
├── backend/
│   ├── server.js                  Servidor HTTP: frontend estático + API /api/*
│   ├── src/
│   │   ├── config/                env.js (variables de entorno) · origin.js (planta)
│   │   ├── data/radar-source.js   Lee `const DATA` del HTML original (solo lectura)
│   │   ├── providers/             Proveedores intercambiables
│   │   │   ├── geocoding/         nominatim.js (OpenStreetMap)
│   │   │   ├── routing/           osrm.js · openrouteservice.js (camión)
│   │   │   └── traffic/           factor fijo ×1.4 (criterio del Radar)
│   │   ├── services/              locations · routing · warehouses · reviews
│   │   ├── routes/api.js          Endpoints REST
│   │   └── lib/                   http, caché JSON, throttle
│   ├── storage/
│   │   ├── coordenadas-manuales.json   Coordenadas exactas verificadas (editable)
│   │   ├── logistica.json              Datos logísticos por almacén (editable)
│   │   ├── revisiones.json             Estado y comentarios de evaluación (autogenerado, fuera de git)
│   │   ├── integridad-originales.json  Huellas SHA-256 de los originales
│   │   └── cache/                      Caché de geocodificación y rutas (autogenerado)
│   └── scripts/verificar-integridad.js
├── frontend/
│   ├── index.html                 Contenedor de la plataforma (navegación entre módulos)
│   ├── assets/                    CSS y JS compartidos (api/, data/ adaptador y parsers, ui/format)
│   ├── vendor/                    Leaflet 1.9.4 + Leaflet.markercluster 1.5.3 (locales)
│   └── modules/
│       ├── mapa-almacenes/        Módulo nuevo (HTML + css/ + js/{map,ui})
│       ├── radar-naranjal/        index.html + css/ + js/ (vista de evaluación)
│       │                          radar_naranjal.html (original, sin cambios: fuente de datos)
│       └── almacen-los-olivos/    layout almacen los olivos.html (original, sin cambios)
└── docs/ARQUITECTURA.md           Detalle técnico, flujo de datos y cómo extender
```

## Datos

- **Fuente única:** el objeto `const DATA = {...}` de `frontend/modules/radar-naranjal/radar_naranjal.html`. El backend lo lee en cada carga (si el archivo cambia, el mapa se actualiza) y **nunca lo modifica ni lo copia**.
- Los dos archivos originales se movieron a `frontend/modules/` **byte a byte idénticos** (verificable con `npm run verificar`).
- Los 16 registros actuales ya traen coordenadas (y también la planta), así que el mapa no consulta ningún servicio de geocodificación al abrirse.
- Todo campo que no existe en la data se muestra como **"No disponible"**. Los valores calculados (precio/m², precio mensual, provincia según distrito, tipo de inmueble según título) se identifican como tales en pantalla.

### Coordenadas exactas

Para fijar coordenadas verificadas (tienen prioridad sobre la data y la geocodificación), editar `backend/storage/coordenadas-manuales.json`:

```json
{ "origen": { "lat": -11.9785, "lon": -77.0627, "nota": "verificado en sitio" },
  "almacenes": { "smp_general": { "lat": -12.00, "lon": -77.08, "nota": "dirección confirmada" } } }
```

La clave de cada almacén es la misma que usa el Radar (visible como **Código** en el panel del mapa).

### Datos logísticos

`backend/storage/logistica.json` está preparado (vacío) para cargar: zona logística, capacidad, vehículo permitido, acceso para tráiler/camión, altura libre, patio de maniobras, costo de transporte y cercanía a Panamericana Norte, Callao, puertos y vías principales. Tiempo y distancia desde la planta se toman de los datos existentes del Radar.

## Radar Naranjal (evaluación)

- **Tabla con filtro por encabezado** (⏷): lista de valores con conteo para columnas de texto categórico (distrito, modalidad, tipo, rango, estado, alertas), rango mín./máx. para numéricas (área, S/ o USD por m², km, minutos) y "contiene" para texto libre. Los filtros se combinan en cascada, se muestran como chips y gobiernan también los KPIs y gráficos.
- **Orden** por cualquier columna, **columnas visibles** configurables y **exportación CSV** (abre en Excel) de la vista filtrada.
- **Evaluación por almacén**: Pendiente → En evaluación → Visitado → Preseleccionado / Descartado, con comentario. Se guarda en el servidor (`backend/storage/revisiones.json`) y la ve todo el equipo.
- **Alertas de dato** inferidas del propio anuncio: dato a verificar, precio por consultar, ubicación aproximada, sin contacto, sin anuncio.
- **Ver en mapa** abre el Mapa de Almacenes con el almacén seleccionado.
- Se retiró el "Mapa de trayectos" esquemático; las rutas se consultan en el Mapa de Almacenes. El archivo original `radar_naranjal.html` se conserva intacto como fuente de datos.

## Rutas y tiempos

- Proveedor por defecto: **OSRM** (gratuito, sin API key, perfil automóvil).
- **Camión:** agregar `ORS_API_KEY` de [OpenRouteService](https://openrouteservice.org) (plan gratuito) en `.env`. Sin key, el sistema lo indica y muestra la ruta de automóvil.
- El tiempo se presenta siempre como **ESTIMADO**: tiempo en vía libre × 1.4 (el mismo factor de tráfico moderado que ya usa el Radar). **No es tráfico en tiempo real**; el panel ofrece un enlace para comparar en Google Maps.
- Cada ruta se guarda en caché por 30 días (`ROUTE_CACHE_TTL_DAYS`), por lo que repetir una consulta no genera llamadas externas.

## Seguridad y costos

- Las API keys solo se leen en el backend desde `.env` (excluido de git y nunca servido al navegador). Flujo: **Frontend → Backend → proveedor externo**.
- Capas de mapa sin key ni costo por consulta: OpenStreetMap y Esri (calles, gris de análisis, oscuro, satélite). CARTO se descartó porque hoy exige API key.
- Por defecto el servidor solo escucha en `127.0.0.1` (esta PC).
