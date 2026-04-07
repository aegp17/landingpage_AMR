# Ramyx Lab — Landing Page

Landing page de Ramyx Lab construida con Vue 3, TypeScript y Vite. Bilingue (EN/ES).

## Requisitos

- Node.js 20 o superior
- npm

## Desarrollo local

```bash
npm install
npm run dev
```

El servidor de desarrollo se levanta en `http://localhost:5173`.

## Build de producción

```bash
npm run build
```

Genera la carpeta `dist/` con los archivos estáticos listos para servir.

## Configuración del base path

El archivo `vite.config.ts` tiene configurado `base: '/landingpage_AMR/'`. Esto determina la ruta raíz desde la que se sirven los assets.

- **Si despliegas en la raíz de un dominio** (ej. `https://ramyxlab.com/`), cambia el base a `'/'`:

  ```ts
  // vite.config.ts
  base: '/',
  ```

- **Si despliegas en un subdirectorio** (ej. `https://ejemplo.com/mi-sitio/`), usa ese path:

  ```ts
  // vite.config.ts
  base: '/mi-sitio/',
  ```

Después de cambiar el base, actualiza también las URLs en `index.html` (canonical, og:url, sitemap, structured data) para que coincidan con tu dominio final.

Luego ejecuta `npm run build` de nuevo.

## Despliegue

El resultado del build es una carpeta `dist/` con HTML, CSS y JS estáticos. No requiere Node.js ni backend en el servidor de producción — solo un servidor web que sirva archivos estáticos.

### GitHub Pages (configuración actual)

El deploy es automático. Cada push a `main` ejecuta el workflow en `.github/workflows/deploy.yml` que hace build y publica en GitHub Pages.

### Cualquier servidor estático (Nginx, Apache, Caddy, etc.)

1. Haz el build:

   ```bash
   npm install
   npm run build
   ```

2. Copia el contenido de `dist/` al directorio raíz de tu servidor web.

3. Configura tu servidor para redirigir todas las rutas al `index.html` (necesario porque es una SPA):

   **Nginx:**
   ```nginx
   server {
       listen 80;
       server_name ramyxlab.com;
       root /var/www/ramyxlab;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

   **Apache** (crea un `.htaccess` en `dist/`):
   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

### Netlify

1. Conecta el repositorio desde el dashboard de Netlify.
2. Configura:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Si usas dominio propio, cambia `base` a `'/'` en `vite.config.ts`.

### Vercel

1. Importa el repositorio desde el dashboard de Vercel.
2. Vercel detecta Vite automáticamente. Solo cambia `base` a `'/'` si usas dominio propio.

### AWS S3 + CloudFront

1. Haz el build y sube `dist/` a un bucket S3 con hosting estático habilitado.
2. Configura la **error document** como `index.html` para que funcione el ruteo SPA.
3. Usa CloudFront como CDN apuntando al bucket.

### Docker

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/dist /usr/share/nginx/html
# SPA fallback
RUN echo 'server { listen 80; root /usr/share/nginx/html; location / { try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
```

```bash
docker build -t ramyxlab .
docker run -p 8080:80 ramyxlab
```

## Preview local del build

Para verificar el build antes de desplegar:

```bash
npm run preview
```

Sirve `dist/` localmente en `http://localhost:4173`.

## Variables a actualizar según tu dominio

Al cambiar de servidor o dominio, revisa estos archivos:

| Archivo | Qué cambiar |
|---|---|
| `vite.config.ts` | `base` path |
| `index.html` | canonical URL, og:url, hreflang hrefs, structured data URL |
| `public/robots.txt` | URL del sitemap |
| `public/sitemap.xml` | `<loc>` URL |
| `src/components/ui/ContactForm.vue` | Hash de FormSubmit (ver nota abajo) |

## Formulario de contacto

El formulario usa [FormSubmit.co](https://formsubmit.co). El endpoint actual usa un hash placeholder. Para activarlo:

1. Cambia temporalmente el hash por tu email real en `ContactForm.vue`.
2. Envía un formulario de prueba.
3. Confirma tu email con el link que recibes de FormSubmit.
4. FormSubmit te dará un hash — reemplázalo en el código para no exponer tu email en el JS.
