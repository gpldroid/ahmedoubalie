import { access, readFile, readdir } from 'node:fs/promises';
import { resolve, relative, extname, dirname, sep } from 'node:path';

const root = process.cwd();
const dist = resolve(root, 'dist');
const books = JSON.parse(await readFile(resolve(root, 'src/data/books.json'), 'utf8'));
const fixedRoutes = [
  '', 'sobre-mi', 'idiomas', 'publicaciones', 'biblioteca-pdf', 'books',
  'asistente-literario', 'contacto', 'aviso-legal', 'politica-de-privacidad',
  'politica-de-cookies', 'terminos-de-uso',
];
const expectedFiles = [
  ...fixedRoutes.map((route) => route ? `${route}/index.html` : 'index.html'),
  ...books.map((book) => `books/${book.slug}/index.html`),
  '404.html', 'sitemap.xml',
];
const missingFiles = [];
for (const relativePath of expectedFiles) {
  try { await access(resolve(dist, relativePath)); }
  catch { missingFiles.push(relativePath); }
}

const sitemap = await readFile(resolve(dist, 'sitemap.xml'), 'utf8').catch(() => '');
const siteBase = new URL('https://gpldroid.github.io/ahmedoubalie/');
const expectedUrls = [
  ...fixedRoutes.map((route) => new URL(route ? `${route}/` : '', siteBase).href),
  ...books.map((book) => new URL(`books/${book.slug}/`, siteBase).href),
];
const actualUrls = new Set(sitemap.split('<loc>').slice(1).map((entry) => entry.split('</loc>')[0].replaceAll('&amp;', '&').trim()));
const missingUrls = expectedUrls.filter((url) => !actualUrls.has(url));

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.isFile() && extname(entry.name) === '.html') files.push(path);
  }
  return files;
}
const htmlFiles = await walk(dist);
const brokenLinks = [];
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const hrefs = [...html.matchAll(/\bhref=["']([^"'#][^"']*)["']/gi)].map((match) => match[1]);
  for (const href of hrefs) {
    if (/^(https?:|mailto:|tel:|javascript:|data:|\/\/)/i.test(href)) continue;
    let url;
    try { url = new URL(href, siteBase); } catch { continue; }
    if (url.origin !== siteBase.origin || !url.pathname.startsWith(siteBase.pathname)) continue;
    const pathname = decodeURIComponent(url.pathname.slice(siteBase.pathname.length));
    const target = resolve(dist, pathname || 'index.html');
    const candidate = pathname.endsWith('/') || !extname(pathname) ? resolve(target, 'index.html') : target;
    try { await access(candidate); }
    catch { brokenLinks.push(`${relative(dist, file)} -> ${href}`); }
  }
}

if (missingFiles.length || missingUrls.length || brokenLinks.length) {
  console.error('Falló la validación de rutas y enlaces internos.');
  if (missingFiles.length) console.error('Archivos no generados:', missingFiles);
  if (missingUrls.length) console.error('URLs ausentes del sitemap:', missingUrls);
  if (brokenLinks.length) console.error('Enlaces internos sin destino:', brokenLinks);
  process.exit(1);
}
console.log(`Validación correcta: ${fixedRoutes.length} páginas fijas, ${books.length} fichas, ${htmlFiles.length} documentos HTML, sitemap y enlaces internos.`);