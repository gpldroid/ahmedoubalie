import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

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
  '404.html',
  'sitemap.xml',
];
const missingFiles = [];

for (const relativePath of expectedFiles) {
  try {
    await access(resolve(dist, relativePath));
  } catch {
    missingFiles.push(relativePath);
  }
}

const sitemap = await readFile(resolve(dist, 'sitemap.xml'), 'utf8').catch(() => '');
const siteBase = new URL('https://gpldroid.github.io/ahmedoubalie/');
const expectedUrls = [
  ...fixedRoutes.map((route) => new URL(route ? `${route}/` : '', siteBase).href),
  ...books.map((book) => new URL(`books/${book.slug}/`, siteBase).href),
];
const actualUrls = new Set(
  [...sitemap.matchAll(/<loc>(.*?)<\\/loc>/g)].map((match) =>
    match[1].replaceAll('&amp;', '&').trim()
  )
);
const missingUrls = expectedUrls.filter((url) => !actualUrls.has(url));

if (missingFiles.length || missingUrls.length) {
  console.error('Falló la validación de rutas.');
  if (missingFiles.length) {
    console.error('Archivos no generados:\\n' + missingFiles.map((item) => `- dist/${item}`).join('\\n'));
  }
  if (missingUrls.length) {
    console.error('URLs ausentes del sitemap:\\n' + missingUrls.map((url) => `- ${url}`).join('\\n'));
    console.error('Primeras URLs encontradas:\\n' + [...actualUrls].slice(0, 5).join('\\n'));
  }
  process.exit(1);
}

console.log(`Rutas verificadas: ${fixedRoutes.length} páginas fijas, ${books.length} fichas de libros, 404 y sitemap.`);
