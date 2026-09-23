// Navegación entre módulos. Cada módulo vive en su propio iframe, que se crea al primer uso y se
// conserva al cambiar de pestaña (así no se pierde el estado en memoria de los módulos existentes).
// Los módulos originales se cargan tal cual, sin modificar su código.
const MODULES = [
  { id: 'mapa', nombre: 'Mapa de Almacenes', tag: 'nuevo', src: '/modules/mapa-almacenes/' },
  { id: 'radar', nombre: 'Radar Naranjal', tag: 'tiempos', src: '/modules/radar-naranjal/radar_naranjal.html' },
  { id: 'almacen', nombre: 'Almacén Los Olivos', tag: 'plano y control', src: '/modules/almacen-los-olivos/layout%20almacen%20los%20olivos.html' },
];
const DEFAULT = 'mapa';

const nav = document.getElementById('modules');
const frames = document.getElementById('frames');
const openTab = document.getElementById('openTab');
const loaded = new Map();

nav.innerHTML = MODULES.map((m) => `<a href="#/${m.id}" data-id="${m.id}">${m.nombre} <small>${m.tag}</small></a>`).join('');

function show(id) {
  const mod = MODULES.find((m) => m.id === id) || MODULES.find((m) => m.id === DEFAULT);
  if (!loaded.has(mod.id)) {
    const f = document.createElement('iframe');
    f.src = mod.src;
    f.title = mod.nombre;
    frames.appendChild(f);
    loaded.set(mod.id, f);
  }
  loaded.forEach((f, key) => (f.hidden = key !== mod.id));
  nav.querySelectorAll('a').forEach((a) => a.classList.toggle('active', a.dataset.id === mod.id));
  openTab.href = mod.src;
  document.title = `${mod.nombre} — PLANSA`;
}

const route = () => show(location.hash.replace(/^#\/?/, '') || DEFAULT);
window.addEventListener('hashchange', route);
route();
