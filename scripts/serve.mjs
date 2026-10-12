import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const port = Number(process.env.PORT) || 5280;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function html(res, body, headers = {}) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function echoList(params) {
  const rows = [];
  for (const key of new Set(params.keys())) {
    rows.push(`<li><strong>${escapeHtml(key)}</strong>: ${params.getAll(key).map(escapeHtml).join(', ') || '<em>(empty)</em>'}</li>`);
  }
  return `<ul class="echo" data-testid="echo">${rows.join('') || '<li><em>No fields</em></li>'}</ul>`;
}

const routes = {
  'POST /api/echo': async (req, res) => {
    html(res, echoList(new URLSearchParams(await readBody(req))));
  },
  'GET /api/echo': async (req, res, url) => {
    html(res, echoList(url.searchParams));
  },
  'GET /api/fragment': async (req, res) => {
    const id = `swapped-${Date.now()}`;
    html(res, `
      <label for="${id}" class="field-label">Swapped in by htmx</label>
      <input id="${id}" type="date" name="swapped" data-flow-datepicker>`);
  }
};

async function resolveFile(urlPath) {
  const path = normalize(join(root, decodeURIComponent(urlPath)));
  if (!path.startsWith(root)) {
    return null;
  }
  const info = await stat(path).catch(() => null);
  if (info?.isDirectory()) {
    return join(path, 'index.html');
  }
  return info ? path : null;
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const route = routes[`${req.method} ${url.pathname}`];
  if (route) {
    try {
      await route(req, res, url);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(String(error));
    }
    return;
  }
  if (url.pathname === '/') {
    res.writeHead(302, { Location: '/demo/' });
    res.end();
    return;
  }
  const file = await resolveFile(url.pathname);
  const body = file ? await readFile(file).catch(() => null) : null;
  if (!body) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }
  res.writeHead(200, {
    'Content-Type': types[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}).listen(port, () => {
  console.log(`flow-datepicker demo: http://localhost:${port}/demo/`);
});
