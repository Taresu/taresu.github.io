// Isometric SVG engine for the phishing journey: true 30° axes, one grid scale and one fixed light source.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const UNIT = 22;
  const COS = Math.cos(Math.PI / 6);
  const SIN = Math.sin(Math.PI / 6);
  // Light comes from above and slightly to the right: top brightest, left face darkest.
  const LIGHT = { top: 1.08, right: 0.8, left: 0.62 };

  function project(x, y, z) {
    return [(x - y) * COS * UNIT, (x + y) * SIN * UNIT - z * UNIT];
  }

  function shade(hex, face) {
    const n = parseInt(hex.slice(1), 16);
    const f = LIGHT[face];
    const channel = shift => Math.max(0, Math.min(255, Math.round(((n >> shift) & 255) * f)));
    return `rgb(${channel(16)},${channel(8)},${channel(0)})`;
  }

  function node(name, attrs) {
    const el = document.createElementNS(NS, name);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    return el;
  }

  function polygon(group, points, fill) {
    const el = node('polygon', {
      points: points.map(p => project(...p).map(v => v.toFixed(2)).join(',')).join(' '),
      fill,
      stroke: 'rgba(5,8,14,.55)',
      'stroke-width': '0.6',
      'stroke-linejoin': 'round',
    });
    group.appendChild(el);
    return el;
  }

  // Visible faces only: the +y face (front-left), the +x face (front-right) and the top.
  function box(group, x, y, z, w, d, h, color) {
    const g = node('g', {});
    polygon(g, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], shade(color, 'left'));
    polygon(g, [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], shade(color, 'right'));
    polygon(g, [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], shade(color, 'top'));
    group.appendChild(g);
    return g;
  }

  // A flat panel lying on a +y plane (a screen on the front-left face of a device).
  function screen(group, x, y, z, w, h, fill) {
    return polygon(group, [[x, y, z], [x + w, y, z], [x + w, y, z + h], [x, y, z + h]], fill);
  }

  // Text glued to the +y plane: its baseline follows the x axis and its height follows z.
  function label(group, x, y, z, text, className) {
    const [sx, sy] = project(x, y, z);
    const el = node('text', {
      class: className,
      transform: `matrix(${COS.toFixed(4)},${SIN.toFixed(4)},0,1,${sx.toFixed(2)},${sy.toFixed(2)})`,
    });
    el.textContent = text;
    group.appendChild(el);
    return el;
  }

  globalThis.PhishingIso = { NS, UNIT, project, shade, box, screen, label, node, polygon };
})();
