# Sitio web de Ahmed Oubali

Sitio estático multilingüe en origen (contenido público en español), construido con [Astro](https://astro.build/) y publicado mediante GitHub Pages.

**Sitio publicado:** https://gpldroid.github.io/ahmedoubalie/

## Requisitos

- Node.js 22 (recomendado; versión definida en `.nvmrc`)
- npm

## Desarrollo local

```bash
npm install
npm run dev
```

Astro mostrará la dirección local, normalmente `http://localhost:4321/ahmedoubalie/`.

## Comprobación de producción

```bash
npm install
npm run build
npm run preview
```

El resultado estático se genera en `dist/`. La carpeta `public/` se copia directamente al resultado de producción.

## Publicación

Cada push a la rama `main` ejecuta el flujo de GitHub Actions definido en `.github/workflows/deploy.yml`:

1. Instala las dependencias.
2. Ejecuta `npm run build`.
3. Sube `dist/` como artefacto de GitHub Pages.
4. Publica el artefacto en el entorno `github-pages`.

En GitHub, la fuente de publicación de Pages debe estar configurada como **GitHub Actions** (Settings → Pages → Build and deployment → Source).

## Estructura del proyecto

```text
.
├── .github/workflows/deploy.yml  # Construcción y despliegue automático
├── public/
│   └── .nojekyll                 # Evita que Jekyll omita carpetas como _astro
├── src/
│   ├── components/               # Header, Footer e iconos sociales
│   ├── data/
│   │   ├── books.json            # Catálogo editorial
│   │   └── social-links.json     # Enlaces sociales centralizados
│   ├── layouts/                  # Layout HTML común y metadatos
│   ├── pages/
│   │   ├── index.astro           # Página principal
│   │   └── books/
│   │       ├── index.astro       # Índice de libros
│   │       └── [slug].astro      # Página estática individual por libro
│   └── styles/global.css         # Estilos globales y estilos heredados
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

## Catálogo de libros

El catálogo se mantiene manualmente en `src/data/books.json`. Cada entrada contiene, según corresponda:

- `slug`: identificador URL de la página del libro.
- `title`, `year`, `category`: datos editoriales.
- `asin` y `amazonUrl`: identificador y enlace a la ficha de Amazon de la edición.
- `description`: texto descriptivo.

Para añadir una obra, comprueba primero que la edición tiene una ficha de producto real en Amazon, añade una entrada con un `slug` único y una URL exacta de producto, y vuelve a ejecutar `npm run build`. No se alojan PDF ni se promete descarga directa desde Amazon.

Las cubiertas tipográficas que se muestran en el catálogo son marcadores visuales, no fotografías de las cubiertas editoriales. Sustitúyelas por imágenes autorizadas cuando estén disponibles.

## Enlaces sociales

Los perfiles y enlaces se mantienen en `src/data/social-links.json`; el componente compartido `SocialIcons.astro` los representa en el encabezado y el pie.

## Rutas y GitHub Pages

El proyecto se sirve bajo el prefijo `/ahmedoubalie`, configurado en `astro.config.mjs`. Para cambiar de dominio o repositorio, actualiza `site` y `base` y revisa los enlaces absolutos y las rutas generadas.

## Licencia y derechos

El contenido biográfico, literario y editorial pertenece a sus respectivos titulares. Este repositorio no declara una licencia abierta para reutilizar esos contenidos, textos o cubiertas. Solicita autorización antes de redistribuir material protegido.
