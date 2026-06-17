# Travel Planner PWA — Vietnam & Camboya 2026

Aplicación web progresiva (PWA) para planificar, consultar y compartir el viaje familiar a Vietnam y Camboya (4-20 de julio de 2026). Funciona completamente offline una vez instalada: todos los datos se almacenan localmente en el dispositivo mediante IndexedDB.

## Características principales

- **Dashboard**: resumen del viaje, contadores, próximos eventos y accesos rápidos.
- **Documentos**: gestión de reservas, vuelos, hoteles, seguros y documentos personalizados con posibilidad de adjuntar imágenes.
- **Calendario y agenda**: vista mensual, lista de eventos y navegación por días.
- **Plan diario**: desglose detallado de cada día con actividades, lugares, notas culturales y consejos.
- **Lugares y mapa**: lista de lugares recomendados con mapa interactivo (Leaflet/OpenStreetMap) y enlaces a Google Maps.
- **Recomendaciones**: restaurantes, experiencias y consejos organizados por categoría.
- **Información por país**: datos prácticos de Vietnam y Camboya (visados, moneda, clima, etc.).
- **Pre-travel**: checklist y secciones configurables de preparación del viaje.
- **Lista de equipaje**: checklist de packing editable.
- **Configuración**: tema claro/oscuro, exportación e importación de datos, restauración de datos iniciales.
- **Offline-first**: service worker con Workbox que cachea la app y permite usarla sin conexión.
- **Compartir**: exporta los datos a JSON para que tus compañeros de viaje los importen en sus dispositivos.

## Stack tecnológico

- **React 18** + **TypeScript** (modo estricto)
- **Vite 5** como bundler y servidor de desarrollo
- **React Router 7** para la navegación
- **Tailwind CSS 3** para los estilos (modo oscuro por clase)
- **Lucide React** para iconografía
- **Dexie.js** sobre IndexedDB para almacenamiento local
- **date-fns** para manipulación de fechas
- **Leaflet + React-Leaflet** para el mapa
- **vite-plugin-pwa + Workbox** para el service worker y el manifiesto PWA

## Requisitos previos

- Node.js 20 o superior
- npm 10 o superior

## Instalación y desarrollo

```bash
# Clona el repositorio
git clone https://github.com/BorjaMartin/travel-planner-pwa.git
cd travel-planner-pwa

# Instala las dependencias
npm install

# Inicia el servidor de desarrollo
npm run dev
```

La aplicación se sirve en `http://localhost:5173/travel-planner-pwa/` debido a la ruta base configurada para GitHub Pages.

## Scripts disponibles

| Script                 | Descripción                                        |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | Inicia el servidor de desarrollo con hot reload    |
| `npm run build`        | Compila la aplicación para producción en `dist/`   |
| `npm run preview`      | Previsualiza la build de producción de forma local |
| `npm run lint`         | Ejecuta ESLint sobre el código fuente              |
| `npm run format`       | Formatea el código con Prettier                    |
| `npm run format:check` | Comprueba el formato sin modificar archivos        |

## Compilación para producción

```bash
npm run build
```

El resultado se genera en la carpeta `dist/`, lista para desplegar en GitHub Pages. La ruta base (`/travel-planner-pwa/`) está configurada en `vite.config.ts`.

## Despliegue en GitHub Pages

El repositorio incluye un workflow de GitHub Actions (`.github/workflows/deploy.yml`) que compila y despliega automáticamente la aplicación en GitHub Pages cada vez que se hace push a `main` o `master`.

### Pasos para activar GitHub Pages

1. Ve a **Settings > Pages** del repositorio en GitHub.
2. En **Build and deployment > Source** selecciona **GitHub Actions**.
3. Asegúrate de que la rama por defecto se llama `main` o `master` (el workflow escucha ambas).
4. Realiza un push; el workflow se ejecutará y publicará la app.

### URL de despliegue

```
https://BorjaMartin.github.io/travel-planner-pwa/
```

> Sustituye `BorjaMartin` por el nombre de usuario u organización correspondiente.

## Compartir con los compañeros de viaje

1. Envía la URL de GitHub Pages por WhatsApp, email o cualquier otro canal.
2. Cada persona instala la PWA en su móvil Android siguiendo las instrucciones de [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md).
3. Para sincronizar datos, ve a **Configuración > Exportar datos**, envía el archivo JSON generado y la otra persona lo importa desde **Configuración > Importar datos**.

Consulta [`docs/SHARING.md`](docs/SHARING.md) para una guía detallada de exportación, importación y buenas prácticas de uso en grupo.

## Estructura del proyecto

```
travel-planner-pwa/
├── .github/workflows/   # Workflows de GitHub Actions
├── docs/                # Documentación de usuario
├── public/              # Archivos estáticos (manifest, iconos)
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── pages/           # Vistas de la app
│   ├── hooks/           # Custom hooks
│   ├── db/              # IndexedDB / Dexie
│   ├── data/            # Datos iniciales del viaje
│   ├── utils/           # Helpers y utilidades
│   └── types/           # Tipos compartidos de TypeScript
├── index.html
├── package.json
├── README.md
├── RELEASE_NOTES.md
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Cómo usar la app

1. Abre la URL en el navegador o instala la PWA.
2. Explora el **Dashboard** para ver el resumen del viaje.
3. Consulta **Documentos**, **Agenda**, **Plan diario**, **Lugares** y **Recomendaciones**.
4. Añade o edita información según necesites; los cambios se guardan automáticamente.
5. Desde **Configuración** cambia el tema, exporta o importa datos, o restaura los datos iniciales.

Para una guía completa dirigida a usuarios no técnicos, consulta [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md).

## Capturas de pantalla

Las capturas de pantalla se añadirán en futuras versiones para ilustrar las principales pantallas de la aplicación.

## Notas importantes

- La aplicación no tiene backend: todos los datos viven en el navegador del dispositivo.
- La sincronización entre dispositivos se realiza manualmente mediante archivos JSON de exportación/importación.
- El modo offline requiere haber abierto la app al menos una vez con conexión para que el service worker cachee los recursos.

## Licencia

Uso personal para el viaje a Vietnam y Camboya 2026.
