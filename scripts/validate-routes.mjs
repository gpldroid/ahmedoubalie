import { access, readFile, readdir } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';

const root = process.cwd();
const dist = resolve(root, 'dist');
const catalog = JSON.parse(await readFile(resolve(root, 'src/data/books.json'), 'utf8'));
const books = catalog.books;
if (!Array.isArray(books)) throw new Error('El catálogo debe contener un array "books".');
const fixedRoutes = [
  '', 'sobre-mi', 'idiomas', 'publicaciones', 'biblioteca-pdf', 'books',
  'asistente-literario', 'contacto', 'aviso-legal', 'politica-de-privacidad',
  'politica-de-cookies', 'terminos-de-uso',
];
const expectedFiles = [
  ...fixedRoutes.map((route) => route ? route + '/index.html' : 'index.html'),
  ...books.map((book) => 'books/' + book.slug + '/index.html'),
  '404.html', 'sitemap.xml',
];
const missingFiles = [];
for (const relativePath of expectedFiles) {
  try { await access(resolve(dist, relativePath)); }
  catch { missingFiles.push(relativePath); }
}

const siteBase = process.env.NETLIFY === 'true'
  ? new URL('https://ahmedoubali.netlify.app/')
  : new URL('https://gpldroid.github.io/ahmedoubalie/');
const indexableRoutes = fixedRoutes.filter((route) => !['aviso-legal', 'politica-de-privacidad', 'politica-de-cookies', 'terminos-de-uso'].includes(route));
const expectedUrls = [
  ...indexableRoutes.map((route) => new URL(route ? route + '/' : '', siteBase).href),
  ...books.map((book) => new URL('books/' + book.slug + '/', siteBase).href),
];
const sitemap = await readFile(resolve(dist, 'sitemap.xml'), 'utf8').catch(() => '');
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
const metadataIssues = [];
const imagesWithoutAlt = [];
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const relativeFile = relative(dist, file).replaceAll('\\\\', '/');
  if (!relativeFile.startsWith('admin/')) {
    const pageTitle = html.match(/<title>([\\s\\S]*?)<\\/title>/i)?.[1]?.trim() ?? '';
    const pageDescription = html.match(/<meta\\s+name="description"\\s+content="([^"]*)"/i)?.[1] ?? '';
    const canonical = html.match(/<link\\s+rel="canonical"\\s+href="([^"]+)"/i)?.[1] ?? '';
    const h1Count = (html.match(/<h1\\b/gi) ?? []).length;
    if (!pageTitle || pageTitle.length > 60) metadataIssues.push(relativeFile + ': title missing or longer than 60 characters');
    if (!pageDescription || pageDescription.length > 155) metadataIssues.push(relativeFile + ': meta description missing or longer than 155 characters');
    if (!canonical || !canonical.startsWith(siteBase.origin + siteBase.pathname)) metadataIssues.push(relativeFile + ': canonical missing or outside the GitHub Pages base path');
    if (h1Count !== 1) metadataIssues.push(relativeFile + ': expected exactly one H1, found ' + h1Count);
    for (const imageTag of html.match(/<img\\b[^>]*>/gi) ?? []) {
      if (!/\\balt\\s*=/.test(imageTag)) imagesWithoutAlt.push(relativeFile);
    }
  }
  const hrefs = [...html.matchAll(/\bhref=["']([^"'#][^"']*)["']/gi)].map((match) => match[1]);
  for (const href of hrefs) {
    if (/^(https?:|mailto:|tel:|javascript:|data:|\/\/)/i.test(href)) continue;
    let url;
    try { url = new URL(href, siteBase); } catch { continue; }
    if (url.origin !== siteBase.origin || !url.pathname.startsWith(siteBase.pathname)) continue;
    const pathname = decodeURIComponent(url.pathname.slice(siteBase.pathname.length));
    const target = resolve(dist, pathname || 'index.html');
    const candidate = !pathname ? target : (pathname.endsWith('/') || !extname(pathname) ? resolve(target, 'index.html') : target);
    try { await access(candidate); }
    catch { brokenLinks.push(relative(dist, file) + ' -> ' + href); }
  }
}

if (missingFiles.length || missingUrls.length || brokenLinks.length || metadataIssues.length || imagesWithoutAlt.length) {
  console.error('Falló la validación de rutas y enlaces internos.');
  if (missingFiles.length) console.error('Archivos no generados:', missingFiles);
  if (missingUrls.length) console.error('URLs ausentes del sitemap:', missingUrls);
  if (brokenLinks.length) console.error('Enlaces internos sin destino:', brokenLinks);
  if (metadataIssues.length) console.error('Problemas SEO on-page:', metadataIssues);
  if (imagesWithoutAlt.length) console.error('Imágenes sin atributo alt:', [...new Set(imagesWithoutAlt)]);
  process.exit(1);
}
console.log('Validación correcta: ' + fixedRoutes.length + ' páginas fijas, ' + books.length + ' fichas, ' + htmlFiles.length + ' documentos HTML, sitemap, metadatos SEO, encabezados e imágenes accesibles.');
