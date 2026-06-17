# Guía de compartición — Travel Planner PWA

Esta guía explica cómo compartir la aplicación y los datos del viaje con tus compañeros de viaje.

## Cómo compartir la URL de la app

La forma más sencilla de compartir la aplicación es enviar la URL pública:

```
https://BorjaMartin.github.io/travel-planner-pwa/
```

Cualquier persona con el enlace puede:

- Abrir la app en el navegador.
- Instalarla como PWA en su dispositivo Android.
- Consultar los datos iniciales del viaje.

### Canales recomendados

- WhatsApp
- Telegram
- Email
- Notas compartidas (Google Keep, Notion, etc.)
- Código QR generado a partir de la URL

## Cómo exportar datos a JSON

Para compartir los datos actualizados del viaje, exporta la base de datos completa:

1. Abre la app.
2. Ve a **Configuración**.
3. Pulsa **"Exportar datos"**.
4. El navegador descargará un archivo llamado `travel-planner-data.json`.

Este archivo incluye:

- Documentos (reservas, vuelos, hoteles, seguros...).
- Itinerario y eventos.
- Lugares y coordenadas.
- Planes diarios, notas culturales y consejos.
- Recomendaciones.
- Información por país.
- Lista de equipaje.
- Secciones de preparación del viaje.
- Viajeros.

## Cómo pueden importar los datos tus compañeros

1. Tu compañero recibe el archivo `travel-planner-data.json`.
2. Abre la app en su dispositivo.
3. Va a **Configuración**.
4. Pulsa **"Importar datos"**.
5. Selecciona el archivo JSON recibido.
6. La app mostrará cuántos registros se han importado.

> **Nota**: la importación reemplaza los datos locales existentes. Si tu compañero había hecho cambios propios, los perderá a menos que primero los exporte.

## Cómo fusionar datos si es necesario

La app no realiza una fusión automática profunda: al importar se sobrescriben las tablas completas. Si varias personas han editado datos diferentes al mismo tiempo, sigue este procedimiento:

### Estrategia recomendada de fusión manual

1. **Designa un editor principal**: una sola persona centraliza los cambios.
2. **Recopila actualizaciones**: los demás le comunican por chat/email qué han modificado.
3. **El editor principal aplica los cambios** en su dispositivo.
4. **Exporta y redistribuye**: genera un nuevo JSON y lo vuelve a compartir.
5. **Todos los demás importan** la última versión.

### Si necesitas conservar datos propios

Antes de importar el JSON de otra persona:

1. Ve a **Configuración > Exportar datos** y guarda tu propia copia.
2. Importa el JSON recibido.
3. Si necesitas recuperar algo de tu copia anterior, ábrela con un editor de texto, localiza los registros y añádelos manualmente en la app.

## Buenas prácticas para viajes en grupo

- **Un único editor principal**: evita conflictos y asegura que todos tengan la misma versión de la verdad.
- **Exporta antes de salir de viaje**: ten una copia de seguridad local en tu móvil.
- **Comparte el JSON periódicamente**: especialmente después de añadir reservas importantes o cambiar el itinerario.
- **Confirma la recepción**: pide a cada compañero que abra la app y verifique que ve los datos correctos.
- **No edites offline durante días**: si haces cambios sin compartirlos, aumenta el riesgo de conflictos.
- **Usa nombres descriptivos en los archivos**: por ejemplo, `travel-planner-2026-07-01.json` para saber qué versión es.

## Ejemplo de flujo de trabajo

```
Lunes:   Ana actualiza los hoteles en su móvil.
Martes:  Ana exporta y envía travel-planner-data.json al grupo.
Miércoles: Todos importan el archivo y verifican los cambios.
Viernes: Luis añade restaurantes recomendados.
Sábado:  Luis exporta, envía al grupo y todos importan.
```

## Limitaciones a tener en cuenta

- No hay sincronización automática en tiempo real.
- No hay backend central: los datos viajan como archivos JSON.
- Las imágenes adjuntas a documentos se incluyen en base64 dentro del JSON, por lo que el archivo puede ser grande.
- No se realizan diffs automáticos entre versiones.

Siguiendo estas recomendaciones, el grupo podrá mantener la información del viaje coordinada de forma sencilla.
