import type { APIRoute } from 'astro';
import bookData from '../data/books.json';

const books = bookData.books;

// Keep this list aligned with the indexable routes checked by scripts/validate-routes.mjs.
// Draft legal pages and the 404 page are intentionally excluded from the sitemap.
const fixedRoutes = [
  { path: '', changefreq: 'weekly', priority: '1.0' },
  { path: 'sobre-mi/', changefreq: 'monthly', priority: '0.8' },
  { path: 'idiomas/', changefreq: 'monthly', priority: '0.7' },
  { path: 'publicaciones/', changefreq: 'weekly', priority: '0.9' },
  { path: 'biblioteca-pdf/', changefreq: 'monthly', priority: '0.8' },
  { path: 'books/', changefreq: 'weekly', priority: '0.9' },
  { path: 'asistente-literario/', changefreq: 'monthly', priority: '0.7' },
  { path: 'contacto/', changefreq: 'yearly', priority: '0.5' },
];

const escapeXml = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&apos;');

export const GET: APIRoute = ({ site }) => {
  const basePath = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const base = new URL(basePath, site ?? 'https://gpldroid.github.io/');

  const entries = [
    ...fixedRoutes,
    ...books.map((book) => ({
      path: `books/${book.slug}/`,
      changefreq: 'monthly',
      priority: '0.7',
    })),
  ];

  const urls = entries.map(({ path, changefreq, priority }) => {
    const loc = escapeXml(new URL(path, base).toString());
    return [
      '<url>',
      `<loc>${loc}</loc>`,
      `<changefreq>${changefreq}</changefreq>`,
      `<priority>${priority}</priority>`,
      '</url>',
    ].join('');
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
};
