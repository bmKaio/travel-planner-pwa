# Guía de usuario — Travel Planner PWA

Esta guía explica cómo usar la aplicación desde el punto de vista de un viajero, sin necesidad de conocimientos técnicos.

## Instalación de la PWA en Android

1. Abre la URL de la aplicación en Google Chrome o Samsung Internet:
   ```
   https://BorjaMartin.github.io/travel-planner-pwa/
   ```
2. Pulsa el menú del navegador (tres puntos, arriba a la derecha).
3. Selecciona **"Agregar a pantalla de inicio"** o **"Instalar aplicación"**.
4. Confirma y espera a que aparezca el icono en tu pantalla de inicio.

Una vez instalada, la app se abre en pantalla completa como una aplicación nativa y funciona sin conexión.

## Vista general del Dashboard

El Dashboard es la pantalla principal. Desde aquí puedes ver:

- **Días restantes** para el inicio del viaje.
- **Contadores** de documentos, lugares, eventos y recomendaciones.
- **Próximos eventos** del itinerario.
- **Accesos rápidos** a las secciones más importantes.

Desde la barra inferior puedes navegar entre Dashboard, Agenda, Lugares y Configuración.

## Cómo añadir documentos

1. Ve a **Documentos** desde el Dashboard o la barra inferior.
2. Pulsa el botón flotante **"+"**.
3. Rellena el título, tipo (vuelo, hotel, seguro, etc.), fecha y opcionalmente añade notas o una imagen.
4. Pulsa **Guardar**.

Puedes tocar cualquier documento de la lista para verlo, editarlo o eliminarlo.

## Cómo ver la agenda y el plan diario

### Agenda

- Ve a **Agenda**.
- Verás una vista mensual con los días que tienen eventos marcados.
- Toca un día para ver la línea temporal de eventos.

### Plan diario

- En la vista de un día concreto, pulsa **"Plan completo del día"**.
- O desde la agenda, ve a **Plan diario** para el día seleccionado.
- Aquí verás:
  - La ubicación principal del día.
  - Actividades agrupadas por mañana, tarde y noche.
  - Lugares recomendados para esa zona.
  - Notas culturales y consejos.

## Cómo usar el mapa

1. Ve a **Lugares**.
2. Pulsa el botón de alternancia para cambiar entre **Lista** y **Mapa**.
3. En el mapa:
   - Toca un marcador para ver el nombre y tipo de lugar.
   - Pulsa la ventana emergente para abrir el detalle.
   - Usa el botón **"Ver en Google Maps"** para obtener direcciones.

También puedes añadir nuevos lugares manualmente desde el botón **"+"**, incluyendo coordenadas GPS.

## Cómo usar la lista de equipaje (packing)

1. Ve a **Pre-travel** desde el Dashboard.
2. Localiza la sección **Lista de equipaje**.
3. Toca cada artículo para marcarlo como preparado.
4. Puedes añadir o eliminar artículos según tus necesidades.

La lista se guarda automáticamente en tu dispositivo.

## Cómo exportar e importar datos

### Exportar

1. Ve a **Configuración**.
2. Pulsa **"Exportar datos"**.
3. Se descargará un archivo llamado `travel-planner-data.json`.
4. Comparte ese archivo con tus compañeros de viaje.

### Importar

1. Ve a **Configuración**.
2. Pulsa **"Importar datos"**.
3. Selecciona el archivo JSON recibido.
4. La app reemplazará los datos locales por los del archivo.

> **Importante**: la importación sobrescribe los datos actuales. Si quieres conservar tus cambios, exporta primero.

## Cómo compartir datos con los compañeros de viaje

La forma más sencilla de compartir toda la información del viaje es:

1. Que una persona actúe como "editor principal" y mantenga los datos actualizados.
2. Desde **Configuración > Exportar datos**, genera el archivo JSON.
3. Envíalo por email, WhatsApp, Telegram, Google Drive o cualquier medio.
4. Cada compañero lo importa desde **Configuración > Importar datos**.

Para más detalles, consulta [`SHARING.md`](SHARING.md).

## Uso offline

La aplicación está diseñada para funcionar sin conexión:

- La primera vez que entres, el navegador descargará y cacheará todos los recursos necesarios.
- A partir de entonces, podrás consultar todos los datos sin internet.
- Las modificaciones que hagas offline se guardan localmente en el dispositivo.

### Para asegurar el funcionamiento offline

- Instala la PWA en el dispositivo.
- Abre la app al menos una vez con conexión para que se descarguen todos los recursos.
- No uses el modo incógnito del navegador (puede bloquear el almacenamiento local).

## Solución de problemas

### La app no se instala

- Asegúrate de usar Chrome o Edge en Android (la instalación PWA es más compatible).
- Comprueba que tienes espacio suficiente en el dispositivo.
- Recarga la página y espera unos segundos antes de intentarlo de nuevo.

### No veo los datos actualizados después de importar

- Cierra completamente la app (incluso desde la multitarea) y vuelve a abrirla.
- Comprueba que el archivo importado es el correcto.

### La app no funciona sin conexión

- Comprueba que abriste la app al menos una vez con conexión.
- En Android, asegúrate de no estar usando el modo de datos limitados para Chrome.
- Si persiste el problema, ve a **Configuración > Restaurar datos iniciales**.

### Los cambios no se guardan

- Comprueba que no estás en modo incógnito.
- Asegúrate de que el almacenamiento local no está bloqueado por políticas del navegador.
- En iOS, el almacenamiento puede borrarse si la app no se usa durante varias semanas.

### Error al importar un archivo JSON

- Asegúrate de que el archivo no está corrupto.
- El archivo debe haberse generado con el botón **Exportar datos** de esta misma app.
- Si has editado el archivo manualmente, podría no ser válido.

## Atajos útiles

- Desde cualquier pantalla, usa la barra inferior para cambiar de sección.
- En el Dashboard, toca cualquier tarjeta de resumen para ir directamente a esa sección.
- En Lugares, usa el buscador para filtrar por nombre o categoría.
