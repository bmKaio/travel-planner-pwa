# Travel Planner PWA - Plan de Implementación

## Visión General

PWA para planificación de viajes a Vietnam y Camboya, optimizada para uso offline y compartible entre compañeros de viaje.

**Fecha del viaje**: 4-20 Julio 2026 (17 días)  
**Viajeros**: 5 personas (familiar)  
**Ruta**: Hanoi → Pu Luong → Ninh Binh → Cat Ba → Hue → Hoi An → Siem Reap → Phnom Penh  
**Plataforma**: Android (PWA instalable)  
**Conectividad**: 100% offline después de instalación inicial

---

## Stack Tecnológico

### Frontend

- **Framework**: React 18 + TypeScript
- **Build tool**: Vite 5
- **Routing**: React Router v6
- **State management**: Zustand (ligero, sin boilerplate)
- **Styling**: Tailwind CSS + Headless UI
- **Icons**: Lucide React

### Offline & Storage

- **Service Worker**: Workbox (precaching + runtime caching)
- **Database**: IndexedDB (Dexie.js como wrapper)
- **Cache strategy**: Stale-while-revalidate para assets, cache-first para datos

### Mapas

- **Map library**: Leaflet (ligero, offline-capable)
- **Map tiles**: OpenStreetMap (descargables para offline)
- **Geocoding**: Coordenadas predefinidas en datos

### PWA Features

- **Manifest**: Instalable en home screen
- **Icons**: Múltiples tamaños (192x192, 512x512)
- **Theme**: Dark/light mode automático
- **Splash screen**: Configurada en manifest

---

## Arquitectura de Datos

### Estructura de Datos (IndexedDB)

```typescript
// Documents
interface Document {
  id: string
  type: 'passport' | 'insurance' | 'flight' | 'accommodation' | 'other'
  title: string
  data: any // JSON estructurado según tipo
  fileData?: string // Base64 para imágenes/PDFs
  createdAt: Date
  updatedAt: Date
}

// Itinerary
interface ItineraryItem {
  id: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime?: string
  type: 'flight' | 'transport' | 'visit' | 'accommodation' | 'activity'
  title: string
  description?: string
  location?: {
    name: string
    lat: number
    lng: number
    googleMapsUrl: string
  }
  notes?: string
  tags?: string[]
}

// Places
interface Place {
  id: string
  name: string
  description: string
  category: 'temple' | 'nature' | 'city' | 'restaurant' | 'market' | 'other'
  location: {
    lat: number
    lng: number
    address: string
  }
  openingHours?: string
  tips?: string[]
  funFacts?: string[]
  culturalContext?: string
  images?: string[] // URLs o base64
}

// Daily Plan
interface DailyPlan {
  date: string
  items: ItineraryItem[]
  places: Place[]
  recommendations: Recommendation[]
  tips: string[]
  culturalNotes: string[]
}

// Recommendations (opcionales)
interface Recommendation {
  id: string
  type: 'restaurant' | 'activity' | 'place'
  title: string
  description: string
  location?: Location
  tags: string[]
  priority: 'must-see' | 'if-time' | 'optional'
}

// Country Info
interface CountryInfo {
  id: string
  country: 'vietnam' | 'cambodia'
  sections: {
    history: string
    culture: string
    food: string
    traditions: string
    customs: string
    language: string
    currency: string
    tips: string[]
  }
}

// Pre-Travel Checklist
interface PackingItem {
  id: string
  category: 'documents' | 'health' | 'clothing' | 'electronics' | 'toiletries' | 'misc'
  name: string
  checked: boolean
  notes?: string
  essential: boolean // imprescindible vs opcional
}

// Pre-Travel Info
interface PreTravelSection {
  id: string
  category: 'checklist' | 'vaccines' | 'money' | 'connectivity' | 'safety' | 'tips'
  title: string
  items: {
    id: string
    text: string
    checked?: boolean // para checklist items
    important: boolean
    details?: string
  }[]
}
```

### Datos Iniciales (Seed Data)

Los datos iniciales se empaquetan con la app y se cargan en IndexedDB en la primera ejecución:

1. **Documentos de ejemplo** (plantillas vacías)
2. **Itinerario base** (estructura de fechas del viaje)
3. **Lugares principales** (pre-cargados con info)
4. **Información de países** (Vietnam + Camboya)
5. **Recomendaciones** (lista curada)
6. **Pre-viaje** (checklist + consejos + datos importantes)

---

## Estructura de la Aplicación

### Páginas/Rutas

```
/ → Dashboard (vista general del viaje)
/pre-travel → Checklist, consejos y datos importantes pre-viaje
/documents → Lista de documentos
/documents/:id → Detalle de documento
/schedule → Calendario con todos los eventos
/schedule/:date → Detalle del día
/places → Mapa con todos los lugares
/places/:id → Detalle de lugar
/recommendations → Lista de recomendaciones opcionales
/countries/:id → Info de país (Vietnam/Camboya)
/settings → Configuración (import/export, tema)
```

### Componentes Principales

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.tsx (shell principal)
│   │   ├── BottomNav.tsx (navegación inferior: Dashboard, Pre-viaje, Schedule, Places, Más)
│   │   └── Header.tsx
│   ├── documents/
│   │   ├── DocumentList.tsx
│   │   ├── DocumentCard.tsx
│   │   └── DocumentForm.tsx
│   ├── schedule/
│   │   ├── Calendar.tsx
│   │   ├── DayView.tsx
│   │   ├── EventCard.tsx
│   │   └── Timeline.tsx
│   ├── places/
│   │   ├── MapView.tsx
│   │   ├── PlaceCard.tsx
│   │   └── PlaceDetail.tsx
│   ├── recommendations/
│   │   ├── RecommendationList.tsx
│   │   └── RecommendationCard.tsx
│   ├── pretravel/
│   │   ├── PreTravelDashboard.tsx
│   │   ├── PackingChecklist.tsx
│   │   ├── ChecklistItem.tsx
│   │   └── PreTravelSection.tsx
│   └── common/
│       ├── Card.tsx
│       ├── Button.tsx
│       ├── Modal.tsx
│       └── Loading.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── PreTravel.tsx
│   ├── Documents.tsx
│   ├── Schedule.tsx
│   ├── Places.tsx
│   ├── Recommendations.tsx
│   ├── CountryInfo.tsx
│   └── Settings.tsx
├── hooks/
│   ├── useDocuments.ts
│   ├── useItinerary.ts
│   ├── usePlaces.ts
│   ├── usePackingList.ts
│   └── useOfflineStatus.ts
├── db/
│   ├── index.ts (Dexie setup)
│   ├── schema.ts
│   └── seed.ts (datos iniciales)
├── data/
│   ├── vietnam.json
│   ├── cambodia.json
│   ├── places.json
│   ├── recommendations.json
│   └── pretravel.json
├── utils/
│   ├── date.ts
│   ├── geo.ts
│   └── export.ts
└── types/
    └── index.ts
```

---

## Funcionalidades Detalladas

### 1. Dashboard

- Countdown hasta el viaje
- Resumen del día actual (si está en viaje)
- Próximos eventos
- Acceso rápido a documentos importantes
- Progreso del checklist de equipaje (pre-viaje)
- Estado offline/online

### 2. Documentos

**Tipos soportados**:

- Pasaportes (foto + datos)
- Seguros (póliza, contacto emergencia)
- Billetes de avión (PDF/imagen + datos clave)
- Reservas de alojamiento
- Otros documentos

**Features**:

- Upload de imágenes/PDFs (almacenados en IndexedDB como base64)
- Búsqueda por título/tipo
- Marcar como favorito
- Compartir como texto (copiar datos)

### 3. Planning/Schedule

**Vistas**:

- Calendario mensual
- Vista de día con timeline
- Vista de lista

**Features**:

- Eventos con hora inicio/fin
- Tipos: vuelo, transporte, visita, alojamiento, actividad
- Ubicación con link a Google Maps
- Notas por evento
- Tags para filtrado
- Notificaciones (opcional, si el navegador lo soporta)

### 4. Lugares y Mapa

**Mapa interactivo**:

- Marcadores por categoría (colores diferentes)
- Clusters para zonas con muchos lugares
- Popup con info básica al click
- Botón "Abrir en Google Maps"

**Detalle de lugar**:

- Descripción completa
- Horarios
- Tips y recomendaciones
- Datos curiosos
- Contexto cultural
- Fotos (si disponibles)

### 5. Plan Diario

Para cada día del viaje:

- Lista de actividades programadas
- Lugares a visitar con contexto
- Datos curiosos del lugar
- Información cultural relevante
- Consejos prácticos
- Recomendaciones opcionales cercanas

### 6. Recomendaciones

- Lista filtrable por categoría
- Prioridad: must-see, if-time, optional
- Mapa con ubicación
- Descripción y por qué visitar

### 7. Información de Países

**Secciones**:

- Historia resumida
- Cultura y tradiciones
- Gastronomía típica
- Costumbres y etiqueta
- Idioma básico (frases útiles)
- Moneda y pagos
- Tips prácticos

### 8. Pre-viaje (Datos Importantes)

**Checklist de equipaje interactivo** (marcar/desmarcar items):

**Documentos imprescindibles**:

- Pasaporte (vigencia mínima 6 meses)
- Visados (Vietnam e-visivo, Camboya visa on arrival)
- Copias de documentos (digital + físico)
- Fotos tamaño carnet (para visados)
- Seguros de viaje (impresos + digital)
- Billetes de avión (ida y vuelta)
- Reservas de alojamiento
- Carnet de conducir internacional (si aplica)

**Salud y vacunas**:

- Vacunas recomendadas (hepatitis A/B, tifoidea, tétanos)
- Medicamentos básicos (paracetamol, ibuprofeno, antidiarreico)
- Repelente de insectos (imprescindible)
- Protector solar
- Botiquín personalizado
- Recetas médicas (si aplica)

**Ropa y calzado**:

- Ropa ligera y transpirable
- Impermeable (temporada de lluvias)
- Calzado cómodo para caminar
- Chanclas para duchas/hoteles
- Ropa respetuosa para templos (hombros y rodillas cubiertos)
- Bañador

**Electrónica**:

- Adaptador de enchufe (tipo A/C/O/M según país)
- Power bank
- Cables y cargadores
- Tarjeta SD/memoria extra
- Auriculares

**Higiene y varios**:

- Toalla de microfibra
- Gel hidroalcohólico
- Pañuelos húmedos
- Candado para mochila
- Bolsa estanca para electrónicos
- Dinero en efectivo (USD para Camboya, VND para Vietnam)

**Secciones informativas adicionales**:

**Vacunas y salud**:

- Vacunas recomendadas vs obligatorias
- Farmacias y hospitales recomendados
- Seguro médico con cobertura
- Consejos de salud (agua embotellada, comida callejera)

**Dinero y pagos**:

- Cuánto efectivo llevar
- Cajeros automáticos
- Tarjetas recomendadas (sin comisiones)
- Cambio de moneda
- Coste medio de vida

**Conectividad**:

- SIM cards locales (Vietnam: Viettel, Camboya: Cellcard)
- WiFi en hoteles
- Apps útiles offline (Google Maps offline, traductor)
- Roaming vs SIM local

**Seguridad**:

- Zonas seguras vs precauciones
- Estafas comunes y cómo evitarlas
- Números de emergencia
- Embajadas y consulados
- Copias de documentos

**Consejos prácticos**:

- Clima y mejor época
- Transporte local (Grab, tuk-tuks)
- Negociación en mercados
- Propinas y costumbres
- Etiquetado en templos

### 9. Configuración

- Exportar/importar datos (JSON)
- Cambiar tema (claro/oscuro)
- Limpiar datos
- Información de la app

---

## Estrategia Offline

### Service Worker Caching

```typescript
// Precache (instalación)
- HTML shell
- CSS y JS bundles
- Iconos
- Datos iniciales (JSON de países, lugares, recomendaciones, pretravel)

// Runtime caching
- Assets: Stale-while-revalidate
- API calls: Network-first (aunque no hay APIs externas)
- Images: Cache-first
```

### IndexedDB Sync

- Todos los datos del usuario en IndexedDB
- No hay sync con servidor
- Export/import manual para compartir entre dispositivos

### Offline UX

- Indicador visual de estado offline
- Todos los datos accesibles sin conexión
- Mensajes amigables si algo requiere conexión (ej: abrir Google Maps)

---

## Distribución y Compartir

### Opción 1: GitHub Pages (Recomendado)

1. Deploy automático desde GitHub
2. URL compartible: `https://[usuario].github.io/travel-planner-pwa`
3. Cada compañero instala la PWA en su dispositivo
4. Cada uno tiene sus propios datos locales

### Opción 2: Netlify/Vercel

- Similar a GitHub Pages
- Deploy automático
- URL personalizada opcional

### Compartir Datos

- Exportar datos a JSON
- Compartir archivo JSON (Telegram, email, etc.)
- Importar en otro dispositivo
- Merge manual de datos si es necesario

---

## Plan de Implementación

### Fase 1: Setup Inicial (Día 1)

- [ ] Crear proyecto con Vite + React + TypeScript
- [ ] Configurar Tailwind CSS
- [ ] Configurar PWA (manifest, service worker)
- [ ] Estructura de carpetas
- [ ] Routing básico
- [ ] Layout principal con navegación

### Fase 2: Base de Datos (Día 2)

- [ ] Configurar Dexie.js (IndexedDB)
- [ ] Definir schemas
- [ ] Crear seed data (datos iniciales)
- [ ] Hooks para CRUD operations
- [ ] Export/import functionality

### Fase 3: Documentos (Día 3)

- [ ] Página de lista de documentos
- [ ] Formulario para crear/editar
- [ ] Upload de archivos (imagen/PDF)
- [ ] Almacenamiento en IndexedDB
- [ ] Búsqueda y filtrado

### Fase 4: Schedule/Planning (Día 4)

- [ ] Componente de calendario
- [ ] Vista de día con timeline
- [ ] CRUD de eventos
- [ ] Links a Google Maps
- [ ] Vista de lista alternativa

### Fase 5: Lugares y Mapa (Día 5)

- [ ] Integrar Leaflet
- [ ] Cargar lugares desde datos
- [ ] Marcadores y popups
- [ ] Detalle de lugar
- [ ] Botón "Abrir en Google Maps"

### Fase 6: Plan Diario (Día 6)

- [ ] Vista de día con actividades
- [ ] Contexto cultural por lugar
- [ ] Tips y datos curiosos
- [ ] Recomendaciones opcionales
- [ ] Navegación desde calendario

### Fase 7: Info Países y Recomendaciones (Día 7)

- [ ] Páginas de Vietnam y Camboya
- [ ] Secciones de info cultural
- [ ] Lista de recomendaciones
- [ ] Filtros por prioridad/categoría

### Fase 8: Pre-viaje (Día 8)

- [ ] Página de Pre-viaje con tabs
- [ ] Checklist de equipaje interactivo (marcar/desmarcar)
- [ ] Persistencia del estado del checklist en IndexedDB
- [ ] Secciones informativas (vacunas, dinero, conectividad, seguridad)
- [ ] Datos iniciales de pre-viaje (pretravel.json)
- [ ] Progreso visual del checklist (% completado)

### Fase 9: Dashboard y Pulido (Día 9)

- [ ] Dashboard con resumen
- [ ] Countdown al viaje
- [ ] Estado offline/online
- [ ] Tema oscuro/claro
- [ ] Testing offline
- [ ] Optimizaciones de performance

### Fase 10: Deploy y Compartir (Día 10)

- [ ] Configurar GitHub Pages
- [ ] Testing en dispositivos reales
- [ ] Documentación de uso
- [ ] Compartir con compañeros

---

## Datos Iniciales a Preparar

### Vietnam (basado en itinerario real)

**Hanoi**:

- Historia: Templo Literatura (1070, primera universidad), Mausoleo Ho Chi Minh, Pagoda un Pilar (s. VI)
- Cultura: café con huevo (Giang Café), street food (pho, bun cha, bun bo), mercado Dong Xuan
- Tips: Old Quarter = Barrio Antiguo, Grab para transporte, lago Hoan Kiem leyenda de la espada

**Pu Luong**:

- Naturaleza: Reserva Natural, arrozales en terrazas, montañas kársticas, cascada Hieu
- Cultura: etnias Thai y Muong, casas sobre pilotes, cena con familia local, cocina tradicional
- Tips: 90% menos turistas que Sapa, coche se contrata con el homestay

**Ninh Binh**:

- Historia: Trang An (UNESCO, 9 cuevas, templos), capital antigua de Vietnam (s. X-XI)
- Naturaleza: "Ha Long terrestre", formaciones kársticas, río Ngo Dong, Hang Mua (500 escalones)
- Gastronomía: carne de cabra de Ninh Binh (especialidad local)
- Tips: madrugar a Trang An (7:00), a las 10-11 hay colas de autocares

**Cat Ba / Lan Ha Bay**:

- Naturaleza: formaciones kársticas en mar, aguas esmeralda, 90% menos barcos que Ha Long
- Actividades: kayak en lagunas escondidas, aldea flotante Viet Hai, plancton bioluminiscente
- Playas: Cat Co 1/2/3 (arena blanca, agua templada)
- Gastronomía: marisco y pescado fresco del puerto

**Hue**:

- Historia: Ciudad Imperial (UNESCO), capital imperial Nguyen, Palacio Suprema Armonía
- Monumentos: Tumbas imperiales (Khai Dinh, Tu Duc), Pagoda Thien Mu (7 pisos)
- Gastronomía: bun bo Hue (sopa fideos picante, especialidad local)
- Cultura: río Perfume (Huong Giang), arte imperial

**Hoi An**:

- Historia: casco antiguo (UNESCO), puerto comercial siglos XV-XIX, Puente Japonés (s. XVII)
- Cultura: farolillos de seda, taller artesanal, arquitectura china-japonesa
- Playas: An Bang (Mar de China Meridional)
- Gastronomía: Cao Lau (fideos locales), bánh bao (dumplings)
- Tips: madrugar a las 8:00 sin aglomeraciones, alojarse fuera del casco antiguo

**Da Nang**:

- Naturaleza: Montañas de Mármol (5 colinas, cuevas con pagodas budistas)
- Tips: paso de Hai Van (carretera costera espectacular entre Hue y Hoi An)

### Camboya (basado en itinerario real)

**Siem Reap / Angkor**:

- Historia: Imperio Jemer (s. IX-XV), Angkor Wat (s. XII), mayor complejo religioso del mundo
- Templos principales:
  - Angkor Wat: galerías bajorrelieves Ramayana, torres flor de loto
  - Bayon: 216 caras sonrientes de Avalokiteshvara
  - Ta Prohm: templo abrazado por raíces (Tomb Raider)
  - Banteay Srei: templo rosa, tallas más finas de Angkor
  - Banteay Samre: perfectamente restaurado, joya escondida
  - Kbal Spean: río de los 1000 lingas tallados
- Otros: Srah Srang (piscina sagrada, amanecer sin turistas), Angkor Thom (Puerta Sur)
- Tips: pase 3 días 62 USD/pers, evitar amanecer en Angkor Wat (ir a Srah Srang), tuk-tuk 15-20 USD/día

**Lago Tonlé Sap**:

- Naturaleza: lago más grande del sudeste asiático, cambia de tamaño según monzón
- Cultura: Kampong Phluk (aldea flotante auténtica, no turística)

**Phnom Penh**:

- Historia: capital actual, Jemer Rojo (1975-1979)
- Tips: solo paso al aeropuerto en nuestro itinerario, no hay pernocta

### Consejos anti-turismo masivo (del itinerario)

- Pu Luong vs Sapa: 90% menos turistas, igual de espectacular
- Lan Ha Bay vs Ha Long: mismo paisaje kárstico pero 10 barcos vs 500
- Ninh Binh: madrugar a Trang An (7:00), evitar 10-11h
- Hoi An: entrar al casco antiguo a las 8:00, solo locales
- Hue: Ciudad Imperial primera hora tarde, menos gente que mañana
- Angkor: amanecer en Srah Srang o Pre Rup, no en Angkor Wat

### Comida callejera

- Buscar puestos con mucha clientela local → rotación alta = ingredientes frescos
- Vietnam: pho, bun cha, bun bo Hue, café con huevo, bánh mi
- Camboya: fish amok, lok lak, riel (sopa)

### Itinerario Real — 17 días (4-20 Julio 2026)

**Viaje familiar · 5 personas**
**Ruta**: Hanoi → Pu Luong → Ninh Binh → Cat Ba (Lan Ha Bay) → Tren nocturno → Hue → Hoi An → ✈️ Siem Reap → Phnom Penh

#### ✈️ Vuelos

- **Ida**: Qatar Airways — MAD 09:05 (4 Jul) → HAN 07:15 (5 Jul) · 17h 10m · Escala Doha
- **Vuelta**: Etihad Airways — PNH 08:35 (20 Jul) → MAD mismo día · 16h 05m · Escala Abu Dhabi
- **Interno**: Da Nang (DAD) → Siem Reap (SAI) — ~1h 20m (17 Jul, reservar)

#### Día a día

| Día | Fecha      | Plan                                                | Transporte                           | Alojamiento                            |
| --- | ---------- | --------------------------------------------------- | ------------------------------------ | -------------------------------------- |
| 1   | Sáb 4 Jul  | ✈️ MAD → DOH → HAN (09:05)                          | Qatar Airways 17h10m                 | A bordo                                |
| 2   | Dom 5 Jul  | 🛬 Llegada HAN 07:15 + Hanoi cultural               | Taxi/Grab 30min (~12€)               | Peridot Gallery Classic (Old Quarter)  |
| 3   | Lun 6 Jul  | 🏔️ Hanoi → Pu Luong                                 | Coche privado 3.5-4h (salida 8:00)   | Homestay Pu Luong (Ban Hieu/Ban Don)   |
| 4   | Mar 7 Jul  | 🥾 Trekking Pu Luong (arrozales, cascada Hieu)      | A pie/bici                           | Mismo homestay                         |
| 5   | Mié 8 Jul  | 🌄 Pu Luong → Ninh Binh/Tam Coc                     | Coche privado 3h (salida 9:00)       | Tam Coc Family Hotel                   |
| 6   | Jue 9 Jul  | 🚣 Trang An (7:00) + Hang Mua                       | Bici/barca                           | Mismo hotel Tam Coc                    |
| 7   | Vie 10 Jul | ⛴️ Ninh Binh → Cat Ba                               | Coche 2h + Ferry 45min (salida 8:00) | Cat Ba Eco Lodge (Deluxe Family Suite) |
| 8   | Sáb 11 Jul | 🏝️ Lan Ha Bay (kayak, baño)                         | Barco desde muelle Beo 8:00          | Mismo hotel Cat Ba                     |
| 9   | Dom 12 Jul | 🚤 Cat Ba → Hanoi + tarde libre                     | Ferry + coche 3.5h (10:00)           | Peridot Gallery Classic (2ª noche)     |
| 10  | Lun 13 Jul | 🏛️ Hanoi extra + 🚆 Tren nocturno → Hue             | Tren 22:00, ~14h                     | Tren nocturno (camarote VIP 4 literas) |
| 11  | Mar 14 Jul | 🛬 Llegada Hue ~12:00 + Ciudad Imperial             | A pie (estación céntrica)            | Meliá Vinpearl Hue (Two Bedroom Suite) |
| 12  | Mié 15 Jul | 🏛️ Tumbas imperiales + 🚌 Hue → Hoi An              | Taxi + autobús 3h (15:00)            | An Bang Beach Town Homestay            |
| 13  | Jue 16 Jul | 🏮 Hoi An express (casco antiguo, taller linternas) | A pie/bici                           | Mismo homestay Hoi An                  |
| 14  | Vie 17 Jul | Mañana Hoi An + ✈️ DAD → Siem Reap                  | Taxi 45min + vuelo 1h20m             | Khmer Mansion Boutique (Wat Bo)        |
| 15  | Sáb 18 Jul | 🛕 Angkor circuito grande (amanecer Srah Srang)     | Tuk-tuk todo el día                  | Mismo hotel Siem Reap                  |
| 16  | Dom 19 Jul | 🛕 Banteay Srei + 🚌 Bus nocturno → PP              | Tuk-tuk + bus 22:00-23:00, ~6h       | Bus nocturno (VIP cama)                |
| 17  | Lun 20 Jul | ✈️ PNH 08:35 → Abu Dhabi → MAD                      | Etihad 16h05m                        | 🏠 Casa 🎉                             |

#### 🏨 Alojamientos confirmados

| Noches        | Alojamiento                   | Habitación                          |
| ------------- | ----------------------------- | ----------------------------------- |
| 5 Jul, 12 Jul | Peridot Gallery Classic Hotel | Old Quarter, Hanoi                  |
| 6-7 Jul       | Homestay Pu Luong             | Ban Hieu/Ban Don                    |
| 8 Jul         | Tam Coc Family Hotel          | Tam Coc, Ninh Binh                  |
| 10-11 Jul     | Cat Ba Eco Lodge              | Deluxe Family Suite (2 dobles)      |
| 14 Jul        | Meliá Vinpearl Hue            | Two Bedroom Suite (1 king + 2 ind.) |
| 15-16 Jul     | An Bang Beach Town Homestay   | An Bang, Hoi An                     |
| 17 Jul        | Khmer Mansion Boutique Hotel  | Wat Bo, Siem Reap                   |

#### 🚗 Resumen de desplazamientos

- MAD → HAN: ✈️ Qatar Airways 17h 10m (1 escala Doha)
- Aeropuerto HAN → Old Quarter: 🚕 Taxi/Grab 30min (~12€)
- Hanoi → Pu Luong: 🚗 Coche privado 3.5-4h
- Pu Luong → Ninh Binh: 🚗 Coche privado ~3h
- Ninh Binh → Cat Ba: 🚗 Coche 2h + ⛴️ Ferry 45min
- Cat Ba → Hanoi: ⛴️ Ferry 45min + 🚗 Coche ~3.5h
- Hanoi → Hue: 🚆 Tren nocturno ~14h (Reunification Express)
- Hue → Hoi An: 🚌 Autobús ~3h (Paso de Hai Van)
- Hoi An → Da Nang: 🚕 Taxi 45min (~15€ con Grab)
- DAD → Siem Reap: ✈️ Vuelo directo ~1h 20min (RESERVAR)
- Siem Reap: 🛺 Tuk-tuk (~15-25 USD/día)
- Siem Reap → Phnom Penh: 🚌 Bus nocturno ~6h (RESERVAR)
- PNH → MAD: ✈️ Etihad Airways 16h 05m (1 escala Abu Dhabi)

#### ⚠️ Reservas pendientes

- [ ] Vuelo DAD → Siem Reap (17 Jul)
- [ ] Tren nocturno Hanoi → Hue (13 Jul, 22:00) — Vexere/Baolau, ~25-35€/pers
- [ ] Bus nocturno Siem Reap → Phnom Penh (19 Jul, 22:00-23:00) — BookMeBus/VET
- [ ] E-visa Camboya (~30 USD, llevar foto carnet)
- [ ] Pase Angkor 3 días: 62 USD/pers (taquilla oficial)

#### 👥 Viajeros

| Nombre                       | Pasaporte |
| ---------------------------- | --------- |
| Basilio Martin Sanz          | PAF262178 |
| Maria Isabel Calvo Vaquerizo | PAF262177 |
| Borja Martin Calvo           | PAP188120 |
| Nestor Martin Calvo          | PAO904457 |
| Vanesa Pinillos Garcia       | PAP704109 |

#### 💰 Moneda y pagos

- 🇻🇳 Vietnam: Dong vietnamita (VND). 1€ ≈ 27,000 VND. Llevad efectivo, pocos sitios aceptan tarjeta
- 🇰🇭 Camboya: Dólar USD (billetes pequeños y en BUEN ESTADO. Riel solo para cambio <1 USD)

#### 🌦️ Clima Julio (temporada lluvias monzónicas)

- Norte Vietnam: 25-35°C, chaparrones cortos (1-2h) por la tarde
- Centro Vietnam (Hue + Hoi An): 26-35°C, julio es de los meses MÁS SECOS del centro
- Camboya (Siem Reap): 25-35°C, lluvias por la tarde que refrescan
- ✅ Ventaja: temporada baja = menos turistas, precios más bajos, arrozales en máximo esplendor

### Lugares Principales (del itinerario real)

**Vietnam — Norte**:

- Hanoi: Old Quarter, Templo Literatura, Lago Hoan Kiem, Mausoleo Ho Chi Minh, Pagoda un Pilar, Lago Tay Ho, Templo Tran Quoc, Mercado Dong Xuan, Giang Café (café huevo)
- Pu Luong: Reserva Natural, arrozales en terrazas, cascada Hieu, aldeas etnias Thai y Muong
- Ninh Binh: Trang An (UNESCO, 9 cuevas), Hang Mua (500 escalones, vistas 360°), Tam Coc, Bich Dong, río Ngo Dong
- Cat Ba / Lan Ha Bay: Muelle Beo, formaciones kársticas, kayaks, aldea flotante Viet Hai, playas Cat Co 1/2/3, plancton bioluminiscente

**Vietnam — Centro**:

- Hue: Ciudad Imperial (UNESCO), Palacio Suprema Armonía, Tumba Khai Dinh, Tumba Tu Duc, Pagoda Thien Mu, río Perfume
- Hoi An: Casco antiguo (UNESCO), Puente Japonés, taller linternas seda, playa An Bang, aldea Tra Que, bosque palmeras Cam Thanh
- Da Nang: Montañas de Mármol (Marble Mountains)

**Camboya**:

- Siem Reap: Angkor Wat, Angkor Thom, Bayon (216 caras), Ta Prohm (Tomb Raider), Srah Srang, Banteay Srei (templo rosa), Banteay Samre, Kbal Spean (río 1000 lingas), Kampong Phluk (aldea flotante Tonlé Sap)
- Phnom Penh: Solo paso al aeropuerto (no hay pernocta)

### Pre-viaje (Datos Iniciales)

**Checklist de equipaje pre-cargado**:

- Documentos: pasaporte, visados, seguros, billetes, reservas
- Salud: vacunas, medicamentos, repelente, botiquín
- Ropa: ligera, impermeable, templos, calzado cómodo
- Electrónica: adaptador, power bank, cables
- Higiene: toalla microfibra, gel, pañuelos
- Varios: candado, bolsa estanca, dinero efectivo

**Secciones informativas pre-cargadas**:

- Vacunas recomendadas (Hepatitis A/B, tifoidea, tétanos, rabia)
- Salud: agua embotellada, comida callejera, farmacias
- Dinero: cajeros, tarjetas sin comisiones, cambio moneda
- Conectividad: SIM cards (Viettel, Cellcard), WiFi, apps offline
- Seguridad: estafas comunes, números emergencia, embajadas
- Consejos: clima, transporte (Grab, tuk-tuks), negociación, templos

---

## Consideraciones Técnicas

### Performance

- Code splitting por ruta
- Lazy loading de imágenes
- Virtualización de listas largas
- Service Worker con cache estratégico

### Mobile-First

- Touch-friendly (botones grandes, spacing)
- Gestures (swipe para acciones)
- Bottom navigation (pulgar alcanzable)
- Responsive pero optimizado para móvil

### Accesibilidad

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast (WCAG AA)

### Seguridad

- No hay datos sensibles en código
- Documentos almacenados localmente
- No hay transmisión de datos
- HTTPS obligatorio (PWA requirement)

---

## Próximos Pasos

1. **Aprobar este plan** (revisar y ajustar si es necesario)
2. **Preparar datos iniciales** (itinerario real, lugares, documentos)
3. **Iniciar Fase 1** (setup del proyecto)
4. **Desarrollo iterativo** (una fase a la vez)
5. **Testing** (offline, diferentes dispositivos)
6. **Deploy** (GitHub Pages)
7. **Compartir** con compañeros de viaje

---

## Preguntas Pendientes

1. ¿Tienes ya el itinerario detallado (vuelos, alojamientos, actividades)?
2. ¿Hay lugares específicos que quieres incluir sí o sí?
3. ¿Prefieres tema claro u oscuro por defecto?
4. ¿Quieres notificaciones push para eventos (requiere permisos)?
5. ¿Necesitas soporte para otros idiomas además de español?
