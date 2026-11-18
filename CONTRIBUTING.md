# Contribuir al sitio

Gracias por ayudar a mantener el sitio de Ahmed Oubali.

## Flujo de trabajo

1. Crea una rama para cada cambio.
2. Mantén el contenido público del sitio en español.
3. Reutiliza los componentes de `src/components/` y los datos compartidos de `src/data/`.
4. Antes de añadir un libro, comprueba la página de producto de Amazon y registra el enlace exacto de la edición; no inventes ASIN ni enlaces.
5. No subas PDF protegidos ni imágenes de cubiertas sin autorización.
6. Ejecuta `npm install` y `npm run build` antes de abrir una solicitud de cambios.

## Cambios en el catálogo

Edita `src/data/books.json`. Cada libro necesita un `slug` único, título, categoría, año cuando esté disponible, descripción y enlace de Amazon comprobado. Las rutas individuales se generan automáticamente desde ese archivo.

## Cambios de diseño

El encabezado, pie de página y redes sociales son componentes compartidos. Actualiza `src/data/social-links.json` para cambiar perfiles; evita duplicar enlaces sociales en las páginas.
