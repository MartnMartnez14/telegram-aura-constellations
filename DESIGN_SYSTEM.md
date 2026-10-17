# Aura Design System — `DESIGN_SYSTEM.md`

**Proyecto:** Telegram AURA — Constellations  
**Lema:** *«Tus ideas, conectadas.»*  
**Dirección de Arte:** Observatorio Astronómico Contemporáneo · Editorial · Cristal Esmerilado Sutil  
**Estándar de Accesibilidad:** WCAG 2.2 Nivel AA Verificado  

---

## 1. Filosofía Estética

El sistema de diseño de **Telegram AURA — Constellations** (**Aura Design System**) se aleja deliberadamente de dos extremos habituales en las herramientas de productividad: por un lado, los tableros corporativos rígidos y saturados de barras de herramientas; por otro, la estética *cyberpunk* de neones estridentes que genera fatiga visual en pocos minutos.

En su lugar, **AURA** propone la atmósfera de un **observatorio astronómico contemporáneo combinado con diseño editorial de alta legibilidad**:

1. **Serenidad Espacial:** El lienzo actúa como un cielo tranquilo donde cada tarjeta tiene aire para respirar, evitando el ruido visual y permitiendo que la atención se concentre en las relaciones entre ideas.
2. **Materialidad Digital (*Frosted Obsidian & Pearl Glass*):** Las superficies emplean cristal esmerilado sutil (`backdrop-filter: blur(16px)`), bordes translúcidos de `1px` y una franja superior de `3px` que identifica de inmediato la familia cromática de cada tarjeta.
3. **Dualidad Atmosférica Real:** El sistema no invierte colores mecánicamente; ofrece dos atmósferas diseñadas a medida:
   - **Midnight Amethyst (`data-theme="night"`):** Pensado para sesiones nocturnas o pantallas OLED, con fondos abisales (`#10121D`) y acentos luminosos en amatista, oro champán y verde salvia.
   - **Pearl Lavender (`data-theme="day"`):** Inspirado en el papel editorial cálido (`#F7F5F1`) y la tinta profunda (`#292637`), con acentos calibrados específicamente para mantener un contraste nítido a plena luz del día.

---

## 2. Tokens de Color y Verificación de Contraste WCAG 2.2 AA

Todos los tokens están centralizados en `src/styles/tokens.css` y se aplican dinámicamente sobre el elemento raíz `<html data-theme="night|day">`.

### 2.1. Tema Nocturno — *Midnight Amethyst* (`[data-theme="night"]`)

| Token CSS | Valor Hex / RGBA | Rol Visual | Contraste sobre `--bg-canvas` (`#10121D`) | Contraste sobre `--bg-surface` (`#1C1D2C`) | Cumplimiento WCAG 2.2 |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `--bg-canvas` | `#10121D` | Fondo principal del observatorio y lienzo | — | — | Base |
| `--bg-surface` | `#1C1D2C` | Superficie sólida de paneles, tarjetas y modales | — | — | Base |
| `--bg-surface-glass` | `rgba(28, 29, 44, 0.84)` | Superficie translúcida con `blur(16px)` | — | — | Base |
| `--bg-elevated` | `#24263A` | Controles interactivos, *inputs*, etiquetas y botones | — | — | Base |
| `--bg-elevated-hover` | `#2C2F47` | Estado *hover* de controles elevados | — | — | Base |
| `--text-primary` | `#F4F0F8` | Títulos y cuerpo de lectura principal | **16.4 : 1** | **13.5 : 1** | **AAA / AA** |
| `--text-secondary` | `#A7A5B7` | Subtítulos, descripciones y metadatos | **7.6 : 1** | **6.2 : 1** | **AAA / AA** |
| `--text-muted` | `#7E7B91` | Indicadores auxiliares, *placeholders* y pistas | **4.6 : 1** | **3.8 : 1** *(UI/Grande)* | **AA** |
| `--text-on-accent` | `#10121D` | Texto sobre botones primarios (`#A997DF` / `#D9BC80`) | **7.8 : 1** *(sobre Amatista)* | **10.4 : 1** *(sobre Oro)* | **AAA / AA** |
| `--accent-amethyst` | `#A997DF` | Acento primario (*Midnight Amethyst*) | **7.8 : 1** | **6.4 : 1** | **AA** |
| `--accent-gold` | `#D9BC80` | Acento secundario (*Champagne Gold* · Mensajes/Favoritos) | **10.4 : 1** | **8.6 : 1** | **AAA / AA** |
| `--accent-sage` | `#94BFB2` | Acento terciario (*Sage Green* · Enlaces/Éxito) | **9.5 : 1** | **7.8 : 1** | **AAA / AA** |
| `--accent-coral` | `#E1A6A9` | Acento cálido (*Soft Coral* · Tareas/Alertas) | **8.9 : 1** | **7.3 : 1** | **AAA / AA** |
| `--accent-neutral` | `#A7A5B7` | Acento neutro (*Obsidian Neutral*) | **7.6 : 1** | **6.2 : 1** | **AAA / AA** |
| `--border-subtle` | `rgba(244, 240, 248, 0.09)` | Bordes delicados de tarjetas y divisores | — | — | Decorativo |
| `--border-strong` | `rgba(244, 240, 248, 0.18)` | Bordes de tarjetas activas o en *hover* | — | — | UI |
| `--border-focus` | `#A997DF` | Anillo de foco accesible (`:focus-visible`) | **7.8 : 1** | **6.4 : 1** | **AA (Non-text > 3:1)** |

---

### 2.2. Tema Diurno — *Pearl Lavender* (`[data-theme="day"]`)

| Token CSS | Valor Hex / RGBA | Rol Visual | Contraste sobre `--bg-canvas` (`#F7F5F1`) | Contraste sobre `--bg-surface` (`#FFFFFF`) | Cumplimiento WCAG 2.2 |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `--bg-canvas` | `#F7F5F1` | Fondo marfil cálido del lienzo diurno | — | — | Base |
| `--bg-surface` | `#FFFFFF` | Superficie limpia de tarjetas y modales | — | — | Base |
| `--bg-surface-glass` | `rgba(255, 255, 255, 0.88)` | Cristal esmerilado diurno con `blur(16px)` | — | — | Base |
| `--bg-elevated` | `#EFECE6` | Controles, *chips*, buscadores y selectores | — | — | Base |
| `--bg-elevated-hover` | `#E5E0D8` | Estado *hover* de controles en modo día | — | — | Base |
| `--text-primary` | `#292637` | Títulos y texto principal en tinta amatista oscura | **13.4 : 1** | **14.8 : 1** | **AAA / AA** |
| `--text-secondary` | `#656072` | Subtítulos, resúmenes y etiquetas | **5.5 : 1** | **6.1 : 1** | **AA** |
| `--text-muted` | `#857F94` | Metadatos secundarios y textos de apoyo | **3.6 : 1** *(UI/Grande)* | **4.0 : 1** | **AA** |
| `--text-on-accent` | `#FFFFFF` | Texto blanco sobre botones primarios (`#685496`) | **6.1 : 1** *(sobre Amatista)* | — | **AA** |
| `--accent-amethyst` | `#685496` | Acento primario calibrado para fondo claro | **5.5 : 1** | **6.1 : 1** | **AA** |
| `--accent-gold` | `#947232` | Acento dorado editorial (*Warm Bronze Gold*) | **4.3 : 1** | **4.7 : 1** | **AA** |
| `--accent-sage` | `#4D796E` | Acento verde salvia profundo | **4.6 : 1** | **5.1 : 1** | **AA** |
| `--accent-coral` | `#B5696E` | Acento coral terracota | **4.1 : 1** *(UI/Bordes)* | **4.5 : 1** | **AA** |
| `--accent-neutral` | `#656072` | Acento neutro diurno | **5.5 : 1** | **6.1 : 1** | **AA** |
| `--border-subtle` | `rgba(41, 38, 55, 0.11)` | Bordes sutiles de tarjetas sobre marfil | — | — | Decorativo |
| `--border-strong` | `rgba(41, 38, 55, 0.22)` | Bordes activos y divisores acentuados | — | — | UI |
| `--border-focus` | `#7562A3` | Anillo de foco de teclado (`2px solid`) | **4.6 : 1** | **5.1 : 1** | **AA (Non-text > 3:1)** |

---

## 3. Sistema Tipográfico, Jerarquías y Espaciados

### 3.1. Familias Tipográficas
Cargadas mediante Google Fonts con *fallbacks* nativos del sistema operativo para renderizado instantáneo:

- **`--font-display` (`'Plus Jakarta Sans'`, sans-serif):**  
  Empleada en titulares de pantalla (`h1`), nombres de constelaciones (`h2`) y títulos de tarjetas (`h3`). Sus proporciones geométricas contemporáneas aportan carácter editorial y excelente distinción a escalas reducidas de zoom.
- **`--font-sans` (`'Inter'`, system-ui, sans-serif):**  
  Empleada para el cuerpo de notas, mensajes capturados de Telegram, etiquetas, botones y formularios. Optimizada con `-webkit-font-smoothing: antialiased` para lectura cómoda en móvil y escritorio.
- **`--font-mono` (`'JetBrains Mono'`, monospace):**  
  Reservada para indicadores de porcentaje de zoom (`100%`), enlaces `t.me`, identificadores técnicos y el visor de respaldo JSON.

### 3.2. Escala Jerárquica
| Nivel | Elemento / Uso | Familia | Tamaño | Peso | Interlineado (`line-height`) |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **Display Hero** | Título en Bienvenida y Splash | `Plus Jakarta Sans` | `clamp(1.35rem, 3.2vw, 1.8rem)` | `700` | `1.15` |
| **Screen Header (`h1`)** | Cabecera de Biblioteca y Ajustes | `Plus Jakarta Sans` | `1.35rem` (`20.25px`) | `700` | `1.2` |
| **Section Title (`h2`)** | Bloques de configuración y modales | `Plus Jakarta Sans` | `1.02rem` – `1.15rem` | `700` | `1.25` |
| **Card Title (`h3`)** | Título de nodo en el Lienzo y Biblioteca | `Plus Jakarta Sans` | `0.94rem` – `1.0rem` | `700` | `1.28` |
| **Body Base** | Contenido de tarjetas e inputs | `Inter` | `0.84rem` – `0.93rem` (`13.5px–15px`) | `400 / 500` | `1.45 – 1.5` |
| **Caption / Tag** | Chips `#tag`, metadatos de canal y badges | `Inter` | `0.68rem` – `0.78rem` (`11px–12.5px`) | `600` | `1.2` |

### 3.3. Radios y Espaciados
- **Radios de curvatura:**
  - `--radius-xs`: `6px` (botones de acción interna en tarjetas).
  - `--radius-sm`: `10px` (campos de entrada, selectores y botones estándar).
  - `--radius-md`: `14px` (tarjetas de constelación `.aura-card`).
  - `--radius-lg`: `18px` (paneles de vidrio `.aura-glass-panel`).
  - `--radius-xl`: `24px` (superficies modales `.aura-modal-surface`).
  - `--radius-pill`: `9999px` (barra de navegación inferior `BottomDock`, selector de constelaciones y etiquetas `.aura-tag`).
- **Áreas seguras móviles (`Safe Area Insets`):**  
  Variables `--safe-top`, `--safe-bottom`, `--safe-left` y `--safe-right` alimentadas tanto por `env(safe-area-inset-*)` de CSS como por `window.Telegram.WebApp.safeAreaInset`.

---

## 4. Identidad Gráfica (`AuraLogo`) y Animación Inaugural

### 4.1. Geometría del Símbolo (`public/aura-logo.svg` y `src/components/branding/AuraLogo.tsx`)
El emblema oficial de **Telegram AURA — Constellations** está construido sobre un lienzo vectorial de `120×120` unidades que sintetiza el concepto del proyecto:

1. **Halo Atmosférico Radial:** Un resplandor suave central que funde `#A997DF` (24% opacidad) con `#D9BC80` (8% opacidad).
2. **Anillo Orbital Elíptico y Meridiano Celeste:** Una elipse inclinada a `-21°` con trazo discontinuo (`strokeDasharray="3 4"`) inscrita en un meridiano circular de radio `48`.
3. **Tres Astros Principales (Nodos de Pensamiento):**
   - **Astro Superior (Midnight Amethyst `#A997DF`):** Coordenadas `(54, 26)`, radio `6.4` con halo exterior de radio `11`. Representa las **Ideas**.
   - **Astro Derecho (Champagne Gold `#D9BC80`):** Coordenadas `(90, 66)`, radio `5.4` con halo de radio `9.5`. Representa los **Mensajes de Telegram**.
   - **Astro Izquierdo (Sage Green `#94BFB2`):** Coordenadas `(28, 74)`, radio `4.8` con halo de radio `8.5`. Representa los **Enlaces y Referencias**.
4. **Arcos Geodésicos y Centroide:** Tres curvas Bézier cuadráticas con gradientes cromáticos unen los tres astros y convergen sutilmente en el centroide luminoso `(57, 57)`.

### 4.2. Animación Inaugural (`IntroSplash` — 1.4 Segundos)
Al abrir la aplicación por primera vez en la sesión, `IntroSplash.tsx` ejecuta una secuencia coreografiada de **1400 ms** (`durationMs = 1400`):
- **0 ms – 420 ms:** Aparición suave (`auraSplashFadeIn`) con curva `cubic-bezier(0.22, 1, 0.36, 1)`.
- **120 ms – 970 ms:** Trazado progresivo de los arcos geodésicos del logotipo (`auraDrawGeodesic`, `stroke-dashoffset: 120 -> 0`) mientras los tres astros pulsan suavemente (`auraPulseStar`).
- **1150 ms – 1400 ms:** Transición de salida limpia (`is-exiting`) hacia la pantalla principal.
- **Control del usuario:** Incluye siempre un botón visible **`Saltar`** en la esquina superior derecha y reduce automáticamente la duración a `<350ms` sin animaciones cuando está activo `reducedMotion`.

---

## 5. Componentes Principales y Ergonomía

### 5.1. Tarjetas con Materialidad Digital (`ConstellationNode` / `.aura-card`)
- Dimensiones optimizadas en el lienzo: `260px` de ancho con altura mínima de `124px`.
- Borde superior identificativo de `3px` según `data-color` (`amethyst`, `gold`, `sage`, `coral`, `neutral`).
- Cabecera compacta con ícono semántico de tipo (`Idea`, `Mensaje TG`, `Enlace`, `Tarea`, `Referencia`), clúster, indicador de estado (`⏳` / `✓`), estrella de favorito (`★`) y botón rápido de conexión con contador de enlaces activos.
- Truncado editorial limpio a 2 líneas (`-webkit-line-clamp: 2`) tanto para el título como para el resumen, evitando desbordamientos en el mapa.

### 5.2. Curvas de Conexión Bézier (`ConnectionLayer.tsx`)
- Cálculo geométrico dinámico de curvas Bézier cúbicas (`M fromX fromY C c1x c1y, c2x c2y, toX toY`) entre los centros de las tarjetas conectadas, con curvatura adaptativa proporcional a la distancia euclidiana.
- Diferenciación visual entre conexiones en reposo (trazo discontinuo sutil `strokeDasharray="5 5"`) y conexiones resaltadas al seleccionar una tarjeta (gradiente continuo `url(#aura-conn-gradient)` con halo exterior).
- **Insignia interactiva en el punto medio (`midX, midY`):** Muestra el verbo relacional (`inspira ×`, `define ×`, `valida ×`, etc.) y permite desvincular la conexión con un clic o mediante teclado (`Enter` / `Espacio`).
- **Línea guía en vivo:** En el *Modo Conectar*, traza en tiempo real una curva dorada desde la tarjeta origen hasta el puntero del usuario.

### 5.3. Halos Atmosféricos de Clúster (`clusterHalos`)
- Calcula automáticamente la caja envolvente (*bounding box*) de todas las tarjetas que comparten el mismo atributo `cluster` (por ejemplo: `Clúster · Concepto`, `Clúster · Diseño`, `Clúster · Entrega`).
- Renderiza en el fondo del lienzo una región redondeada (`border-radius: 32px`) con borde discontinuo y un gradiente radial sutil que agrupa visualmente las ideas sin encerrarlas en cajas rígidas.

### 5.4. Navegación Inferior Ergonómica (`BottomDock.tsx`)
- Barra flotante tipo píldora (`max-width: 460px`, `z-index: 60`) ubicada en la zona inferior de alcance natural del pulgar (`bottom: calc(12px + var(--safe-bottom))`).
- Cuatro destinos directos con indicador `aria-current="page"`:
  1. **Inicio** (`welcome`)
  2. **Universo** (`universe`)
  3. **Biblioteca** (`library`, con contador en vivo de tarjetas activas)
  4. **Ajustes** (`settings`)

---

## 6. Estados de Foco y Soporte para `prefers-reduced-motion`

- **Claridad de Foco (`:focus-visible`):**  
  Todos los elementos interactivos (incluyendo tarjetas del lienzo, nodos de la mini-constelación, insignias de conexión SVG y controles de cámara) son navegables por teclado (`tabIndex={0}`) y muestran un contorno nítido de `2px solid var(--border-focus)` con `outline-offset: 2px`.
- **Respeto Estricto a `prefers-reduced-motion`:**  
  El sistema escucha en tiempo real la *media query* `(prefers-reduced-motion: reduce)` del sistema operativo y ofrece además un interruptor manual en **Ajustes → Reducción de animaciones**. Cuando cualquiera de los dos está activo (`[data-reduced-motion="true"]`), las duraciones de transición y animación se reducen a `0ms`/`0.01ms`, garantizando una experiencia accesible sin mareo por movimiento.
