# Decap CMS en Netlify

La administración estática se publica en `/admin/`. Decap edita el catálogo
`src/data/books.json` y guarda los cambios como commits en GitHub. Netlify
reconstruye el sitio al recibir cada commit en `main`.

## Activación de inicio de sesión

1. En Netlify abre el proyecto `ahmedoubali`.
2. Ve a **Project configuration → Access & security → OAuth → Authentication providers**.
3. Instala el proveedor **GitHub** y registra una GitHub OAuth App si Netlify lo solicita.
4. Usa como callback de autorización `https://api.netlify.com/auth/done`.
5. En GitHub configura acceso solo al repositorio `gpldroid/ahmedoubalie` cuando la opción esté disponible.
6. Guarda el Client ID y Client Secret en la configuración de OAuth de Netlify. No los añadas al repositorio.
7. Abre `https://ahmedoubali.netlify.app/admin/` e inicia sesión con una cuenta GitHub autorizada.

El backend de Decap usa Netlify como intermediario OAuth (`base_url: https://api.netlify.com`).
No se necesita Netlify Identity, base de datos ni almacenamiento externo.

## Imágenes

Las nuevas imágenes que se carguen desde el CMS se guardan en `public/uploads/`
dentro del repositorio. El sitio las sirve desde `/uploads/`.

## Contenido editable

La colección inicial administra el catálogo de libros. Los campos conservan
la estructura validada por `scripts/validate-books.mjs`. Comprueba slug,
ASIN y enlaces antes de publicar.

## Coste

Decap CMS es software libre. Este flujo utiliza GitHub y el despliegue existente
de Netlify; no añade una base de datos ni un servicio de almacenamiento externo.
