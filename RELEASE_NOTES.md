# Notas de la versión — Travel Planner PWA

## Versión 1.0.0

**Fecha de lanzamiento**: 17 de junio de 2026

### Resumen

Primera versión estable de la aplicación para el viaje familiar a Vietnam y Camboya (4-20 de julio de 2026). La app está lista para instalarse como PWA, funciona offline y puede compartirse entre los miembros del viaje mediante exportación e importación de datos JSON.

### Funcionalidades implementadas

- **Dashboard**: resumen del viaje, contadores, próximos eventos y accesos rápidos.
- **Documentos**: gestión de reservas, vuelos, hoteles, seguros y documentos personalizados con soporte para imágenes.
- **Agenda**: vista mensual, navegación por días y línea temporal de eventos.
- **Plan diario**: desglose detallado de cada día con actividades, lugares, notas culturales y consejos.
- **Lugares y mapa**: lista de lugares con mapa interactivo (Leaflet/OpenStreetMap) y enlaces a Google Maps.
- **Recomendaciones**: restaurantes, experiencias y consejos clasificados por categoría.
- **Información por país**: datos prácticos de Vietnam y Camboya.
- **Pre-travel**: checklist y secciones de preparación del viaje.
- **Lista de equipaje**: checklist editable.
- **Configuración**: tema claro/oscuro, exportación/importación de datos y restauración de datos iniciales.
- **PWA**: manifiesto, iconos, service worker con Workbox y soporte offline.
- **Despliegue**: workflow de GitHub Actions para publicación automática en GitHub Pages.

### Datos incluidos

La base de datos viene pre-cargada con datos reales del viaje:

- Itinerario completo del 4 al 20 de julio de 2026.
- Lugares de interés en Vietnam y Camboya.
- Recomendaciones de restaurantes y experiencias.
- Información práctica por país.
- Lista de equipaje inicial.
- Secciones de preparación del viaje.

### Mejoras técnicas

- Arquitectura React + TypeScript con modo estricto.
- Almacenamiento local con IndexedDB mediante Dexie.js.
- Routing con React Router y soporte para rutas base de GitHub Pages.
- Estilos con Tailwind CSS y modo oscuro.
- Lazy loading de páginas para mejor rendimiento.
- Caché de recursos con Workbox para funcionamiento offline.

### Problemas conocidos

- No hay sincronización automática entre dispositivos; la compartición de datos es manual mediante archivos JSON.
- El modo offline requiere al menos una visita previa con conexión para cachear los recursos.
- Las imágenes adjuntas incrementan el tamaño del archivo de exportación JSON.
- En iOS, el almacenamiento local puede limpiarse si la PWA no se usa durante largos periodos (limitación del sistema operativo).

### Futuras mejoras (opcionales)

- Sincronización en la nube mediante un backend ligero.
- Soporte para múltiples viajes dentro de la misma app.
- Notificaciones push para recordatorios del itinerario.
- Integración con APIs de clima y tráfico.
- Capturas de pantalla y vídeo de demostración en la documentación.
- Soporte multiidioma.

### Cómo actualizar

1. Ve al repositorio en GitHub.
2. Descarga o sincroniza la última versión.
3. La PWA se actualizará automáticamente la próxima vez que abras la app con conexión.
4. Si has hecho cambios locales, exporta tus datos antes de actualizar y vuelve a importarlos después.
