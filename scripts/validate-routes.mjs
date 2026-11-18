import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const dist = resolve(root, 'dist');
const books = JSON.parse(await readFile(resolve(root, 'src/data/books.json'), 'utf8'));
const fixedRoutes = [
  '',
  'sobre-mi',
  'idiomas',
  'publicaciones',
  'biblioteca-pdf',
  'books',
  'asistente-literario',
  'contacto',
  'aviso-legal',
  'politica-de-privacidad',
  'politica-de-cookies',
  'terminos-de-uso',
];
const expected = [
  ...fixedRoutes.map((route) => route ? `${route}/index.html` : 'index.html'),
  ...books.map((book) => `books/${book.slug}/index.html`),
  '404.html',
  'sitemap.xml',
];
const missing = [];

for (const relativePath of expected) {
  try {
    await access(resolve(dist, relativePath));
  } catch {
    missing.push(relativePath);
  }
}

const sitemap = await readFile(resolve(dist, 'sitemap.xml'), 'utf8').catch(() => '');
const baseUrl = 'https://gpldroid.github.io/ahmedoubalie/';
const missingFromSitemap = [
  ...fixedRoutes.filter((route) => !sitemap.includes(`<loc>${baseUrl}${route ? `${route}/` : ''}</loc>`)),
  ...books.filter((book) => !sitemap.includes(`<loc>${baseUrl}books/${book.slug}/</loc>`))
];

if (missing.length || missingFromSitemap.length) {
  console.error('Falló la validación de rutas.');
  if (missing.length) console.error('Archivos no generados:\n' + missing.map((item) => `- dist/${item}`).join('\n'));
  if (missingFromSitemap.length) console.error('Rutas ausentes del sitemap:\n' + missingFromSitemap.map((item) => `- /${item}/`).join('\n'));
  process.exit(1);
}

console.log(`Rutas verificadas: ${fixedRoutes.length} páginas fijas, ${books.length} fichas de libros, 404 y sitemap.`);
