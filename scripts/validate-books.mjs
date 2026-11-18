import { readFile } from 'node:fs/promises';

const file = new URL('../src/data/books.json', import.meta.url);
const books = JSON.parse(await readFile(file, 'utf8'));
const errors = [];
const slugs = new Set();

if (!Array.isArray(books) || books.length === 0) {
  throw new Error('El catálogo debe ser un array no vacío.');
}

for (const [index, book] of books.entries()) {
  const label = book?.title || `entrada #${index + 1}`;
  for (const field of ['slug', 'title', 'category', 'description', 'asin', 'amazonUrl']) {
    if (typeof book?.[field] !== 'string' || !book[field].trim()) {
      errors.push(`${label}: falta el campo obligatorio "${field}".`);
    }
  }

  if (typeof book?.slug === 'string') {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(book.slug)) {
      errors.push(`${label}: slug no válido (${book.slug}).`);
    }
    if (slugs.has(book.slug)) errors.push(`${label}: slug duplicado (${book.slug}).`);
    slugs.add(book.slug);
  }

  if (typeof book?.asin === 'string' && !/^[A-Z0-9]{10}$/.test(book.asin)) {
    errors.push(`${label}: ASIN/identificador debe tener 10 caracteres alfanuméricos.`);
  }

  if (typeof book?.amazonUrl === 'string') {
    try {
      const url = new URL(book.amazonUrl);
      if (url.protocol !== 'https:' || !(url.hostname === 'amazon.com' || url.hostname.endsWith('.amazon.com') || url.hostname === 'amazon.es' || url.hostname.endsWith('.amazon.es'))) {
        errors.push(`${label}: el enlace debe ser HTTPS a dominio Amazon.com o Amazon.es.`);
      }
    } catch {
      errors.push(`${label}: enlace de Amazon no válido.`);
    }
  }

  if (book?.year !== undefined && (!Number.isInteger(book.year) || book.year < 1400 || book.year > 2200)) {
    errors.push(`${label}: año fuera de rango.`);
  }
}

if (errors.length) {
  console.error('Errores en src/data/books.json:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Catálogo válido: ${books.length} libros, slugs únicos y enlaces HTTPS de Amazon.`);
}
