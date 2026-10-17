# Guía de Demostración en Vivo y Guion de Video — `DEMO.md`

**Proyecto:** Telegram AURA — Constellations  
**Lema:** *«Tus ideas, conectadas.»*  
**Tiempo de Puesta en Marcha:** Menos de 30 segundos  

---

## 1. Inicio Rápido en Menos de 30 Segundos

Para abrir y probar **Telegram AURA — Constellations** en vivo en tu máquina local:

```bash
# 1. Instalar dependencias (si es la primera vez)
npm install

# 2. Iniciar el servidor interactivo
npm run dev
```

Abre en tu navegador: **`http://localhost:5173`**

> **Nota:** No necesitas configurar ninguna variable de entorno ni clave API. La aplicación carga automáticamente las **3 constelaciones de demostración** (`Creative Studio`, `Learning Universe` y `Daily Life`), el motor de lienzo a 60 FPS y la persistencia local en `IndexedDB`.

---

## 2. Recorrido Interactivo Paso a Paso para una Demostración en Vivo

Si estás presentando el proyecto ante un jurado, equipo de producto o revisión técnica, sigue este recorrido de 5 minutos para mostrar todas las capacidades clave:

### Paso 1: Identidad Inaugural y Mini-Constelación en Vivo (`Inicio`)
1. Al abrir `http://localhost:5173`, observa la animación inaugural de **1.4 segundos** (`IntroSplash`) donde los tres astros del emblema `AuraLogo` trazan sus arcos geodésicos.
2. En la **Pantalla de Bienvenida**, toca cualquiera de las 4 estrellas de la **Mini-constelación en vivo** (*Nota de @elena_design*, *Sistema Visual AURA*, *API Telegram Mini Apps*, *Prototipo Interactivo 60 FPS*) y observa cómo se iluminan sus aristas y cambia el resumen inferior.
3. Haz clic en **«Explorar AURA»** o selecciona directamente la tarjeta **Creative Studio**.

### Paso 2: Lienzo Interactivo, Arrastre a 60 FPS y Conexiones Geodésicas (`Universo`)
1. **Mover tarjetas:** Arrastra cualquiera de las tarjetas de `Creative Studio` (por ejemplo, *Manifiesto Visual: Observatorio Silencioso*). Observa cómo las curvas Bézier se recalculan con suavidad a 60 FPS y los **Halos de Clúster** (`Clúster · Concepto`, `Clúster · Diseño`, `Clúster · Entrega`) se adaptan dinámicamente.
2. **Trazar una conexión en vivo:**
   - Haz clic en el botón de enlace (`🔗`) en la esquina superior derecha de una tarjeta (o en el botón **Alternar Modo Conectar** de la barra flotante derecha).
   - Mueve el cursor por el lienzo: verás una **línea guía dorada en vivo** siguiendo tu puntero.
   - Toca otra tarjeta para completar la conexión.
3. **Desvincular una conexión:** Haz clic directamente sobre la píldora central de cualquier curva (ej. `conecta ×`) para eliminar ese vínculo.
4. **Reorganización armónica:** Pulsa el botón de la varita mágica (**Reorganizar constelación automáticamente**) en la botonera flotante derecha para ordenar los nodos en geometría orbital limpia.

### Paso 3: Captura Inteligente desde Telegram (`+ Nueva Tarjeta`)
1. Pulsa el botón superior **«Capturar de Telegram / + Nueva Tarjeta»**.
2. En el cuadro superior **Pegado inteligente de Telegram**, pega el siguiente texto de prueba:
   ```text
   Reenviado de @pavel_vision: Las Mini Apps espaciales transforman cómo organizamos notas en Telegram https://t.me/telegram/142 #tma #futuro #ux
   ```
3. Observa cómo AURA detecta y rellena automáticamente:
   - **Título sugerido:** *Las Mini Apps espaciales transforman cómo organizamos notas en Telegram*
   - **Tipo:** `Mensaje de Telegram`
   - **Color AURA:** `Champagne Gold`
   - **Etiquetas:** `telegram, tma, futuro, ux`
   - **Enlace / Fuente:** `https://t.me/telegram/142`
4. Haz clic en **«Guardar en Constelación»**: la cámara se desplazará suavemente para centrar tu nueva estrella en el lienzo.

### Paso 4: Hoja de Detalles (`CardDetailSheet`) y Biblioteca Editorial (`Biblioteca`)
1. Haz clic sobre cualquier tarjeta del lienzo para abrir su **Hoja de Detalles**.
2. Cambia su **Color AURA**, añade una nota adicional, marca la tarjeta como **Favorito (`★`)** o cambia su estado a **Pendiente (`⏳`)**.
3. En la barra inferior (`BottomDock`), entra en **Biblioteca**:
   - Filtra por **Favoritos ★** o **Pendientes ⏳**.
   - Cambia el selector de alcance a **Todo el Universo** para explorar las tarjetas de las 3 constelaciones a la vez.
   - Activa el botón **Agrupado por Clúster** y luego pulsa **«Ver en el lienzo»** en cualquier tarjeta para viajar directamente a sus coordenadas exactas.

### Paso 5: Temas Duales, Marco Telegram Mini App (390px) y Prueba de Estrés (105 Nodos) (`Ajustes`)
1. Ve a **Ajustes** en la barra inferior:
   - Alterna entre **Tema Nocturno (*Midnight Amethyst*)** y **Tema Diurno (*Pearl Lavender*)**.
   - Activa el interruptor **«Marco de vista previa Telegram Mini App (390px)»**: verás cómo toda la aplicación se encuadra dentro de una carcasa móvil de `390×844px` con cabecera nativa de Telegram.
   - Pulsa el botón **«Probar estrés de rendimiento (105 tarjetas)»**: AURA generará y abrirá la constelación `Stress Lab (105 nodos)` en espiral áurea para que compruebes el desplazamiento y zoom a 60 FPS.
   - Finalmente, prueba **«Exportar universo (JSON)»** o **«Restaurar demostración original»**.

---

## 3. Guion Técnico de Grabación del Video Demostrativo (60–90 Segundos)

Este guion está diseñado exactamente en las **7 escenas oficiales (sección 17 del Megaprompt)** para producir un video demostrativo ágil, claro y memorable de **85 segundos** (`1:25`).

### Preparación Antes de Grabar
- Resolución recomendada de captura: **1440×900** (o **1920×1080**) a **60 FPS**.
- Ejecuta en la consola del navegador `localStorage.clear(); indexedDB.deleteDatabase('telegram-aura-db'); location.reload();` justo al iniciar la grabación para capturar la animación inaugural limpia.

---

### Escena 1 (`0:00 – 0:10`) — Introducción e Identidad AURA
- **Acción en pantalla:**
  - Se reproduce el **IntroSplash de 1.4 segundos** con el símbolo `AuraLogo` trazando sus arcos geodésicos y el lema *«Tus ideas, conectadas.»*
  - Aparece la **Pantalla de Bienvenida** en modo nocturno (*Midnight Amethyst*).
  - El cursor toca dos nodos de la **Mini-constelación en vivo** (*Nota de @elena_design* y *Prototipo Interactivo 60 FPS*), iluminando sus conexiones.
- **Locución / Texto sobreimpreso sugerido:**
  > *«En Telegram guardamos nuestras mejores ideas, pero en una lista infinita pierden su conexión. Bienvenido a Telegram AURA — Constellations: un observatorio visual para conectar tu conocimiento.»*

---

### Escena 2 (`0:10 – 0:22`) — Exploración de `Creative Studio` y Captura Rápida desde Telegram
- **Acción en pantalla:**
  - Clic en **«Explorar AURA»** para abrir el lienzo de la constelación **`Creative Studio`**.
  - Clic en el botón superior **«Capturar de Telegram / + Nueva Tarjeta»**.
  - Pegar en el campo inteligente: `Reenviado de @elena_design: Prototipo listo para revisión https://t.me/designers/88 #tma #entrega`.
  - Mostrar cómo se autocompletan título, autor `@elena_design`, color oro champán y etiquetas, y pulsar **«Guardar en Constelación»**.
- **Locución / Texto sobreimpreso sugerido:**
  > *«Pegá cualquier enlace t.me o mensaje reenviado: AURA detecta al instante el canal, el autor y las etiquetas para convertirlo en una estrella dentro de tu constelación.»*

---

### Escena 3 (`0:22 – 0:38`) — Interacción en el Lienzo a 60 FPS y Conexiones Geodésicas
- **Acción en pantalla:**
  - Arrastrar la nueva tarjeta con fluidez a 60 FPS por el lienzo.
  - Hacer clic en el botón `🔗` de la tarjeta para activar el **Modo Conectar**, desplazar el puntero mostrando la curva Bézier dorada en vivo y tocar la tarjeta *Manifiesto Visual: Observatorio Silencioso* para unirlas.
  - Pulsar el botón de la varita mágica (**Reorganizar constelación automáticamente**) en los controles flotantes y luego cambiar rápidamente entre las píldoras superiores **`Learning Universe`** y **`Creative Studio`**.
- **Locución / Texto sobreimpreso sugerido:**
  > *«Mové tus ideas con fluidez a 60 fotogramas por segundo, trazá conexiones geodésicas con sentido semántico y reorganizá tus clústeres temáticos con un solo toque.»*

---

### Escena 4 (`0:38 – 0:52`) — Funcionalidad Profunda: Hoja de Detalles y Biblioteca Editorial
- **Acción en pantalla:**
  - Tocar una tarjeta para abrir la **Hoja de Detalles (`CardDetailSheet`)**.
  - Cambiar su **Color AURA** a *Midnight Amethyst*, añadir una nota rápida, agregar una etiqueta `#prioridad` y cerrarla.
  - Abrir la vista **Biblioteca** desde la barra inferior (`BottomDock`).
  - Escribir `diseño` en el buscador en tiempo real, activar el filtro **Favoritos ★** y alternar el botón **Agrupado por Clúster**.
- **Locución / Texto sobreimpreso sugerido:**
  > *«Cada tarjeta guarda notas ricas, estados, colores y vínculos. Y cuando necesitás lectura estructurada, la Biblioteca Editorial filtra y agrupa todo tu universo al instante.»*

---

### Escena 5 (`0:52 – 1:04`) — Adaptabilidad: Modo Diurno (*Pearl Lavender*) y Marco Móvil TMA (390px)
- **Acción en pantalla:**
  - Ir a **Ajustes** en el `BottomDock`.
  - Cambiar de **Tema Nocturno (*Midnight Amethyst*)** a **Tema Diurno (*Pearl Lavender*)**, mostrando la transición editorial cálida con contraste WCAG AA.
  - Activar el interruptor **«Marco de vista previa Telegram Mini App (390px)»** y volver a **Universo** para mostrar cómo el lienzo se adapta con precisión a la pantalla de un teléfono dentro de Telegram.
- **Locución / Texto sobreimpreso sugerido:**
  > *«Diseñado tanto para sesiones nocturnas en Midnight Amethyst como para lectura diurna en Pearl Lavender, con ergonomía nativa de Telegram Mini App en pantallas móviles.»*

---

### Escena 6 (`1:04 – 1:15`) — Persistencia Local Real y Respaldo JSON Validado
- **Acción en pantalla:**
  - Regresar a **Ajustes**, desactivar el marco móvil para ver la pantalla completa y pulsar **«Exportar universo (JSON)»** (mostrando la vista previa del JSON estructurado).
  - Recargar el navegador (`F5` / `Cmd+R`) en vivo y mostrar cómo la constelación, la tarjeta creada y las conexiones trazadas permanecen **100% intactas** gracias a `IndexedDB`.
- **Locución / Texto sobreimpreso sugerido:**
  > *«Privacidad local-first real: tus constelaciones se guardan al instante en IndexedDB dentro de tu dispositivo y podés exportar o importar respaldos JSON validados cuando quieras.»*

---

### Escena 7 (`1:15 – 1:25`) — Cierre con el Mapa Completo y Lema Oficial
- **Acción en pantalla:**
  - Regresar a la vista **Universo** en modo nocturno (*Midnight Amethyst*) y pulsar el botón **Centrar mapa** (`Crosshair`) para mostrar la constelación completa iluminada con sus halos y curvas geodésicas.
  - Sobreimprimir el emblema `AuraLogo` y el lema final.
- **Locución / Texto sobreimpreso sugerido:**
  > *«Telegram AURA — Constellations. Tus ideas, conectadas.»*
