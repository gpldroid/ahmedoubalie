import type { APIRoute } from 'astro';
import books from '../data/books.json';
const fixedRoutes = ['', 'sobre-mi/', 'idiomas/', 'publicaciones/', 'biblioteca-pdf/', 'books/', 'asistente-literario/', 'contacto/', 'aviso-legal/', 'politica-de-privacidad/', 'politica-de-cookies/', 'terminos-de-uso/'];
export const GET: APIRoute = ({ site }) => {
  const base = new URL(import.meta.env.BASE_URL, site ?? 'https://gpldroid.github.io');
  const routes = [...fixedRoutes, ...books.map((book) => `books/${book.slug}/`)];
  const urls = routes.map((route) => {
    const loc = new URL(route, base).toString();
    return `<url><loc>${loc}</loc></url>`;
  }).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
};
