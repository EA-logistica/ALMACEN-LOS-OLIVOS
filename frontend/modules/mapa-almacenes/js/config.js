// Configuración del módulo "Mapa de Almacenes". Solo datos públicos: ninguna credencial vive en el frontend.

export const API_BASE = '/api';

// Proveedor de mapa activo (ver js/map/map-adapter.js). Cambiar aquí para usar otro motor.
export const MAP_ENGINE = 'leaflet';

export const MAP_DEFAULTS = {
  center: [-11.98, -77.06], // Lima Metropolitana (encuadre que incluye Lima Norte, donde se concentran los registros)
  zoom: 11,
  minZoom: 5, // permite alejarse hasta ver todo el Perú
  maxZoom: 19,
  // Límite de desplazamiento: Perú con margen (la app no prioriza otros países).
  maxBounds: [[-19.5, -83.5], [1.5, -67.0]],
};

// Capas base sin API key ni costo por consulta. Una capa puede combinar varias teselas (`urls`), p. ej. base + etiquetas.
// Para un proveedor con key (Mapbox, Google, CARTO…), la key debe restringirse por dominio en el panel del
// proveedor o servirse las teselas a través del backend.
const OSM_ATTR = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services';
export const BASE_LAYERS = [
  {
    id: 'osm',
    nombre: 'Calles · OpenStreetMap',
    urls: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    opciones: { maxZoom: 19, attribution: OSM_ATTR },
    predeterminada: true,
  },
  {
    id: 'esri-calles',
    nombre: 'Calles · Esri',
    urls: [`${ESRI}/World_Street_Map/MapServer/tile/{z}/{y}/{x}`],
    opciones: { maxZoom: 19, attribution: 'Tiles © Esri' },
  },
  {
    id: 'esri-gris',
    nombre: 'Análisis · gris claro',
    urls: [`${ESRI}/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`, `${ESRI}/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}`],
    opciones: { maxNativeZoom: 16, maxZoom: 19, attribution: 'Tiles © Esri — Esri, HERE, Garmin, © OpenStreetMap contributors' },
  },
  {
    id: 'esri-oscuro',
    nombre: 'Análisis · oscuro',
    urls: [`${ESRI}/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`, `${ESRI}/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`],
    opciones: { maxNativeZoom: 16, maxZoom: 19, attribution: 'Tiles © Esri — Esri, HERE, Garmin, © OpenStreetMap contributors' },
  },
  {
    id: 'satelite',
    nombre: 'Satélite · Esri',
    urls: [`${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`, `${ESRI}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`],
    opciones: { maxZoom: 19, attribution: 'Imágenes © Esri, Maxar, Earthstar Geographics' },
  },
];

// Vistas rápidas de navegación (encuadres de pantalla, no son datos de ubicación de ningún inmueble).
// Para expandir a otras regiones del Perú basta agregar entradas aquí.
export const ZONAS = [
  { id: 'lima', nombre: 'Lima Metropolitana', bounds: [[-12.32, -77.2], [-11.72, -76.82]] },
  { id: 'lima-norte', nombre: 'Lima Norte', bounds: [[-12.04, -77.16], [-11.8, -76.98]] },
  { id: 'naranjal', nombre: 'Independencia · Los Olivos · SMP', bounds: [[-12.03, -77.11], [-11.93, -77.03]] },
  { id: 'norte-lejano', nombre: 'Puente Piedra · Carabayllo · Ancón', bounds: [[-11.9, -77.2], [-11.7, -77.0]] },
  { id: 'callao', nombre: 'Callao · Ventanilla', bounds: [[-12.08, -77.2], [-11.84, -77.06]] },
  { id: 'lima-este', nombre: 'Lima Este', bounds: [[-12.1, -77.0], [-11.9, -76.8]] },
  { id: 'lima-sur', nombre: 'Lima Sur', bounds: [[-12.32, -77.05], [-12.1, -76.84]] },
  { id: 'peru', nombre: 'Todo el Perú', bounds: [[-18.4, -81.4], [-0.03, -68.65]] },
];

// Paleta de marcadores.
export const COLORES = {
  origen: '#E85D2B',
  modalidad: { Alquiler: '#4A90D9', Venta: '#D9953E', Referencia: '#8B94A3' },
  band: { ideal: '#3FA66B', moderado: '#D8A92E', maximo: '#E0703A', fuera: '#7A8494' },
  ruta: '#2F7DE1',
};

export const BAND_LABEL = { ideal: 'Ideal · hasta 10 min', moderado: 'Moderado · 10–20 min', maximo: 'Máximo · 20–30 min', fuera: 'Fuera de rango · +30 min' };
