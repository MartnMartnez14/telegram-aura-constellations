# Arquitectura del Sistema — `ARCHITECTURE.md`

**Proyecto:** Telegram AURA — Constellations  
**Versión:** 1.0.0  
**Paradigma:** *Local-First Spatial Knowledge Graph* + Puente Criptográfico Telegram Mini App  

---

## 1. Organización Modular del Código

El repositorio está estructurado siguiendo una separación estricta de responsabilidades entre el modelo de dominio, la validación de esquemas, la capa de persistencia *local-first*, el estado reactivo, los componentes visuales y el puente backend opcional para Telegram Mini Apps:

```text
telegram-aura-constellations/
├── public/
│   └── aura-logo.svg                  # Emblema vectorial oficial (3 astros + arcos geodésicos)
├── src/
│   ├── types/
│   │   └── aura.ts                    # Contratos TypeScript: AuraCard, AuraConnection, Constellation, AuraSettings
│   ├── schemas/
│   │   └── validation.ts              # Esquemas Zod, sanitización anti-XSS, filtro URL y anti-Prototype Pollution
│   ├── services/
│   │   ├── storage.ts                 # Capa IndexedDB (idb) + fallback validado y borrado en cascada
│   │   ├── demoSeed.ts                # Semilla de las 3 constelaciones demo + generador de estrés (105+ nodos)
│   │   └── telegramBridge.ts          # Integración con window.Telegram.WebApp y parser inteligente de enlaces/mensajes
│   ├── state/
│   │   └── AuraContext.tsx            # Proveedor central de estado, CRUD reactivo, auto-organización y respaldos
│   ├── components/
│   │   ├── branding/
│   │   │   ├── AuraLogo.tsx           # Componente SVG parametrizable del símbolo AURA
│   │   │   └── IntroSplash.tsx        # Secuencia inaugural de 1.4s con botón Saltar y soporte reduced-motion
│   │   ├── canvas/
│   │   │   ├── UniverseCanvas.tsx     # Motor de lienzo 2D (pan, zoom, encuadre inteligente, captura rápida)
│   │   │   ├── ConstellationNode.tsx  # Nodo tarjeta memoizado con arrastre Pointer Events a 60 FPS
│   │   │   └── ConnectionLayer.tsx    # Capa SVG de curvas Bézier cúbicas e insignias interactivas
│   │   ├── navigation/
│   │   │   └── BottomDock.tsx         # Barra de navegación inferior ergonómica de 4 destinos
│   │   ├── modals/
│   │   │   └── ConstellationModal.tsx # Creación, edición y eliminación segura de constelaciones
│   │   └── views/
│   │       ├── WelcomeScreen.tsx      # Pantalla de bienvenida con mini-constelación interactiva en vivo
│   │       ├── LibraryView.tsx        # Biblioteca editorial con filtros multicriterio y agrupación por clúster
│   │       ├── CardDetailSheet.tsx    # Hoja de detalles, editor completo y gestor de conexiones en vivo
│   │       └── SettingsView.tsx       # Temas, accesibilidad, prueba de 105 nodos, marco TMA 390px y respaldos JSON
│   ├── styles/
│   │   ├── tokens.css                 # Tokens de diseño Midnight Amethyst (Night) y Pearl Lavender (Day)
│   │   └── globals.css                # Reset, superficies glassmorphism, animaciones y carcasa TMA 390px
│   ├── __tests__/
│   │   ├── unit/                      # Tests unitarios de validación Zod, seguridad y parser de Telegram
│   │   └── integration/               # Tests de integración de persistencia IndexedDB y cascada referencial
│   ├── App.tsx                        # Orquestador de vistas, modales, notificaciones toast y marco TMA
│   └── main.tsx                       # Punto de entrada React 19
├── backend_tma/                       # Puente opcional Python 3.12 + FastAPI + SQLite para Telegram Mini App
│   ├── app.py                         # Endpoints /health, /api/tma/verify, /api/bot/webhook y /api/tma/inbox
│   ├── telegram_auth.py               # Validador criptográfico oficial HMAC-SHA256 de initData
│   ├── db.py                          # Capa SQLite3 parametrizada (?) con sanitización estricta
│   ├── test_backend.py                # Suite unittest de seguridad criptográfica, anti-replay y SQLite
│   └── requirements.txt               # Dependencias opcionales del servidor FastAPI
├── e2e/
│   └── aura.spec.ts                   # Suite End-to-End en navegador real con Playwright Chromium
└── docs/screenshots/                  # Capturas reales verificadas en escritorio y móvil (390px)
```

---

## 2. Decisiones Técnicas Clave

### 2.1. Por qué se construyó un Motor de Lienzo Astronómico Propio en React + SVG Acelerado por Hardware
Para el corazón interactivo de **AURA** (`UniverseCanvas.tsx`, `ConstellationNode.tsx` y `ConnectionLayer.tsx`), se descartó deliberadamente el uso de librerías genéricas y pesadas de diagramas de flujo empresariales (como *React Flow*, *Cytoscape* o *JointJS*) por cuatro razones fundamentales de ingeniería y diseño:

1. **Estética Astronómica frente a Diagramas de Flujo:**  
   Las librerías de diagramas imponen puertos de entrada/salida rígidos y cajas de estilo industrial. El motor propio de AURA calcula **curvas Bézier cúbicas orgánicas** de centro a centro con curvatura adaptativa (`buildCubicBezierPath`) y renderiza **halos atmosféricos dinámicos** (`clusterHalos`) alrededor de las agrupaciones temáticas.
2. **Rendimiento a 60 FPS en Móvil y Escritorio (`translate3d` + `React.memo`):**  
   El plano del mundo (`4000×4000px`) se transforma mediante composición pura en GPU (`transform: translate3d(pan.x, pan.y, 0) scale(zoom)`). Cada tarjeta está envuelta en `React.memo` y gestiona su captura de puntero (`setPointerCapture`) actualizando el estado en memoria durante el arrastre (`persist = false`) y realizando una única escritura transaccional en `IndexedDB` al soltar (`onPointerUp`, `persist = true`).
3. **Encuadre Automático Consciente de la Interfaz (`fitCanvasToCards`):**  
   El motor calcula la caja envolvente real de la constelación (incluyendo los márgenes de los halos de clúster) y descuenta exactamente el espacio ocupado por la cabecera flotante, el `BottomDock` y la botonera lateral para encuadrar todas las tarjetas sin solapamientos tanto en `1440×900` como en viewports móviles de `390×844`.
4. **Modo de Alto Rendimiento y Prueba de Estrés de +105 Nodos:**  
   Al no arrastrar sobrecarga de un grafo externo pesado, el lienzo puede renderizar simultáneamente **105 tarjetas distribuidas en espiral áurea (*filotaxis*)** con sus conexiones vectoriales sin caídas de fotogramas.

---

### 2.2. Persistencia *Local-First* en `IndexedDB` con Integridad Referencial en Cascada y Fallback Validado
La capa de datos (`src/services/storage.ts`) sigue una arquitectura *Local-First* resiliente:

- **Esquema `IndexedDB` (`telegram-aura-db` v1):**
  - `constellations` (`keyPath: 'id'`)
  - `cards` (`keyPath: 'id'`, índice `'by-constellation'`)
  - `connections` (`keyPath: 'id'`, índice `'by-constellation'`)
  - `settings` (almacén clave-valor para preferencias del usuario)
- **Integridad Referencial en Cascada:**
  - **Al eliminar una tarjeta (`deleteCard`):** Se ejecuta una transacción atómica `readwrite` sobre `['cards', 'connections']` que borra la tarjeta y elimina inmediatamente toda conexión donde `fromCardId === cardId` o `toCardId === cardId`. Nunca quedan líneas huérfanas apuntando al vacío.
  - **Al eliminar una constelación (`deleteConstellation`):** Una transacción atómica sobre `['constellations', 'cards', 'connections']` elimina la constelación, todas sus tarjetas y todas sus conexiones.
  - **Prevención de duplicados y auto-enlaces (`saveConnection`):** Impide conectar una tarjeta consigo misma (`fromCardId === toCardId`) y evita crear conexiones duplicadas entre el mismo par de tarjetas en cualquier dirección (`A ↔ B`).
- **Fallback Transparente y Validado con `Zod`:**
  Si el navegador se ejecuta en un contexto restringido donde `IndexedDB` no está disponible, `storage.ts` conmuta automáticamente a un almacén en memoria respaldado por `localStorage`, validando siempre los datos al leerlos mediante `sanitizeFallbackStoreData` (esquema `Zod` + filtro anti-*Prototype Pollution*).

---

## 3. Evaluación Técnica Rigurosa de las 3 Modalidades

El proyecto aborda con total transparencia las tres modalidades posibles de integración con el ecosistema de Telegram:

### Modalidad 1: Demostración Web Funcional (100% Autónoma en el Navegador)
- **Cómo funciona:** Se inicia inmediatamente con `npm run dev` o desplegando la carpeta estática `dist/`. No depende de servidores externos ni requiere configurar un Bot Token para evaluar toda la experiencia.
- **Capacidades activas:**
  - Semilla inicial automática con las 3 constelaciones de ejemplo (`Creative Studio`, `Learning Universe`, `Daily Life`).
  - **Parser inteligente de Telegram en cliente (`parseTelegramInput`):** El usuario puede pegar cualquier enlace `https://t.me/canal/123` o texto reenviado (`Reenviado de @usuario: ...`) y el sistema extrae el autor, el canal, el tipo de tarjeta, el enlace limpio y las `#etiquetas`.
  - **Marco de vista previa Telegram Mini App (390px):** Permite alternar desde *Ajustes* una carcasa móvil de `390×844px` con cabecera simulada de Telegram para inspeccionar la ergonomía móvil desde un monitor de escritorio.

---

### Modalidad 2: Telegram Mini App Auténtica (`window.Telegram.WebApp` + `backend_tma/`)
- **Cómo funciona en el Frontend (`src/services/telegramBridge.ts`):**
  - Al iniciar, `initTelegramMiniApp()` inspecciona `window.Telegram?.WebApp`.
  - Si detecta el entorno de Telegram, invoca `webApp.ready()`, `webApp.expand()` y **`webApp.disableVerticalSwipes()`** (introducido en Bot API 7.7+ para evitar que el gesto vertical de arrastrar una tarjeta cierre accidentalmente la Mini App).
  - Lee `webApp.safeAreaInset` y actualiza las variables CSS `--safe-top`, `--safe-bottom`, `--safe-left` y `--safe-right`.
  - Sincroniza los colores del marco nativo de Telegram (`setHeaderColor` y `setBackgroundColor`) con `#10121D` en modo nocturno y `#F7F5F1` en modo diurno.
  - Dispara retroalimentación háptica nativa (`HapticFeedback.impactOccurred` y `notificationOccurred`) al seleccionar tarjetas, trazar conexiones o guardar cambios.
- **Cómo funciona en el Backend Opcional (`backend_tma/`):**
  - Construido en **Python 3.12 + FastAPI + SQLite3**.
  - **`POST /api/tma/verify`:** Recibe el `initData` crudo de la Mini App y verifica su autenticidad criptográfica usando `HMAC-SHA256` con la clave derivada `"WebAppData"` y el `TELEGRAM_BOT_TOKEN`, además de validar la ventana temporal de `auth_date` contra ataques de repetición (*replay attacks*).
  - **`POST /api/bot/webhook`:** Recibe actualizaciones del Bot oficial cuando un usuario **envía o reenvía voluntariamente** un mensaje a su Bot personal de AURA, verificando la cabecera `X-Telegram-Bot-Api-Secret-Token` en tiempo constante (`hmac.compare_digest`).
  - **`GET /api/tma/inbox`:** Devuelve a la Mini App verificada la bandeja de mensajes capturados para ese `telegram_user_id` específico.

---

### Modalidad 3: Viabilidad como Función Nativa dentro del Cliente de Telegram (Propuesta Conceptual sobre *Saved Messages* / TDLib)
Si el equipo central de Telegram decidiera incorporar **AURA — Constellations** como una funcionalidad nativa dentro de los clientes oficiales (Telegram iOS, Android, macOS, Desktop y WebK/WebZ), la arquitectura recomendada sería:

1. **Anclaje Natural en *Mensajes Guardados* (*Saved Messages*):**  
   En lugar de crear un chat nuevo, el perfil de *Mensajes Guardados* incorporaría una pestaña superior adicional junto a *Chat / Multimedia / Archivos / Enlaces*: **`✦ Constelaciones`**.
2. **Integración con TDLib (Telegram Database Library):**  
   - Las tarjetas vinculadas a mensajes reales almacenarían únicamente la referencia ligera `(chat_id, message_id)` junto con sus coordenadas espaciales `(x, y)`, color AURA, clúster y aristas `(from_id, to_id, label)` sincronizadas de extremo a extremo mediante el almacenamiento privado del usuario en TDLib.
   - Al tocar una tarjeta de tipo `message` en el lienzo nativo, el cliente podría previsualizar el mensaje original (incluyendo notas de voz, documentos o fotos) o saltar al contexto exacto del chat de origen sin duplicar archivos multimedia.
3. **Menú Contextual Nativo:**  
   Al mantener pulsado cualquier mensaje en cualquier conversación de Telegram, además de *Reenviar a Mensajes Guardados*, existiría la acción rápida **«Añadir a Constelación…»**, permitiendo elegir la constelación de destino y el color AURA en un solo gesto.
