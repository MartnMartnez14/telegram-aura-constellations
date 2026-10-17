import type {
  AuraCard,
  AuraConnection,
  AuraSettings,
  CardColor,
  CardStatus,
  CardType,
  Constellation,
} from '../types/aura';

const DEMO_TIMESTAMP = '2026-10-15T10:30:00.000Z';

export const DEFAULT_AURA_SETTINGS: AuraSettings = {
  theme: 'night',
  reducedMotion: false,
  performanceMode: false,
  showGrid: true,
  showClusterHalos: true,
  hasSeenWelcome: false,
  tmaPreviewFrame: false,
};

export const DEMO_CONSTELLATIONS: Constellation[] = [
  {
    id: 'const-creative-studio',
    name: 'Creative Studio',
    description:
      'Dirección de arte, identidad interactiva y referencias de producto para lanzamiento en Telegram.',
    icon: 'sparkles',
    accentColor: 'amethyst',
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  },
  {
    id: 'const-learning-universe',
    name: 'Learning Universe',
    description:
      'Red personal de conocimientos sobre Inteligencia Artificial, sistemas distribuidos y aprendizaje continuo.',
    icon: 'compass',
    accentColor: 'sage',
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  },
  {
    id: 'const-daily-life',
    name: 'Daily Life',
    description:
      'Organización serena de proyectos personales, lecturas, bienestar y recordatorios semanales.',
    icon: 'sun',
    accentColor: 'gold',
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  },
];

export const DEMO_CARDS: AuraCard[] = [
  // =========================================================================
  // 1) CREATIVE STUDIO (6 cards)
  // =========================================================================
  {
    id: 'card-cs-manifesto',
    constellationId: 'const-creative-studio',
    title: 'Manifiesto Visual: Observatorio Silencioso',
    content:
      'Un espacio táctil donde cada mensaje e idea gravita con calma. Menos ruido de notificaciones, más claridad espacial y pensamiento conectado.',
    notes:
      'Principio rector: priorizar jerarquía tipográfica editorial, contraste WCAG AA y curvas geodésicas sutiles.',
    type: 'idea',
    color: 'amethyst',
    status: 'active',
    tags: ['visón', 'manifiesto', 'ux'],
    favorite: true,
    cluster: 'Concepto',
    position: { x: 80, y: 120 },
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  },
  {
    id: 'card-cs-elena-feedback',
    constellationId: 'const-creative-studio',
    title: 'Nota de @elena_design sobre micro-transiciones',
    content:
      '«Si las tarjetas responden con inercia suave de 220ms al soltar el gesto táctil, el lienzo se siente como cristal físico sobre una mesa de luz.»',
    notes:
      'Extraído de la revisión semanal del sistema de diseño. Aplicar curva cubic-bezier(0.22, 1, 0.36, 1).',
    type: 'message',
    color: 'gold',
    status: 'active',
    tags: ['feedback', 'telegram', 'motion'],
    favorite: false,
    cluster: 'Concepto',
    telegramMeta: {
      chatName: 'Design Systems TG',
      author: '@elena_design',
      messageId: '4821',
      forwardedAt: 'Ayer, 18:42',
    },
    position: { x: 380, y: 120 },
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  },
  {
    id: 'card-cs-tma-docs',
    constellationId: 'const-creative-studio',
    title: 'Especificación Oficial Telegram Mini Apps 8.0+',
    content:
      'Guía de integración de ThemeParams, SafeAreaInset, MainButton, HapticFeedback y almacenamiento persistente en clientes móviles y desktop.',
    notes:
      'Verificar siempre fallback elegante cuando window.Telegram.WebApp se ejecuta en navegador externo.',
    type: 'link',
    color: 'sage',
    status: 'active',
    tags: ['docs', 'tma', 'api'],
    favorite: false,
    cluster: 'Diseño',
    sourceUrl: 'https://core.telegram.org/bots/webapps',
    position: { x: 740, y: 120 },
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  },
  {
    id: 'card-cs-palette-ref',
    constellationId: 'const-creative-studio',
    title: 'Paleta Midnight Amethyst & Cristal Esmerilado',
    content:
      'Combinación de fondos abisales (#10121D) con acentos amatista (#A997DF), oro champán (#D9BC80) y modo diurno Pearl Lavender (#F7F5F1).',
    notes:
      'Todos los pares texto/fondo verificados para lectura prolongada sin fatiga ocular en pantallas OLED.',
    type: 'reference',
    color: 'amethyst',
    status: 'active',
    tags: ['color', 'wcag', 'glass'],
    favorite: false,
    cluster: 'Diseño',
    position: { x: 1040, y: 120 },
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  },
  {
    id: 'card-cs-geodesic-engine',
    constellationId: 'const-creative-studio',
    title: 'Motor de curvas geodésicas a 60 FPS',
    content:
      'Renderizado vectorial SVG de conexiones cuadráticas con partículas orbitales desactivables en modo rendimiento o movimiento reducido.',
    notes:
      'Probado con más de 100 tarjetas simultáneas en distribución de espiral áurea sin caída de fotogramas.',
    type: 'idea',
    color: 'gold',
    status: 'completed',
    tags: ['canvas', 'svg', 'rendimiento'],
    favorite: false,
    cluster: 'Entrega',
    position: { x: 380, y: 430 },
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  },
  {
    id: 'card-cs-video-task',
    constellationId: 'const-creative-studio',
    title: 'Grabar prototipo en vivo de 60s para @designers',
    content:
      'Mostrar flujo completo: bienvenida animada, creación rápida desde mensaje de Telegram, trazado de conexiones, cambio a tema Día y exportación JSON.',
    notes:
      'Activar el marco TMA Preview (390px) durante la mitad del video para evidenciar ergonomía móvil.',
    type: 'task',
    color: 'coral',
    status: 'pending',
    tags: ['video', 'entrega', 'prioridad'],
    favorite: true,
    cluster: 'Entrega',
    position: { x: 740, y: 430 },
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  },

  // =========================================================================
  // 2) LEARNING UNIVERSE (6 cards)
  // =========================================================================
  {
    id: 'card-lu-knowledge-graphs',
    constellationId: 'const-learning-universe',
    title: 'Arquitectura de Grafos de Conocimiento',
    content:
      'Modelado de nodos semánticos bidireccionales donde el contexto emerge de las relaciones explícitas entre fragmentos breves de información.',
    notes:
      'Conectar conceptos atómicos permite recordar un 40% más rápido que en carpetas jerárquicas.',
    type: 'idea',
    color: 'sage',
    status: 'active',
    tags: ['grafos', 'semántica', 'arquitectura'],
    favorite: true,
    cluster: 'Fundamentos',
    position: { x: 150, y: 140 },
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  },
  {
    id: 'card-lu-spatial-memory-paper',
    constellationId: 'const-learning-universe',
    title: 'Paper sobre Memoria Espacial en Interfaces',
    content:
      'El hipocampo humano indexa ideas asociándolas a coordenadas visuales 2D. Mantener posiciones estables en el lienzo refuerza la recuperación cognitiva.',
    notes:
      'Referencia clave para justificar por qué las constelaciones superan al feed cronológico infinito.',
    type: 'reference',
    color: 'amethyst',
    status: 'active',
    tags: ['cognición', 'paper', 'espacial'],
    favorite: true,
    cluster: 'Fundamentos',
    sourceUrl: 'https://dl.acm.org/doi/10.1145/3544548',
    position: { x: 500, y: 130 },
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  },
  {
    id: 'card-lu-ai-channel-msg',
    constellationId: 'const-learning-universe',
    title: 'Conversación del canal @ai_research_daily',
    content:
      '«Los agentes locales combinados con bases vectoriales ligeras en el navegador permiten búsqueda semántica privada con latencia cero.»',
    notes:
      'Explorar indexación híbrida por etiquetas, clústeres y coincidencias de texto en cliente.',
    type: 'message',
    color: 'gold',
    status: 'active',
    tags: ['ia', 'local-first', 'telegram'],
    favorite: false,
    cluster: 'Investigación IA',
    telegramMeta: {
      chatName: 'AI Research Daily',
      author: '@ai_research_daily',
      messageId: '19042',
      forwardedAt: 'Hace 3 días',
    },
    position: { x: 840, y: 160 },
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  },
  {
    id: 'card-lu-fastapi-hmac',
    constellationId: 'const-learning-universe',
    title: 'Apunte de FastAPI + HMAC-SHA256',
    content:
      'Validación criptográfica de initData en Telegram Mini Apps derivando la clave secreta con WebAppData y comparando firmas en tiempo constante.',
    notes:
      'Fórmula: HMAC_SHA256(data_check_string, HMAC_SHA256("WebAppData", bot_token)).',
    type: 'reference',
    color: 'sage',
    status: 'completed',
    tags: ['seguridad', 'fastapi', 'hmac'],
    favorite: false,
    cluster: 'Ingeniería',
    sourceUrl: 'https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app',
    position: { x: 190, y: 440 },
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  },
  {
    id: 'card-lu-react-indexeddb',
    constellationId: 'const-learning-universe',
    title: 'Resumen de Patrones React + IndexedDB',
    content:
      'Sincronización optimista en memoria con transacciones atómicas en IndexedDB y validación estricta de esquemas Zod al importar respaldos.',
    notes:
      'Garantiza integridad referencial al eliminar tarjetas o constelaciones en cascada.',
    type: 'link',
    color: 'amethyst',
    status: 'active',
    tags: ['react', 'indexeddb', 'zod'],
    favorite: false,
    cluster: 'Ingeniería',
    sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API',
    position: { x: 520, y: 460 },
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  },
  {
    id: 'card-lu-webgl-shaders',
    constellationId: 'const-learning-universe',
    title: 'Curso pendiente de WebGL/SVG Shaders',
    content:
      'Estudiar técnicas de halos gaussianos suaves, campos estelares procedurales y optimización de capas aceleradas por GPU.',
    notes:
      'Reservar dos bloques de 45 minutos el próximo sábado por la mañana.',
    type: 'task',
    color: 'coral',
    status: 'pending',
    tags: ['shaders', 'svg', 'estudio'],
    favorite: false,
    cluster: 'Investigación IA',
    position: { x: 860, y: 440 },
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  },

  // =========================================================================
  // 3) DAILY LIFE (5 cards)
  // =========================================================================
  {
    id: 'card-dl-morning-ritual',
    constellationId: 'const-daily-life',
    title: 'Ritual de enfoque matutino',
    content:
      '20 minutos sin pantallas al despertar, café filtrado, revisión tranquila de prioridades en la constelación del día y bloque de trabajo profundo.',
    notes:
      'Mantener el teléfono en modo silencio hasta completar la primera tarea clave.',
    type: 'idea',
    color: 'gold',
    status: 'active',
    tags: ['hábitos', 'calma', 'enfoque'],
    favorite: true,
    cluster: 'Bienestar',
    position: { x: 160, y: 160 },
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  },
  {
    id: 'card-dl-reading-list',
    constellationId: 'const-daily-life',
    title: 'Lista de lecturas de ciencia ficción y astronomía',
    content:
      '«La mano izquierda de la oscuridad» de Ursula K. Le Guin, «Cosmos» de Carl Sagan y «El problema de los tres cuerpos».',
    notes:
      'Lectura nocturna de 30 páginas en papel o tinta electrónica con luz cálida.',
    type: 'reference',
    color: 'amethyst',
    status: 'active',
    tags: ['libros', 'astronomía', 'lectura'],
    favorite: true,
    cluster: 'Cultura',
    position: { x: 520, y: 130 },
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  },
  {
    id: 'card-dl-observatory-trip',
    constellationId: 'const-daily-life',
    title: 'Escapada de fin de semana al observatorio',
    content:
      'Ruta de montaña hacia el pico astronómico durante la luna nueva. Llevar prismáticos 10x50, abrigo térmico y termo con infusión.',
    notes:
      'Cielo despejado previsto para el sábado a partir de las 22:00h.',
    type: 'link',
    color: 'sage',
    status: 'pending',
    tags: ['viaje', 'estrellas', 'naturaleza'],
    favorite: false,
    cluster: 'Planes',
    sourceUrl: 'https://es.wikipedia.org/wiki/Observatorio_astron%C3%B3mico',
    position: { x: 860, y: 200 },
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  },
  {
    id: 'card-dl-renew-domain',
    constellationId: 'const-daily-life',
    title: 'Recordatorio: renovar dominio personal',
    content:
      'Renovar registro anual del portafolio y verificar certificados DNS antes del viernes para evitar interrupciones en el correo.',
    notes:
      'Aprovechar para actualizar la sección de proyectos recientes.',
    type: 'task',
    color: 'coral',
    status: 'pending',
    tags: ['gestión', 'dominio', 'recordatorio'],
    favorite: false,
    cluster: 'Bienestar',
    position: { x: 260, y: 450 },
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  },
  {
    id: 'card-dl-family-gastro',
    constellationId: 'const-daily-life',
    title: 'Recomendación gastronómica guardada de chat familiar',
    content:
      '«El pequeño bistró botánico junto al jardín antiguo tiene menú de temporada y terraza silenciosa para el almuerzo del domingo.»',
    notes:
      'Reservar mesa para cuatro personas cerca del ventanal.',
    type: 'message',
    color: 'gold',
    status: 'active',
    tags: ['familia', 'gastronomía', 'domingo'],
    favorite: false,
    cluster: 'Planes',
    telegramMeta: {
      chatName: 'Familia & Planes',
      author: '@clara_m',
      messageId: '894',
      forwardedAt: 'Martes, 20:15',
    },
    position: { x: 670, y: 460 },
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  },
];

export const DEMO_CONNECTIONS: AuraConnection[] = [
  // 1) Creative Studio (6 connections)
  {
    id: 'conn-cs-1',
    constellationId: 'const-creative-studio',
    fromCardId: 'card-cs-manifesto',
    toCardId: 'card-cs-elena-feedback',
    label: 'inspira',
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
  },
  {
    id: 'conn-cs-2',
    constellationId: 'const-creative-studio',
    fromCardId: 'card-cs-manifesto',
    toCardId: 'card-cs-palette-ref',
    label: 'define',
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
  },
  {
    id: 'conn-cs-3',
    constellationId: 'const-creative-studio',
    fromCardId: 'card-cs-elena-feedback',
    toCardId: 'card-cs-geodesic-engine',
    label: 'valida',
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
  },
  {
    id: 'conn-cs-4',
    constellationId: 'const-creative-studio',
    fromCardId: 'card-cs-tma-docs',
    toCardId: 'card-cs-geodesic-engine',
    label: 'fundamenta',
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
  },
  {
    id: 'conn-cs-5',
    constellationId: 'const-creative-studio',
    fromCardId: 'card-cs-palette-ref',
    toCardId: 'card-cs-video-task',
    label: 'alimenta',
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
  },
  {
    id: 'conn-cs-6',
    constellationId: 'const-creative-studio',
    fromCardId: 'card-cs-geodesic-engine',
    toCardId: 'card-cs-video-task',
    label: 'cierra',
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
  },

  // 2) Learning Universe (5 connections)
  {
    id: 'conn-lu-1',
    constellationId: 'const-learning-universe',
    fromCardId: 'card-lu-knowledge-graphs',
    toCardId: 'card-lu-spatial-memory-paper',
    label: 'fundamenta',
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
  },
  {
    id: 'conn-lu-2',
    constellationId: 'const-learning-universe',
    fromCardId: 'card-lu-spatial-memory-paper',
    toCardId: 'card-lu-ai-channel-msg',
    label: 'amplía',
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
  },
  {
    id: 'conn-lu-3',
    constellationId: 'const-learning-universe',
    fromCardId: 'card-lu-knowledge-graphs',
    toCardId: 'card-lu-react-indexeddb',
    label: 'estructura',
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
  },
  {
    id: 'conn-lu-4',
    constellationId: 'const-learning-universe',
    fromCardId: 'card-lu-fastapi-hmac',
    toCardId: 'card-lu-react-indexeddb',
    label: 'protege',
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
  },
  {
    id: 'conn-lu-5',
    constellationId: 'const-learning-universe',
    fromCardId: 'card-lu-ai-channel-msg',
    toCardId: 'card-lu-webgl-shaders',
    label: 'visualiza',
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
  },

  // 3) Daily Life (4 connections)
  {
    id: 'conn-dl-1',
    constellationId: 'const-daily-life',
    fromCardId: 'card-dl-morning-ritual',
    toCardId: 'card-dl-reading-list',
    label: 'acompaña',
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
  },
  {
    id: 'conn-dl-2',
    constellationId: 'const-daily-life',
    fromCardId: 'card-dl-reading-list',
    toCardId: 'card-dl-observatory-trip',
    label: 'inspira',
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
  },
  {
    id: 'conn-dl-3',
    constellationId: 'const-daily-life',
    fromCardId: 'card-dl-morning-ritual',
    toCardId: 'card-dl-renew-domain',
    label: 'prioriza',
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
  },
  {
    id: 'conn-dl-4',
    constellationId: 'const-daily-life',
    fromCardId: 'card-dl-observatory-trip',
    toCardId: 'card-dl-family-gastro',
    label: 'culmina',
    isDemo: true,
    createdAt: DEMO_TIMESTAMP,
  },
];

export function getInitialDemoSeed(): {
  constellations: Constellation[];
  cards: AuraCard[];
  connections: AuraConnection[];
  settings: AuraSettings;
} {
  return {
    constellations: DEMO_CONSTELLATIONS.map((c) => ({ ...c })),
    cards: DEMO_CARDS.map((card) => ({
      ...card,
      tags: [...card.tags],
      position: { ...card.position },
      telegramMeta: card.telegramMeta ? { ...card.telegramMeta } : undefined,
    })),
    connections: DEMO_CONNECTIONS.map((conn) => ({ ...conn })),
    settings: { ...DEFAULT_AURA_SETTINGS },
  };
}

/**
 * Generates 105+ cards distributed along a golden spiral (phyllotaxis) with
 * sequential and radial connections for testing canvas rendering performance.
 */
export function generateStressTestCards(
  constellationId: string,
  count = 105
): { cards: AuraCard[]; connections: AuraConnection[] } {
  const safeCount = Math.max(1, Math.min(500, Math.floor(count)));
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.50776 degrees
  const centerX = 1200;
  const centerY = 900;
  const spacing = 115;

  const types: CardType[] = ['idea', 'message', 'link', 'task', 'reference'];
  const colors: CardColor[] = ['amethyst', 'gold', 'sage', 'coral', 'neutral'];
  const statuses: CardStatus[] = ['active', 'pending', 'completed'];
  const clusters = ['Núcleo', 'Órbita Interior', 'Borde Exterior', 'Nebulosa'];
  const now = new Date().toISOString();

  const cards: AuraCard[] = [];
  const connections: AuraConnection[] = [];

  for (let i = 0; i < safeCount; i++) {
    const radius = spacing * Math.sqrt(i + 1);
    const theta = i * goldenAngle;
    const x = Math.round(centerX + radius * Math.cos(theta));
    const y = Math.round(centerY + radius * Math.sin(theta));

    const type = types[i % types.length];
    const color = colors[i % colors.length];
    const status = statuses[i % statuses.length];
    const cluster = clusters[i % clusters.length];

    const cardId = `stress-card-${constellationId}-${i + 1}`;
    cards.push({
      id: cardId,
      constellationId,
      title: `Nodo Astronómico #${i + 1}`,
      content: `Fragmento sintético distribuido en espiral áurea (r=${Math.round(radius)}px) para verificación de fluidez a 60 FPS.`,
      notes: `Nodo generado para prueba de estrés con ${safeCount} tarjetas conectadas.`,
      type,
      color,
      status,
      tags: ['stress-test', cluster.toLowerCase().replace(/\s+/g, '-'), `n-${i + 1}`],
      favorite: i % 9 === 0,
      cluster,
      position: { x, y },
      isDemo: true,
      createdAt: now,
      updatedAt: now,
    });

    if (i > 0) {
      connections.push({
        id: `stress-conn-${constellationId}-${i}`,
        constellationId,
        fromCardId: cards[i - 1].id,
        toCardId: cardId,
        label: i % 5 === 0 ? 'órbita' : undefined,
        isDemo: true,
        createdAt: now,
      });
    }

    if (i >= 8 && i % 7 === 0) {
      connections.push({
        id: `stress-conn-radial-${constellationId}-${i}`,
        constellationId,
        fromCardId: cards[i - 8].id,
        toCardId: cardId,
        label: 'resonancia',
        isDemo: true,
        createdAt: now,
      });
    }
  }

  return { cards, connections };
}
