import type { APIRoute } from 'astro';
export const prerender = true;
import books from '../data/books.json';
const fixedRoutes = ['', 'sobre-mi/', 'idiomas/', 'publicaciones/', 'biblioteca-pdf/', 'books/', 'asistente-literario/', 'contacto/', 'aviso-legal/', 'politica-de-privacidad/', 'politica-de-cookies/', 'terminos-de-uso/'];
export const GET: APIRoute = ({ site }) => {
  const basePath = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  const base = new URL(basePath, site ?? 'https://gpldroid.github.io/');
  const routes = [...fixedRoutes, ...books.map((book) => `books/${book.slug}/`)];
  const urls = routes.map((route) => {
    const loc = new URL(route, base).toString();
    return `<url><loc>${loc}</loc></url>`;
  }).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
};
