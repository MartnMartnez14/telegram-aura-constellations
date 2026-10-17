<div align="center">

<img src="public/aura-logo.svg" alt="Telegram AURA — Constellations Logo" width="96" height="96" />

# Telegram AURA — Constellations

### *“Your ideas, connected.”* · *«Tus ideas, conectadas.»*

**A serene, interactive visual observatory to transform valuable Telegram messages, links, and notes into living constellations of knowledge.**  
*Un observatorio visual sereno e interactivo para transformar mensajes valiosos, enlaces y notas de Telegram en constelaciones vivas de conocimiento.*

<p align="center">
  <a href="#english-documentation"><strong>🌐 English Documentation</strong></a> ·
  <a href="#documentación-en-español"><strong>🇪🇸 Documentación en Español</strong></a> ·
  <a href="https://martnmartnez14.github.io/telegram-aura-constellations/"><strong>🚀 Live Interactive Demo (GitHub Pages)</strong></a>
</p>

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-A997DF?style=for-the-badge)](https://martnmartnez14.github.io/telegram-aura-constellations/)
[![MIT License](https://img.shields.io/badge/License-MIT-D9BC80?style=for-the-badge)](#license--licencia)
[![React 19](https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge)](#4-technology-stack)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge)](#4-technology-stack)
[![WCAG 2.2 AA](https://img.shields.io/badge/Accessibility-WCAG_2.2_AA-94BFB2?style=for-the-badge)](./DESIGN_SYSTEM.md)

</div>

---

<a id="english-documentation"></a>

# 🌐 English Documentation

## 1. Core Philosophy & Objectives
### Project status: one project, two repositories

**Prototype phase closed.** Telegram AURA remains available as a documented design experiment and interactive prototype, not a finished messaging product. This exploratory stage is concluded; further development and maintenance are not promised.

- **[Design Concept](https://github.com/MartnMartnez14/telegram-aura-design-concept)** — the original visual direction: a space-inspired interface concept for Telegram chats, messages, and personal ideas.
- **[Constellations](https://github.com/MartnMartnez14/telegram-aura-constellations)** — this repository: the interactive exploration of that vision through notes, cards, and connections on a spatial canvas.

Together they preserve the idea and its prototype. They are independent work, not an official Telegram product; the prototype does not implement the full chat interface shown in the design concept.

[`ROADMAP.md`](./ROADMAP.md) is retained as historical context and possible directions, not a commitment to future releases. Mind maps of temporary notes and further experiments with the chat visual style are possible independent continuations, not implemented or promised features. Anyone wishing to build on the work should first check the licensing terms for the relevant code and visual assets.

### Original motivation

Every day, some of our best ideas circulate through Telegram: technical discussions, design references, research links, voice note summaries, and personal reminders. Yet when we forward them to *Saved Messages*, they often get buried inside a chronological feed where relational context disappears.

**Telegram AURA — Constellations** is built around a simple premise:

> *The best technology is not the one that puts the most elements on screen, but the one that turns something complex into an extraordinarily simple experience.*

### Key Goals
1. **Cognitive Calm Over Feed Noise:** Replace endless vertical scrolling with a refined astronomical observatory (**Aura Design System**) featuring two complete themes: **Midnight Amethyst** (Night) and **Pearl Lavender** (Day).
2. **Spatial & Relational Memory:** Place interactive cards on a smooth 60 FPS 2D canvas, group them into thematic clusters with subtle halos, and draw **geodesic connection curves** (`inspires`, `depends on`, `validates`, `expands`, `connects`) that stay attached as cards move.
3. **Frictionless Telegram Capture:** Turn any `https://t.me/...` link, forwarded message (`Forwarded from @channel: ...`), or quick note with `#hashtags` into a structured star inside your constellation in seconds.
4. **Verifiable Local-First Privacy:** Keep all constellations, notes, and coordinates locally in the user's device via `IndexedDB` by default, with full JSON export/import validated by `Zod` schemas and zero telemetry or trackers.

---

## 2. Live Demo & Visual Gallery

🔗 **Try it directly in your browser (Mobile & Desktop):**  
👉 **[https://martnmartnez14.github.io/telegram-aura-constellations/](https://martnmartnez14.github.io/telegram-aura-constellations/)**

All screenshots below were captured directly from the running application (at `1440×900` desktop and `390×844` mobile Telegram Mini App resolutions):

### Welcome Screen & Live Mini-Constellation (`Midnight Amethyst`)
![Welcome Screen Night](docs/screenshots/01-welcome-night.png)

### Main Universe Canvas — Night Theme (`Midnight Amethyst`)
![Universe Night Desktop](docs/screenshots/02-universe-night-desktop.png)

### Main Universe Canvas — Day Theme (`Pearl Lavender`)
![Universe Day Desktop](docs/screenshots/03-universe-day-desktop.png)

### Mobile Viewport (`390×844`) — Telegram Mini App Ergonomics
<div align="center">
  <img src="docs/screenshots/04-mobile-390-universe.png" alt="Mobile 390px Universe View" width="360" />
</div>

### Structured Editorial Library (Search, Tags, Filters & Sorting)
![Library View](docs/screenshots/05-library-view.png)

### Card Detail Sheet & Live Connection Manager
![Card Detail Sheet](docs/screenshots/06-card-detail-sheet.png)

---

## 3. Implemented MVP Features (Zero Simulated Buttons)

Every visible button and control performs a real, verifiable, and persistent action:

1. **Create & Edit Constellations:** Create new workspaces, rename them, edit descriptions, and pick icons/accent colors.
2. **Create, Edit & Delete Cards:** Full support for title, main content, context notes, type (`idea`, `message`, `link`, `task`, `reference`), status (`active`, `pending`, `completed`), cluster group, AURA color (`amethyst`, `gold`, `sage`, `coral`, `neutral`), `#tags`, and safe external URLs.
3. **Free 60 FPS Drag & Drop:** Move cards freely across the canvas via native `Pointer Events` (touch & mouse) with automatic coordinate persistence in `IndexedDB`.
4. **Dynamic Geodesic Connections:** Connect cards either directly on the canvas (**Connect Mode** with live guide line) or from the **Card Detail Sheet**, and delete connections with a single tap/click.
5. **Cascade Referential Integrity:** Deleting a card or constellation automatically cleans up associated connections so no orphan edges ever remain.
6. **Three Rich Demo Constellations Preloaded:**
   - **`Creative Studio`** (6 cards, 6 connections): Art direction, `@elena_design` feedback, and Telegram Mini App launch tasks.
   - **`Learning Universe`** (6 cards, 5 connections): Knowledge graphs, spatial interfaces, AI notes, and HMAC security.
   - **`Daily Life`** (5 cards, 4 connections): Personal organization, reading lists, and reminders.
7. **Real-Time Search & Multi-Facet Filtering:** Search and filter by `#tags`, card type, favorites (`★`), pending tasks (`⏳`), and recent items both on the visual canvas and in the **Editorial Library**.
8. **Dual Accessible Themes:** Switch seamlessly between **Midnight Amethyst (Night)**, **Pearl Lavender (Day)**, and **Auto (System / Telegram `colorScheme`)**, with `prefers-reduced-motion` support.
9. **Validated JSON Backup (Export & Import):** Export your entire universe to a documented `.json` file and import backups in **Merge** or **Replace** mode, validated by `Zod` schemas (2 MB limit, anti-Prototype Pollution, safe URL whitelist).
10. **Telegram Mini App Preview Frame (390px) & 105-Card Stress Test:** Toggle a mobile Telegram Mini App frame directly from *Settings* for desktop demonstrations, or generate a 105-card golden-spiral constellation in one click to verify 60 FPS performance.

---

## 4. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI & State** | **React 19 + TypeScript (Strict)** | Modular component architecture and reactive state management. |
| **Build Tool** | **Vite 8** | Instant HMR development server and optimized static bundle. |
| **Canvas Engine** | **Custom React Pointer Events + SVG + CSS3 3D Hardware Transforms** | Bespoke astronomical canvas (`translate3d` / `scale`) without bloated diagramming dependencies. |
| **Local Persistence** | **IndexedDB (`idb`) + Validated Fallback** | Local-first transactional storage with cascade deletion. |
| **Schema Validation** | **Zod** | Strict JSON import validation, XSS text sanitization, and URL protocol whitelist (`https:`, `http:`, `tg:`). |
| **Optional TMA Backend** | **Python 3.12 + FastAPI + SQLite3** (`backend_tma/`) | Official `HMAC-SHA256` validation of `Telegram.WebApp.initData`, webhook secret verification, and parameterized inbox storage. |
| **Testing Suite** | **Vitest + fake-indexeddb + Playwright + Python `unittest`** | Unit, integration, cryptographic, and real headless Chrome E2E & visual tests. |

---

## 5. Quick Start: Installation, Execution & Testing

### Prerequisites
- **Node.js** `>= 20.x` and **npm** `>= 10.x`.
- **Python** `>= 3.10` (optional, only needed if running `backend_tma` tests or server).

### 5.1. Install & Run Locally
```bash
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 5.2. Production Build
```bash
npm run build
npm run preview
```

### 5.3. Run Automated Tests
```bash
# 1. Frontend Unit & Integration Tests (Vitest + fake-indexeddb)
npm test

# 2. End-to-End & Visual Suite in Real Headless Chrome (Playwright)
npx playwright test

# 3. Backend TMA Cryptographic & SQLite Security Tests (Python unittest)
python3 -m unittest discover -s backend_tma -p "test_*.py" -v
```

---

## 6. Telegram Integration & Technical Honesty (3 Modalities)

As detailed in [`ARCHITECTURE.md`](./ARCHITECTURE.md), this project clearly distinguishes between three execution modes:

1. **Functional Web Application (Standalone PWA/Web):** Runs immediately in any mobile or desktop browser (including GitHub Pages) with full `IndexedDB` persistence and zero external server requirements.
2. **Authentic Telegram Mini App (`window.Telegram.WebApp` + `backend_tma/`):** Integrates with Telegram's official WebApp SDK (`ready()`, `expand()`, `disableVerticalSwipes()`, `safeAreaInset`, `HapticFeedback`, `ThemeParams`) and includes an optional Python/FastAPI bridge (`backend_tma/`) that validates `initData` via `HMAC-SHA256` (`WebAppData`) and accepts voluntarily forwarded messages via Bot Webhook.
3. **Native Telegram Client Concept (Evaluation for `@designers`):** Evaluates how AURA's spatial UX can be implemented natively over *Saved Messages* using TDLib in official iOS/Android/Desktop clients.

> **Privacy & Bot API Boundaries:** In full compliance with Telegram's security model, AURA never claims hidden access to private chats. Content is added voluntarily by the user via direct input, pasted `t.me` links, or explicit forwarding to a companion bot.

---
---

<a id="documentación-en-español"></a>

# 🇪🇸 Documentación en Español

## 1. Filosofía Central y Objetivos
### Estado del proyecto: un proyecto, dos repositorios

**Etapa de prototipo cerrada.** Telegram AURA queda disponible como experimento de diseño documentado y prototipo interactivo, no como un producto de mensajería terminado. Esta etapa exploratoria se da por concluida; no se promete desarrollo ni mantenimiento futuro.

- **[Design Concept](https://github.com/MartnMartnez14/telegram-aura-design-concept)** — la dirección visual original: un concepto de interfaz de inspiración espacial para chats, mensajes e ideas personales en Telegram.
- **[Constellations](https://github.com/MartnMartnez14/telegram-aura-constellations)** — este repositorio: la exploración interactiva de esa visión mediante notas, tarjetas y conexiones en un lienzo espacial.

Juntos conservan la idea y su prototipo. Son un trabajo independiente, no un producto oficial de Telegram; el prototipo no implementa toda la interfaz de chats representada en el concepto de diseño.

[`ROADMAP.md`](./ROADMAP.md) se conserva como contexto histórico y posibles direcciones, no como un compromiso de futuras versiones. Los mapas mentales de notas temporales y nuevas exploraciones del estilo visual de los chats son posibles continuaciones independientes, no funciones implementadas ni prometidas. Quien quiera construir sobre este trabajo deberá revisar primero las condiciones de licencia del código y de los recursos visuales correspondientes.

### Motivación original

En Telegram circulan cada día algunas de nuestras mejores ideas: fragmentos de conversaciones técnicas, recomendaciones culturales, enlaces de investigación, notas y recordatorios personales. Sin embargo, cuando los enviamos a *Mensajes Guardados* (*Saved Messages*), terminan sepultados en un flujo cronológico infinito donde el contexto relacional desaparece.

**Telegram AURA — Constellations** nace con una premisa clara: **el pensamiento humano no es una lista vertical cronológica, sino una red espacial de asociaciones**.

### Objetivos del Proyecto
1. **Calma cognitiva frente al ruido:** Reemplazar la ansiedad del *feed* infinito por la serenidad de un observatorio astronómico contemporáneo (**Aura Design System**), con paleta *Midnight Amethyst* (Nocturno) y *Pearl Lavender* (Diurno).
2. **Memoria espacial real:** Permitir ubicar tarjetas en un lienzo 2D fluido a 60 FPS, agruparlas en clústeres temáticos con halos atmosféricos y trazar **curvas geodésicas de conexión** (`inspira`, `depende de`, `valida`, `amplía`, `conecta`) que revelan cómo dialogan las ideas entre sí.
3. **Captura sin fricción desde Telegram:** Convertir cualquier enlace `https://t.me/...`, mensaje reenviado (`Reenviado de @canal: ...`) o apunte rápido con `#etiquetas` en una estrella estructurada dentro de su constelación en segundos.
4. **Privacidad *Local-First* verificable:** Garantizar que todas las constelaciones, notas y coordenadas residan por defecto en el dispositivo del usuario mediante `IndexedDB`, con exportación e importación íntegra en JSON validado con `Zod` y cero telemetría.

---

## 2. Demo en Vivo y Características Principales

🔗 **Probar directamente en el navegador (GitHub Pages):**  
👉 **[https://martnmartnez14.github.io/telegram-aura-constellations/](https://martnmartnez14.github.io/telegram-aura-constellations/)**

El proyecto implementa de extremo a extremo las **15 capacidades obligatorias del MVP**, sin botones decorativos ni simulados:

1. **Crear, renombrar y eliminar constelaciones** con íconos y acentos cromáticos propios.
2. **Crear, editar y eliminar tarjetas** (con confirmación en 2 pasos y borrado en cascada de sus conexiones).
3. **Mover tarjetas libremente (Drag & Drop a 60 FPS)** mediante `Pointer Events` con guardado automático de coordenadas en `IndexedDB`.
4. **Conectar y desconectar tarjetas** con curvas Bézier dinámicas tanto en el lienzo (**Modo Conectar**) como desde la Hoja de Detalles.
5. **3 Constelaciones de demostración precargadas:** **`Creative Studio`**, **`Learning Universe`** y **`Daily Life`**.
6. **Búsqueda instantánea y filtrado multicriterio** por `#etiquetas`, tipo, favoritos (`★`), pendientes (`⏳`) y recientes tanto en el Lienzo como en la **Biblioteca Editorial**.
7. **Temas visuales duales:** **Nocturno (*Midnight Amethyst*)**, **Diurno (*Pearl Lavender*)** y **Automático**, respetando `prefers-reduced-motion`.
8. **Exportación e importación de respaldo JSON** validado con `Zod` en modos **Combinar (*Merge*)** o **Reemplazar (*Replace*)**.
9. **Marco de Vista Previa Telegram Mini App (390px)** y **Laboratorio de Estrés de 105 tarjetas** disponibles desde la pestaña *Ajustes*.

---

## 3. Instalación, Ejecución y Pruebas Locales

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo en http://localhost:5173
npm run dev

# 3. Ejecutar pruebas unitarias y de integración (Vitest)
npm test

# 4. Ejecutar pruebas E2E y visuales en Chrome Headless (Playwright)
npx playwright test

# 5. Ejecutar pruebas de seguridad del backend opcional TMA (Python unittest)
python3 -m unittest discover -s backend_tma -p "test_*.py" -v
```

---

## 4. Documentación Complementaria del Repositorio

- 📘 [**`DESIGN_SYSTEM.md`**](./DESIGN_SYSTEM.md): Paletas *Midnight Amethyst* y *Pearl Lavender*, ratios WCAG 2.2 AA, tipografía, símbolo SVG `AuraLogo` y componentes.
- 🏛️ [**`ARCHITECTURE.md`**](./ARCHITECTURE.md): Organización modular, motor de lienzo propio en React + SVG, persistencia en `IndexedDB` y evaluación de las 3 modalidades de integración con Telegram.
- 🗺️ [**`ROADMAP.md`**](./ROADMAP.md): Funciones terminadas del MVP v1.0, mejoras de Fase 2 (`CloudStorage`, exportación PNG/SVG) e ideas experimentales de Fase 3.
- 🛡️ [**`SECURITY.md`**](./SECURITY.md): Privacidad por diseño, prevención de XSS, validación Zod anti-*Prototype Pollution* y verificación criptográfica `HMAC-SHA256`.
- 🎬 [**`DEMO.md`**](./DEMO.md): Guía rápida de demostración y guion técnico de grabación en 7 escenas (60–90 segundos).

---

<a id="license--licencia"></a>

## License / Licencia

Distributed under the **[MIT License](./LICENSE)**. / Distribuido bajo la **[Licencia MIT](./LICENSE)**.
