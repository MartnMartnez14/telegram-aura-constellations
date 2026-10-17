import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  AuraBackupPayload,
  AuraCard,
  AuraConnection,
  AuraSettings,
  CardColor,
  CardPosition,
  CardStatus,
  CardType,
  Constellation,
  ConstellationIcon,
  ScreenId,
  TelegramMeta,
} from '../types/aura';
import { DEFAULT_AURA_SETTINGS, generateStressTestCards } from '../services/demoSeed';
import {
  clearDemoDataOnly,
  deleteCard as deleteCardFromStorage,
  deleteConnection as deleteConnectionFromStorage,
  deleteConstellation as deleteConstellationFromStorage,
  importBackupData,
  initStorage,
  resetToFactoryDemo,
  saveCard,
  saveCardsBatch,
  saveConnection,
  saveConstellation,
  saveSettings,
} from '../services/storage';
import {
  sanitizeSafeUrl,
  sanitizeText,
  validateAndSanitizeBackup,
} from '../schemas/validation';
import {
  initTelegramMiniApp,
  syncTelegramColors,
  triggerHaptic,
  type TelegramEnvironmentState,
} from '../services/telegramBridge';

export interface ToastNotice {
  id: string;
  text: string;
  tone: 'info' | 'success' | 'warning' | 'error';
}

export interface CreateCardInput {
  constellationId?: string;
  title: string;
  content?: string;
  notes?: string;
  type?: CardType;
  color?: CardColor;
  status?: CardStatus;
  tags?: string[];
  favorite?: boolean;
  cluster?: string;
  sourceUrl?: string;
  telegramMeta?: TelegramMeta;
  position?: CardPosition;
}

export interface CreateConstellationInput {
  name: string;
  description?: string;
  icon?: ConstellationIcon;
  accentColor?: CardColor;
}

export interface AuraContextValue {
  isLoading: boolean;
  showSplash: boolean;
  currentScreen: ScreenId;
  constellations: Constellation[];
  activeConstellationId: string;
  activeConstellation: Constellation | undefined;
  cards: AuraCard[];
  activeCards: AuraCard[];
  connections: AuraConnection[];
  activeConnections: AuraConnection[];
  selectedCardId: string | null;
  selectedCard: AuraCard | undefined;
  connectingFromCardId: string | null;
  focusedCardId: string | null;
  searchQuery: string;
  activeTagFilter: string | null;
  activeTypeFilter: CardType | 'all';
  settings: AuraSettings;
  effectiveTheme: 'night' | 'day';
  effectiveReducedMotion: boolean;
  toastMessage: ToastNotice | null;
  telegramEnv: TelegramEnvironmentState;

  // Navigation & UI actions
  completeSplash: () => void;
  setCurrentScreen: (screen: ScreenId) => void;
  selectConstellation: (id: string) => void;
  selectCard: (cardId: string | null) => void;
  focusCardOnCanvas: (cardId: string) => void;
  clearFocusedCard: () => void;
  setSearchQuery: (query: string) => void;
  setActiveTagFilter: (tag: string | null) => void;
  setActiveTypeFilter: (type: CardType | 'all') => void;
  showToast: (text: string, tone?: ToastNotice['tone']) => void;
  dismissToast: () => void;

  // Constellation CRUD
  createConstellation: (input: CreateConstellationInput) => Promise<Constellation>;
  updateConstellation: (
    id: string,
    patch: Partial<Pick<Constellation, 'name' | 'description' | 'icon' | 'accentColor'>>
  ) => Promise<void>;
  removeConstellation: (id: string) => Promise<void>;

  // Card CRUD & Canvas Positioning
  createCard: (input: CreateCardInput) => Promise<AuraCard>;
  updateCard: (
    cardId: string,
    patch: Partial<
      Omit<AuraCard, 'id' | 'constellationId' | 'createdAt' | 'updatedAt'>
    >
  ) => Promise<void>;
  updateCardPosition: (cardId: string, position: CardPosition, persist?: boolean) => Promise<void>;
  toggleCardFavorite: (cardId: string) => Promise<void>;
  cycleCardStatus: (cardId: string, nextStatus?: CardStatus) => Promise<void>;
  removeCard: (cardId: string) => Promise<void>;

  // Connections
  startConnecting: (cardId: string | null) => void;
  completeConnection: (targetCardId: string, label?: string) => Promise<AuraConnection | null>;
  createConnectionDirect: (
    fromCardId: string,
    toCardId: string,
    label?: string
  ) => Promise<AuraConnection | null>;
  removeConnection: (connectionId: string) => Promise<void>;

  // Layout & Stress Testing
  autoArrangeActiveConstellation: () => Promise<void>;
  loadPerformanceTestConstellation: (count?: number) => Promise<void>;

  // Settings & Data Management
  updateSettings: (patch: Partial<AuraSettings>) => Promise<void>;
  exportBackupJson: () => string;
  importBackupJson: (
    rawJson: string,
    mode: 'merge' | 'replace'
  ) => Promise<{ ok: boolean; message: string }>;
  clearDemoData: () => Promise<void>;
  resetDemoData: () => Promise<void>;
  startGuidedDemo: () => Promise<void>;
}

const AuraContext = createContext<AuraContextValue | null>(null);

function generateId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}

export const AuraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [currentScreen, setCurrentScreenState] = useState<ScreenId>('welcome');

  const [constellations, setConstellations] = useState<Constellation[]>([]);
  const [activeConstellationId, setActiveConstellationId] = useState<string>('const-creative-studio');
  const [cards, setCards] = useState<AuraCard[]>([]);
  const [connections, setConnections] = useState<AuraConnection[]>([]);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [connectingFromCardId, setConnectingFromCardId] = useState<string | null>(null);
  const [focusedCardId, setFocusedCardId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [activeTypeFilter, setActiveTypeFilter] = useState<CardType | 'all'>('all');

  const [settings, setSettings] = useState<AuraSettings>(DEFAULT_AURA_SETTINGS);
  const [toastMessage, setToastMessage] = useState<ToastNotice | null>(null);
  const [telegramEnv, setTelegramEnv] = useState<TelegramEnvironmentState>(() =>
    initTelegramMiniApp()
  );
  const [systemPrefersLight, setSystemPrefersLight] = useState<boolean>(false);
  const [systemPrefersReducedMotion, setSystemPrefersReducedMotion] = useState<boolean>(false);

  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback(
    (text: string, tone: ToastNotice['tone'] = 'info') => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      const notice: ToastNotice = {
        id: generateId('toast'),
        text,
        tone,
      };
      setToastMessage(notice);
      toastTimerRef.current = window.setTimeout(() => {
        setToastMessage((prev) => (prev?.id === notice.id ? null : prev));
      }, 3400);
    },
    []
  );

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToastMessage(null);
  }, []);

  // Detect OS media queries
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const lightMql = window.matchMedia('(prefers-color-scheme: light)');
    const motionMql = window.matchMedia('(prefers-reduced-motion: reduce)');

    setSystemPrefersLight(lightMql.matches);
    setSystemPrefersReducedMotion(motionMql.matches);

    const onLightChange = (e: MediaQueryListEvent) => setSystemPrefersLight(e.matches);
    const onMotionChange = (e: MediaQueryListEvent) => setSystemPrefersReducedMotion(e.matches);

    lightMql.addEventListener?.('change', onLightChange);
    motionMql.addEventListener?.('change', onMotionChange);

    return () => {
      lightMql.removeEventListener?.('change', onLightChange);
      motionMql.removeEventListener?.('change', onMotionChange);
    };
  }, []);

  // Initialize IndexedDB & Telegram Bridge
  useEffect(() => {
    let mounted = true;
    const tgState = initTelegramMiniApp();
    setTelegramEnv(tgState);

    initStorage()
      .then((data) => {
        if (!mounted) return;
        setConstellations(data.constellations);
        setCards(data.cards);
        setConnections(data.connections);
        setSettings(data.settings);

        const initialConstId =
          data.constellations.find((c) => c.id === 'const-creative-studio')?.id ??
          data.constellations[0]?.id ??
          'const-creative-studio';
        setActiveConstellationId(initialConstId);

        if (data.settings.hasSeenWelcome) {
          setCurrentScreenState('universe');
        } else {
          setCurrentScreenState('welcome');
        }
        setIsLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const effectiveTheme: 'night' | 'day' = useMemo(() => {
    if (settings.theme === 'night' || settings.theme === 'day') {
      return settings.theme;
    }
    if (telegramEnv.colorScheme === 'light') return 'day';
    if (telegramEnv.colorScheme === 'dark') return 'night';
    return systemPrefersLight ? 'day' : 'night';
  }, [settings.theme, telegramEnv.colorScheme, systemPrefersLight]);

  const effectiveReducedMotion = settings.reducedMotion || systemPrefersReducedMotion;

  // Apply theme & reduced motion attributes to <html> and sync Telegram WebApp colors
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', effectiveTheme);
      document.documentElement.setAttribute(
        'data-reduced-motion',
        effectiveReducedMotion ? 'true' : 'false'
      );
    }
    syncTelegramColors(effectiveTheme);
  }, [effectiveTheme, effectiveReducedMotion]);

  const activeConstellation = useMemo(
    () => constellations.find((c) => c.id === activeConstellationId) ?? constellations[0],
    [constellations, activeConstellationId]
  );

  const activeCards = useMemo(
    () => cards.filter((c) => c.constellationId === (activeConstellation?.id ?? activeConstellationId)),
    [cards, activeConstellation, activeConstellationId]
  );

  const activeConnections = useMemo(
    () =>
      connections.filter(
        (conn) => conn.constellationId === (activeConstellation?.id ?? activeConstellationId)
      ),
    [connections, activeConstellation, activeConstellationId]
  );

  const selectedCard = useMemo(
    () => (selectedCardId ? cards.find((c) => c.id === selectedCardId) : undefined),
    [cards, selectedCardId]
  );

  const completeSplash = useCallback(() => {
    setShowSplash(false);
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<AuraSettings>) => {
      const next: AuraSettings = { ...settings, ...patch };
      setSettings(next);
      await saveSettings(next);
      triggerHaptic('light');
    },
    [settings]
  );

  const setCurrentScreen = useCallback(
    (screen: ScreenId) => {
      setCurrentScreenState(screen);
      if (screen !== 'welcome' && !settings.hasSeenWelcome) {
        const nextSettings = { ...settings, hasSeenWelcome: true };
        setSettings(nextSettings);
        void saveSettings(nextSettings);
      }
      triggerHaptic('light');
    },
    [settings]
  );

  const selectConstellation = useCallback((id: string) => {
    setActiveConstellationId(id);
    setSelectedCardId(null);
    setConnectingFromCardId(null);
    triggerHaptic('light');
  }, []);

  const selectCard = useCallback((cardId: string | null) => {
    setSelectedCardId(cardId);
    if (cardId) {
      triggerHaptic('light');
    }
  }, []);

  const focusCardOnCanvas = useCallback(
    (cardId: string) => {
      const target = cards.find((c) => c.id === cardId);
      if (!target) return;
      setActiveConstellationId(target.constellationId);
      setFocusedCardId(cardId);
      setSelectedCardId(null);
      setCurrentScreenState('universe');
      triggerHaptic('medium');
      showToast(`Centrando «${target.title}» en el lienzo`, 'info');
    },
    [cards, showToast]
  );

  const clearFocusedCard = useCallback(() => {
    setFocusedCardId(null);
  }, []);

  // Constellation CRUD
  const createConstellation = useCallback(
    async (input: CreateConstellationInput): Promise<Constellation> => {
      const now = new Date().toISOString();
      const newConstellation: Constellation = {
        id: generateId('const'),
        name: sanitizeText(input.name, 120) || 'Nueva Constelación',
        description: sanitizeText(input.description ?? '', 600),
        icon: input.icon || 'sparkles',
        accentColor: input.accentColor ?? 'amethyst',
        isDemo: false,
        createdAt: now,
        updatedAt: now,
      };

      await saveConstellation(newConstellation);
      setConstellations((prev) => [...prev, newConstellation]);
      setActiveConstellationId(newConstellation.id);
      setSelectedCardId(null);
      setConnectingFromCardId(null);
      triggerHaptic('success');
      showToast(`Constelación «${newConstellation.name}» creada`, 'success');
      return newConstellation;
    },
    [showToast]
  );

  const updateConstellation = useCallback(
    async (
      id: string,
      patch: Partial<Pick<Constellation, 'name' | 'description' | 'icon' | 'accentColor'>>
    ) => {
      const existing = constellations.find((c) => c.id === id);
      if (!existing) return;

      const updated: Constellation = {
        ...existing,
        name: patch.name !== undefined ? sanitizeText(patch.name, 120) || existing.name : existing.name,
        description:
          patch.description !== undefined
            ? sanitizeText(patch.description, 600)
            : existing.description,
        icon: patch.icon ?? existing.icon,
        accentColor: patch.accentColor ?? existing.accentColor,
        isDemo: false,
        updatedAt: new Date().toISOString(),
      };

      await saveConstellation(updated);
      setConstellations((prev) => prev.map((c) => (c.id === id ? updated : c)));
      triggerHaptic('success');
      showToast(`Constelación «${updated.name}» actualizada`, 'success');
    },
    [constellations, showToast]
  );

  const removeConstellation = useCallback(
    async (id: string) => {
      if (constellations.length <= 1) {
        showToast('Debes conservar al menos una constelación activa', 'warning');
        return;
      }
      const target = constellations.find((c) => c.id === id);
      await deleteConstellationFromStorage(id);

      const remaining = constellations.filter((c) => c.id !== id);
      setConstellations(remaining);
      setCards((prev) => prev.filter((card) => card.constellationId !== id));
      setConnections((prev) => prev.filter((conn) => conn.constellationId !== id));

      if (activeConstellationId === id && remaining.length > 0) {
        setActiveConstellationId(remaining[0].id);
      }
      setSelectedCardId(null);
      setConnectingFromCardId(null);
      triggerHaptic('warning');
      showToast(`Constelación «${target?.name ?? ''}» eliminada`, 'info');
    },
    [constellations, activeConstellationId, showToast]
  );

  // Card CRUD
  const createCard = useCallback(
    async (input: CreateCardInput): Promise<AuraCard> => {
      const targetConstId =
        input.constellationId ?? activeConstellation?.id ?? activeConstellationId;
      const existingInConst = cards.filter((c) => c.constellationId === targetConstId);

      // Smart automatic coordinates near the center/orbital ring if not provided
      let position: CardPosition;
      if (input.position) {
        position = {
          x: Math.round(input.position.x),
          y: Math.round(input.position.y),
        };
      } else {
        const index = existingInConst.length;
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const baseCenter =
          existingInConst.length > 0
            ? {
                x:
                  existingInConst.reduce((sum, c) => sum + c.position.x, 0) /
                  existingInConst.length,
                y:
                  existingInConst.reduce((sum, c) => sum + c.position.y, 0) /
                  existingInConst.length,
              }
            : { x: 460, y: 280 };
        const radius = 140 + (index % 6) * 48;
        const angle = index * goldenAngle;
        position = {
          x: Math.round(baseCenter.x + Math.cos(angle) * radius),
          y: Math.round(baseCenter.y + Math.sin(angle) * radius),
        };
      }

      const now = new Date().toISOString();
      const sanitizedTags = Array.from(
        new Set(
          (input.tags ?? [])
            .map((t) => sanitizeText(t.replace(/^#/, ''), 48).toLowerCase())
            .filter(Boolean)
        )
      );

      const newCard: AuraCard = {
        id: generateId('card'),
        constellationId: targetConstId,
        title: sanitizeText(input.title, 240) || 'Nueva idea',
        content: sanitizeText(input.content ?? '', 5000),
        notes: sanitizeText(input.notes ?? '', 5000),
        type: input.type ?? 'idea',
        color: input.color ?? activeConstellation?.accentColor ?? 'amethyst',
        status: input.status ?? 'active',
        tags: sanitizedTags,
        favorite: Boolean(input.favorite),
        cluster: input.cluster ? sanitizeText(input.cluster, 100) : undefined,
        sourceUrl: sanitizeSafeUrl(input.sourceUrl),
        telegramMeta: input.telegramMeta,
        position,
        isDemo: false,
        createdAt: now,
        updatedAt: now,
      };

      await saveCard(newCard);
      setCards((prev) => [...prev, newCard]);
      setFocusedCardId(newCard.id);
      triggerHaptic('success');
      showToast(`Tarjeta «${newCard.title}» añadida a la constelación`, 'success');
      return newCard;
    },
    [activeConstellation, activeConstellationId, cards, showToast]
  );

  const updateCard = useCallback(
    async (
      cardId: string,
      patch: Partial<Omit<AuraCard, 'id' | 'constellationId' | 'createdAt' | 'updatedAt'>>
    ) => {
      const existing = cards.find((c) => c.id === cardId);
      if (!existing) return;

      const updated: AuraCard = {
        ...existing,
        ...patch,
        title:
          patch.title !== undefined
            ? sanitizeText(patch.title, 240) || existing.title
            : existing.title,
        content:
          patch.content !== undefined ? sanitizeText(patch.content, 5000) : existing.content,
        notes: patch.notes !== undefined ? sanitizeText(patch.notes, 5000) : existing.notes,
        cluster:
          patch.cluster !== undefined
            ? sanitizeText(patch.cluster, 100) || undefined
            : existing.cluster,
        sourceUrl:
          patch.sourceUrl !== undefined ? sanitizeSafeUrl(patch.sourceUrl) : existing.sourceUrl,
        tags:
          patch.tags !== undefined
            ? Array.from(
                new Set(
                  patch.tags
                    .map((t) => sanitizeText(t.replace(/^#/, ''), 48).toLowerCase())
                    .filter(Boolean)
                )
              )
            : existing.tags,
        isDemo: false,
        updatedAt: new Date().toISOString(),
      };

      setCards((prev) => prev.map((c) => (c.id === cardId ? updated : c)));
      await saveCard(updated);
      triggerHaptic('light');
    },
    [cards]
  );

  const updateCardPosition = useCallback(
    async (cardId: string, position: CardPosition, persist = true) => {
      const roundedPos = {
        x: Math.round(position.x),
        y: Math.round(position.y),
      };

      let updatedCard: AuraCard | undefined;
      setCards((prev) =>
        prev.map((c) => {
          if (c.id !== cardId) return c;
          updatedCard = {
            ...c,
            position: roundedPos,
            updatedAt: new Date().toISOString(),
          };
          return updatedCard;
        })
      );

      if (persist) {
        const target = updatedCard ?? cards.find((c) => c.id === cardId);
        if (target) {
          await saveCard({
            ...target,
            position: roundedPos,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    },
    [cards]
  );

  const toggleCardFavorite = useCallback(
    async (cardId: string) => {
      const existing = cards.find((c) => c.id === cardId);
      if (!existing) return;
      const nextFav = !existing.favorite;
      await updateCard(cardId, { favorite: nextFav });
      triggerHaptic('light');
      showToast(
        nextFav ? 'Añadida a favoritos ★' : 'Quitada de favoritos',
        'info'
      );
    },
    [cards, updateCard, showToast]
  );

  const cycleCardStatus = useCallback(
    async (cardId: string, nextStatus?: CardStatus) => {
      const existing = cards.find((c) => c.id === cardId);
      if (!existing) return;
      const order: CardStatus[] = ['active', 'pending', 'completed'];
      const computedNext =
        nextStatus ?? order[(order.indexOf(existing.status) + 1) % order.length];
      await updateCard(cardId, { status: computedNext });
      triggerHaptic('light');
      const labels: Record<CardStatus, string> = {
        active: 'Estado: Activa',
        pending: 'Estado: Pendiente ⏳',
        completed: 'Estado: Completada ✓',
      };
      showToast(labels[computedNext], 'success');
    },
    [cards, updateCard, showToast]
  );

  const removeCard = useCallback(
    async (cardId: string) => {
      const target = cards.find((c) => c.id === cardId);
      await deleteCardFromStorage(cardId);
      setCards((prev) => prev.filter((c) => c.id !== cardId));
      setConnections((prev) =>
        prev.filter((conn) => conn.fromCardId !== cardId && conn.toCardId !== cardId)
      );
      if (selectedCardId === cardId) {
        setSelectedCardId(null);
      }
      if (connectingFromCardId === cardId) {
        setConnectingFromCardId(null);
      }
      triggerHaptic('warning');
      showToast(`Tarjeta «${target?.title ?? ''}» eliminada`, 'info');
    },
    [cards, selectedCardId, connectingFromCardId, showToast]
  );

  // Connections
  const startConnecting = useCallback(
    (cardId: string | null) => {
      setConnectingFromCardId(cardId);
      triggerHaptic('light');
      if (cardId) {
        const source = cards.find((c) => c.id === cardId);
        showToast(
          `Modo conectar activo desde «${source?.title ?? 'tarjeta'}». Tocá otra tarjeta.`,
          'info'
        );
      }
    },
    [cards, showToast]
  );

  const createConnectionDirect = useCallback(
    async (
      fromCardId: string,
      toCardId: string,
      label?: string
    ): Promise<AuraConnection | null> => {
      if (fromCardId === toCardId) {
        showToast('Elegí una tarjeta distinta para crear una conexión', 'warning');
        return null;
      }
      const fromCard = cards.find((c) => c.id === fromCardId);
      const toCard = cards.find((c) => c.id === toCardId);
      if (!fromCard || !toCard) return null;

      const newConn: AuraConnection = {
        id: generateId('conn'),
        constellationId: fromCard.constellationId,
        fromCardId,
        toCardId,
        label: label ? sanitizeText(label, 80) : 'conecta',
        isDemo: false,
        createdAt: new Date().toISOString(),
      };

      const saved = await saveConnection(newConn);
      if (!saved) return null;

      setConnections((prev) => {
        const exists = prev.some((c) => c.id === saved.id);
        return exists ? prev.map((c) => (c.id === saved.id ? saved : c)) : [...prev, saved];
      });

      triggerHaptic('success');
      showToast(`Conexión trazada con «${toCard.title}»`, 'success');
      return saved;
    },
    [cards, showToast]
  );

  const completeConnection = useCallback(
    async (targetCardId: string, label?: string): Promise<AuraConnection | null> => {
      if (!connectingFromCardId) return null;
      if (connectingFromCardId === targetCardId) {
        setConnectingFromCardId(null);
        return null;
      }
      const res = await createConnectionDirect(connectingFromCardId, targetCardId, label);
      setConnectingFromCardId(null);
      return res;
    },
    [connectingFromCardId, createConnectionDirect]
  );

  const removeConnection = useCallback(
    async (connectionId: string) => {
      await deleteConnectionFromStorage(connectionId);
      setConnections((prev) => prev.filter((c) => c.id !== connectionId));
      triggerHaptic('light');
      showToast('Conexión eliminada', 'info');
    },
    [showToast]
  );

  // Harmonic constellation auto-arrangement (clusters & orbital geometry)
  const autoArrangeActiveConstellation = useCallback(async () => {
    if (activeCards.length === 0) return;

    const clusterGroups = new Map<string, AuraCard[]>();
    for (const card of activeCards) {
      const key = card.cluster?.trim() || 'General';
      const group = clusterGroups.get(key) ?? [];
      group.push(card);
      clusterGroups.set(key, group);
    }

    const now = new Date().toISOString();
    const updatedBatch: AuraCard[] = [];
    const groupEntries = Array.from(clusterGroups.entries());

    if (groupEntries.length <= 1 || activeCards.length <= 7) {
      // Harmonious elliptical constellation layout
      const centerX = 520;
      const centerY = 300;
      const count = activeCards.length;
      activeCards.forEach((card, idx) => {
        if (idx === 0 && count > 3) {
          updatedBatch.push({
            ...card,
            position: { x: centerX, y: centerY },
            updatedAt: now,
          });
        } else {
          const ringIndex = count > 3 ? idx - 1 : idx;
          const ringTotal = count > 3 ? count - 1 : count;
          const angle = (ringIndex / Math.max(1, ringTotal)) * Math.PI * 2 - Math.PI / 2;
          const rx = 340;
          const ry = 220;
          updatedBatch.push({
            ...card,
            position: {
              x: Math.round(centerX + Math.cos(angle) * rx),
              y: Math.round(centerY + Math.sin(angle) * ry),
            },
            updatedAt: now,
          });
        }
      });
    } else {
      // Multi-cluster orbital layout
      const globalCenterX = 560;
      const globalCenterY = 340;
      const clusterRadius = Math.min(440, 220 + groupEntries.length * 45);

      groupEntries.forEach(([, groupCards], groupIdx) => {
        const groupAngle =
          (groupIdx / groupEntries.length) * Math.PI * 2 - Math.PI / 2;
        const cx = globalCenterX + Math.cos(groupAngle) * clusterRadius;
        const cy = globalCenterY + Math.sin(groupAngle) * (clusterRadius * 0.72);

        groupCards.forEach((card, cardIdx) => {
          if (groupCards.length === 1) {
            updatedBatch.push({
              ...card,
              position: { x: Math.round(cx), y: Math.round(cy) },
              updatedAt: now,
            });
          } else {
            const localAngle = (cardIdx / groupCards.length) * Math.PI * 2;
            const localR = 135 + Math.floor(cardIdx / 6) * 95;
            updatedBatch.push({
              ...card,
              position: {
                x: Math.round(cx + Math.cos(localAngle) * localR),
                y: Math.round(cy + Math.sin(localAngle) * localR),
              },
              updatedAt: now,
            });
          }
        });
      });
    }

    await saveCardsBatch(updatedBatch);
    const updatedMap = new Map(updatedBatch.map((c) => [c.id, c]));
    setCards((prev) => prev.map((c) => updatedMap.get(c.id) ?? c));
    triggerHaptic('success');
    showToast('Constelación reorganizada en geometría armónica', 'success');
  }, [activeCards, showToast]);

  // Stress test generator (105+ cards)
  const loadPerformanceTestConstellation = useCallback(
    async (count = 105) => {
      const now = new Date().toISOString();
      const stressConstId = 'const-stress-observatory';
      const stressConst: Constellation = {
        id: stressConstId,
        name: `Stress Lab (${count} nodos)`,
        description: `Prueba en vivo de rendimiento en espiral áurea con ${count} tarjetas y conexiones vectoriales.`,
        icon: 'orbit',
        accentColor: 'gold',
        isDemo: true,
        createdAt: now,
        updatedAt: now,
      };

      const generated = generateStressTestCards(stressConstId, count);
      await saveConstellation(stressConst);
      await saveCardsBatch(generated.cards);
      for (const conn of generated.connections) {
        await saveConnection(conn);
      }

      setConstellations((prev) => {
        const filtered = prev.filter((c) => c.id !== stressConstId);
        return [...filtered, stressConst];
      });
      setCards((prev) => {
        const filtered = prev.filter((c) => c.constellationId !== stressConstId);
        return [...filtered, ...generated.cards];
      });
      setConnections((prev) => {
        const filtered = prev.filter((c) => c.constellationId !== stressConstId);
        return [...filtered, ...generated.connections];
      });

      setActiveConstellationId(stressConstId);
      setCurrentScreenState('universe');
      triggerHaptic('success');
      showToast(`Constelación de alto rendimiento cargada (${count} tarjetas)`, 'success');
    },
    [showToast]
  );

  // Backup Export / Import / Demo Reset
  const exportBackupJson = useCallback((): string => {
    const payload: AuraBackupPayload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      app: 'telegram-aura-constellations',
      constellations,
      cards,
      connections,
      settings,
    };
    triggerHaptic('success');
    return JSON.stringify(payload, null, 2);
  }, [constellations, cards, connections, settings]);

  const importBackupJson = useCallback(
    async (
      rawJson: string,
      mode: 'merge' | 'replace'
    ): Promise<{ ok: boolean; message: string }> => {
      const validation = validateAndSanitizeBackup(rawJson);
      if (!validation.success) {
        triggerHaptic('warning');
        showToast(validation.error, 'error');
        return { ok: false, message: validation.error };
      }

      const nextData = await importBackupData(validation.data, mode);
      setConstellations(nextData.constellations);
      setCards(nextData.cards);
      setConnections(nextData.connections);
      setSettings(nextData.settings);

      if (!nextData.constellations.some((c) => c.id === activeConstellationId)) {
        setActiveConstellationId(nextData.constellations[0]?.id ?? 'const-creative-studio');
      }

      const msg = `Respaldo importado (${validation.data.constellations.length} constelaciones, ${validation.data.cards.length} tarjetas)`;
      triggerHaptic('success');
      showToast(msg, 'success');
      return { ok: true, message: msg };
    },
    [activeConstellationId, showToast]
  );

  const clearDemoData = useCallback(async () => {
    const data = await clearDemoDataOnly();
    setConstellations(data.constellations);
    setCards(data.cards);
    setConnections(data.connections);
    setActiveConstellationId(data.constellations[0]?.id ?? 'const-mi-universo');
    setSelectedCardId(null);
    setConnectingFromCardId(null);
    triggerHaptic('warning');
    showToast('Datos de demostración eliminados. Tu espacio personal está limpio.', 'info');
  }, [showToast]);

  const resetDemoData = useCallback(async () => {
    const data = await resetToFactoryDemo();
    setConstellations(data.constellations);
    setCards(data.cards);
    setConnections(data.connections);
    setSettings(data.settings);
    setActiveConstellationId('const-creative-studio');
    setSelectedCardId(null);
    setConnectingFromCardId(null);
    triggerHaptic('success');
    showToast('Las 3 constelaciones de demostración originales fueron restauradas.', 'success');
  }, [showToast]);

  const startGuidedDemo = useCallback(async () => {
    const hasCreative = constellations.some((c) => c.id === 'const-creative-studio');
    if (!hasCreative) {
      const data = await resetToFactoryDemo();
      setConstellations(data.constellations);
      setCards(data.cards);
      setConnections(data.connections);
    }
    const nextSettings = { ...settings, hasSeenWelcome: true };
    setSettings(nextSettings);
    void saveSettings(nextSettings);
    setActiveConstellationId('const-creative-studio');
    setCurrentScreenState('universe');
    triggerHaptic('success');
    showToast(
      'Demostración guiada: arrastrá las tarjetas, tocá una para editarla o usá «Conectar».',
      'info'
    );
  }, [constellations, settings, showToast]);

  const value = useMemo<AuraContextValue>(
    () => ({
      isLoading,
      showSplash,
      currentScreen,
      constellations,
      activeConstellationId,
      activeConstellation,
      cards,
      activeCards,
      connections,
      activeConnections,
      selectedCardId,
      selectedCard,
      connectingFromCardId,
      focusedCardId,
      searchQuery,
      activeTagFilter,
      activeTypeFilter,
      settings,
      effectiveTheme,
      effectiveReducedMotion,
      toastMessage,
      telegramEnv,
      completeSplash,
      setCurrentScreen,
      selectConstellation,
      selectCard,
      focusCardOnCanvas,
      clearFocusedCard,
      setSearchQuery,
      setActiveTagFilter,
      setActiveTypeFilter,
      showToast,
      dismissToast,
      createConstellation,
      updateConstellation,
      removeConstellation,
      createCard,
      updateCard,
      updateCardPosition,
      toggleCardFavorite,
      cycleCardStatus,
      removeCard,
      startConnecting,
      completeConnection,
      createConnectionDirect,
      removeConnection,
      autoArrangeActiveConstellation,
      loadPerformanceTestConstellation,
      updateSettings,
      exportBackupJson,
      importBackupJson,
      clearDemoData,
      resetDemoData,
      startGuidedDemo,
    }),
    [
      isLoading,
      showSplash,
      currentScreen,
      constellations,
      activeConstellationId,
      activeConstellation,
      cards,
      activeCards,
      connections,
      activeConnections,
      selectedCardId,
      selectedCard,
      connectingFromCardId,
      focusedCardId,
      searchQuery,
      activeTagFilter,
      activeTypeFilter,
      settings,
      effectiveTheme,
      effectiveReducedMotion,
      toastMessage,
      telegramEnv,
      completeSplash,
      setCurrentScreen,
      selectConstellation,
      selectCard,
      focusCardOnCanvas,
      clearFocusedCard,
      showToast,
      dismissToast,
      createConstellation,
      updateConstellation,
      removeConstellation,
      createCard,
      updateCard,
      updateCardPosition,
      toggleCardFavorite,
      cycleCardStatus,
      removeCard,
      startConnecting,
      completeConnection,
      createConnectionDirect,
      removeConnection,
      autoArrangeActiveConstellation,
      loadPerformanceTestConstellation,
      updateSettings,
      exportBackupJson,
      importBackupJson,
      clearDemoData,
      resetDemoData,
      startGuidedDemo,
    ]
  );

  return <AuraContext.Provider value={value}>{children}</AuraContext.Provider>;
};

export function useAura(): AuraContextValue {
  const ctx = useContext(AuraContext);
  if (!ctx) {
    throw new Error('useAura debe utilizarse dentro de un AuraProvider');
  }
  return ctx;
}
