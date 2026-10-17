# Hoja de Ruta del Proyecto — `ROADMAP.md`

**Proyecto:** Telegram AURA — Constellations  
**Estado Actual:** MVP v1.0 Terminado, Verificado y Auditado  

Este documento separa con total transparencia las capacidades que **ya están implementadas y verificadas en código** de las mejoras proyectadas para fases posteriores.

---

## Bloque 1: Funciones Terminadas y Verificadas (MVP v1.0 — 100% Completado)

Todas las capacidades listadas en este bloque están operativas hoy mismo en el repositorio y respaldadas por pruebas automatizadas:

### 1.1. Las 15 Funciones Obligatorias del Producto
- [x] **1. Creación completa de tarjetas (`createCard`):** Soporte para título, contenido, notas adicionales, 5 tipos (`idea`, `message`, `link`, `task`, `reference`), 5 colores AURA (`amethyst`, `gold`, `sage`, `coral`, `neutral`), estado (`active`, `pending`, `completed`), etiquetas (`#tags`), clúster y URL de origen.
- [x] **2. Edición en vivo (`updateCard`):** Modificación instantánea de cualquier atributo desde la Hoja de Detalles (`CardDetailSheet`) con guardado automático en `IndexedDB`.
- [x] **3. Eliminación segura con confirmación de 2 pasos (`removeCard`):** Prevención de borrados accidentales y eliminación en cascada de todas las conexiones asociadas a la tarjeta.
- [x] **4. Movimiento libre en el lienzo (`updateCardPosition`):** Arrastre fluido a 60 FPS mediante `Pointer Events` con cálculo preciso bajo cualquier nivel de zoom y persistencia de coordenadas `(x, y)`.
- [x] **5. Trazado y eliminación de conexiones (`ConnectionLayer`):** Creación de vínculos mediante curvas Bézier cúbicas tanto desde el **Modo Conectar** en el lienzo como desde el selector de la Hoja de Detalles, con etiquetas relacionales (`inspira`, `depende de`, `referencia`, `amplía`, `conecta`) y desvinculación en un clic.
- [x] **6. Gestión completa de constelaciones (`ConstellationModal`):** Creación, cambio de nombre, descripción, ícono, color de acento y eliminación en cascada de constelaciones completas.
- [x] **7. Tres constelaciones de demostración precargadas (`demoSeed.ts`):**
  - `Creative Studio` (6 tarjetas y 6 conexiones).
  - `Learning Universe` (6 tarjetas y 5 conexiones).
  - `Daily Life` (5 tarjetas y 4 conexiones).
- [x] **8. Búsqueda instantánea en tiempo real:** Buscador activo tanto en la cabecera del Lienzo (atenuando las tarjetas que no coinciden) como en la Biblioteca Editorial.
- [x] **9. Filtrado multicriterio:** Filtros combinables por etiquetas `#tag`, tipo de elemento, favoritos (`★`), pendientes (`⏳`), recientes y alcance (*Constelación activa* vs *Todo el Universo*).
- [x] **10. Navegación fluida entre las 4 pantallas (`BottomDock`):** Transición instantánea sin recarga entre **Inicio**, **Universo**, **Biblioteca** y **Ajustes**.
- [x] **11. Temas duales verificados WCAG 2.2 AA:** Tema Nocturno (**Midnight Amethyst** `#10121D`), Tema Diurno (**Pearl Lavender** `#F7F5F1`) y Tema Automático sincronizado con el sistema o Telegram.
- [x] **12. Persistencia local en `IndexedDB` (`storage.ts`):** Conservación íntegra de constelaciones, tarjetas, posiciones, conexiones y ajustes tras recargar o cerrar el navegador, con opciones para borrar solo los datos de demostración (`clearDemoData`) o restaurar la demostración de fábrica (`resetDemoData`).
- [x] **13. Exportación e importación de respaldo JSON validado (`validation.ts`):** Descarga de archivo `.json`, copia al portapapeles e importación validada con `Zod` en modos **Combinar (*Merge*)** o **Reemplazar (*Replace*)**.
- [x] **14. Captura inteligente desde Telegram (`parseTelegramInput`):** Reconocimiento automático de enlaces `https://t.me/...`, mensajes reenviados (`Reenviado de @canal: ...`), menciones `@autor` y extracción de `#hashtags`.
- [x] **15. Controles de cámara y auto-organización armónica:** Zoom `+`/`-`, indicador `100%`, botón **Centrar mapa**, ajuste automático al viewport con `ResizeObserver` y botón **Reorganizar constelación automáticamente** (`autoArrangeActiveConstellation`) en geometría elíptica u orbital por clústeres.

### 1.2. Capacidades Adicionales Implementadas en v1.0
- [x] **Identidad visual propia (`AuraLogo` + `IntroSplash`):** Emblema vectorial de tres astros con animación inaugural de 1.4s y botón `Saltar`.
- [x] **Laboratorio de estrés de rendimiento (+105 tarjetas):** Generador en espiral áurea en *Ajustes* para comprobar la fluidez real a 60 FPS.
- [x] **Marco de vista previa Telegram Mini App (`390×844px`):** Simulación de carcasa móvil directamente desde *Ajustes* en escritorio.
- [x] **Puente Backend Telegram Mini App (`backend_tma/`):** Servidor opcional en Python 3.12 + FastAPI + SQLite con validación criptográfica `HMAC-SHA256` de `initData` y webhook de captura vía Bot.
- [x] **Suite de pruebas automatizadas completa:** Tests unitarios y de integración en Vitest, tests E2E en Playwright Chromium y tests de backend en Python `unittest`.

---

## Bloque 2: Mejoras Futuras (Fase 2 — Evolución de Producto)

Las siguientes mejoras están diseñadas para expandir la experiencia sobre la arquitectura actual en una segunda iteración:

1. **Sincronización Opcional Multi-Dispositivo con `Telegram CloudStorage` / `DeviceStorage`:**
   - Integración opcional con la API `window.Telegram.WebApp.CloudStorage` (y `DeviceStorage` en Bot API 9.0+) para sincronizar metadatos ligeros de las constelaciones entre el móvil y Telegram Desktop sin requerir servidores de terceros.
   - Compresión delta de coordenadas para respetar los límites de cuota por clave de `CloudStorage`.
2. **Exportación Visual de Alta Resolución (Imagen PNG y Vectorial SVG/PDF):**
   - Generador de instantáneas del lienzo activo para compartir una constelación como imagen editorial lista para enviar a un chat o canal de Telegram, conservando la estética *Midnight Amethyst* o *Pearl Lavender*.
3. **Plantillas de Constelación Preconfiguradas (*Constellation Blueprints*):**
   - Galería rápida al crear una nueva constelación con estructuras iniciales para: *Investigación de Producto*, *Mapa de Lecturas*, *Planificación de Lanzamiento* o *Bitácora Semanal*.
4. **Historial de Deshacer / Rehacer (*Undo / Redo Stack*) en el Lienzo:**
   - Pila de comandos en memoria (`Ctrl+Z` / `Cmd+Z`) para revertir movimientos de tarjetas, desconexiones o auto-organizaciones recientes durante una sesión de edición intensa.

---

## Bloque 3: Ideas Experimentales (Fase 3 — Visión a Largo Plazo)

Exploraciones tecnológicas avanzadas pensadas para el futuro del ecosistema Telegram Mini Apps y Web moderna:

1. **Constelaciones Colaborativas en Grupos y Canales (`chat_instance` + WebSockets / CRDTs):**
   - Permitir que los miembros de un grupo de estudio o equipo de diseño en Telegram abran una misma Mini App compartida (identificada mediante el parámetro firmado `chat_instance` de `initData`) y construyan una constelación colectiva en tiempo real utilizando estructuras libres de conflictos (*CRDTs* con *Yjs*).
2. **Agrupación y Conexión Asistida por Búsqueda Semántica Local (WebGPU / Embeddings en el Navegador):**
   - Ejecución 100% local en el dispositivo (mediante *WebAssembly* / *WebGPU* con modelos ultraligeros de embeddings) para sugerir conexiones potenciales entre tarjetas cuyo contenido trate temas afines aunque no compartan exactamente las mismas etiquetas, manteniendo el principio estricto de **cero envío de datos a servidores de IA externos**.
3. **Vista Orbital Cronológica (*Time-Lapse Astronómico*):**
   - Un deslizador temporal que permita reproducir cómo evolucionó una constelación a lo largo de las semanas, iluminando el orden en que surgieron las ideas y se trazaron sus vínculos.
