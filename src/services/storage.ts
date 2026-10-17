import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type {
  AuraBackupPayload,
  AuraCard,
  AuraConnection,
  AuraSettings,
  Constellation,
} from '../types/aura';
import { sanitizeFallbackStoreData } from '../schemas/validation';
import { DEFAULT_AURA_SETTINGS, getInitialDemoSeed } from './demoSeed';

const DB_NAME = 'telegram-aura-db';
const DB_VERSION = 1;
const SETTINGS_KEY = 'aura-user-settings';
const LOCAL_STORAGE_FALLBACK_KEY = 'telegram-aura-fallback-store-v1';

interface AuraDBSchema extends DBSchema {
  constellations: {
    key: string;
    value: Constellation;
  };
  cards: {
    key: string;
    value: AuraCard;
    indexes: { 'by-constellation': string };
  };
  connections: {
    key: string;
    value: AuraConnection;
    indexes: { 'by-constellation': string };
  };
  settings: {
    key: string;
    value: AuraSettings;
  };
}

interface MemoryStore {
  initialized: boolean;
  constellations: Map<string, Constellation>;
  cards: Map<string, AuraCard>;
  connections: Map<string, AuraConnection>;
  settings: AuraSettings;
}

const memoryStore: MemoryStore = {
  initialized: false,
  constellations: new Map(),
  cards: new Map(),
  connections: new Map(),
  settings: { ...DEFAULT_AURA_SETTINGS },
};

let dbPromise: Promise<IDBPDatabase<AuraDBSchema>> | null = null;
let lastIndexedDBRef: unknown = null;

function hasIndexedDBSupport(): boolean {
  return typeof globalThis !== 'undefined' && typeof globalThis.indexedDB !== 'undefined';
}

function getDB(): Promise<IDBPDatabase<AuraDBSchema>> | null {
  if (!hasIndexedDBSupport()) {
    return null;
  }

  // If tests replace globalThis.indexedDB (e.g. fake-indexeddb reset), re-open DB
  if (lastIndexedDBRef !== globalThis.indexedDB) {
    dbPromise = null;
    lastIndexedDBRef = globalThis.indexedDB;
  }

  if (!dbPromise) {
    dbPromise = openDB<AuraDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('constellations')) {
          db.createObjectStore('constellations', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cards')) {
          const cardStore = db.createObjectStore('cards', { keyPath: 'id' });
          cardStore.createIndex('by-constellation', 'constellationId');
        }
        if (!db.objectStoreNames.contains('connections')) {
          const connStore = db.createObjectStore('connections', { keyPath: 'id' });
          connStore.createIndex('by-constellation', 'constellationId');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    }).catch((err) => {
      dbPromise = null;
      throw err;
    });
  }

  return dbPromise;
}

function syncMemoryToLocalStorage(): void {
  try {
    if (typeof globalThis.localStorage === 'undefined') return;
    const serialized = JSON.stringify({
      constellations: Array.from(memoryStore.constellations.values()),
      cards: Array.from(memoryStore.cards.values()),
      connections: Array.from(memoryStore.connections.values()),
      settings: memoryStore.settings,
    });
    globalThis.localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, serialized);
  } catch {
    // Ignore storage quota or security errors in restricted environments
  }
}

function loadMemoryFromLocalStorage(): boolean {
  try {
    if (typeof globalThis.localStorage === 'undefined') return false;
    const raw = globalThis.localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
    if (!raw) return false;
    const parsed = sanitizeFallbackStoreData(raw);
    if (!parsed || parsed.constellations.length === 0) {
      return false;
    }
    memoryStore.constellations = new Map(parsed.constellations.map((c) => [c.id, c]));
    memoryStore.cards = new Map(parsed.cards.map((c) => [c.id, c]));
    memoryStore.connections = new Map(parsed.connections.map((c) => [c.id, c]));
    memoryStore.settings = { ...DEFAULT_AURA_SETTINGS, ...(parsed.settings ?? {}) };
    memoryStore.initialized = true;
    return true;
  } catch {
    return false;
  }
}

function isSamePair(aFrom: string, aTo: string, bFrom: string, bTo: string): boolean {
  return (aFrom === bFrom && aTo === bTo) || (aFrom === bTo && aTo === bFrom);
}

function createDefaultUserConstellation(): Constellation {
  const now = new Date().toISOString();
  return {
    id: 'const-mi-universo',
    name: 'Mi Universo',
    description: 'Espacio personal limpio para tus ideas, notas y mensajes conectados.',
    icon: 'orbit',
    accentColor: 'amethyst',
    isDemo: false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Initializes storage. If the database is empty for the first time,
 * seeds the 3 default demo constellations and default settings.
 */
export async function initStorage(): Promise<{
  constellations: Constellation[];
  cards: AuraCard[];
  connections: AuraConnection[];
  settings: AuraSettings;
}> {
  const dbConn = getDB();
  if (dbConn) {
    try {
      const db = await dbConn;
      const existingConstellations = await db.getAll('constellations');
      const existingSettings = await db.get('settings', SETTINGS_KEY);

      if (existingConstellations.length === 0) {
        const seed = getInitialDemoSeed();
        const tx = db.transaction(
          ['constellations', 'cards', 'connections', 'settings'],
          'readwrite'
        );
        for (const c of seed.constellations) {
          await tx.objectStore('constellations').put(c);
        }
        for (const card of seed.cards) {
          await tx.objectStore('cards').put(card);
        }
        for (const conn of seed.connections) {
          await tx.objectStore('connections').put(conn);
        }
        const mergedSettings = existingSettings
          ? { ...seed.settings, ...existingSettings }
          : seed.settings;
        await tx.objectStore('settings').put(mergedSettings, SETTINGS_KEY);
        await tx.done;

        return {
          constellations: seed.constellations,
          cards: seed.cards,
          connections: seed.connections,
          settings: mergedSettings,
        };
      }

      const [cards, connections] = await Promise.all([
        db.getAll('cards'),
        db.getAll('connections'),
      ]);
      const finalSettings = {
        ...DEFAULT_AURA_SETTINGS,
        ...(existingSettings ?? {}),
      };
      if (!existingSettings) {
        await db.put('settings', finalSettings, SETTINGS_KEY);
      }

      return {
        constellations: existingConstellations,
        cards,
        connections,
        settings: finalSettings,
      };
    } catch {
      // Fallback to in-memory/localStorage if IDB fails
    }
  }

  if (!memoryStore.initialized && !loadMemoryFromLocalStorage()) {
    const seed = getInitialDemoSeed();
    memoryStore.constellations = new Map(seed.constellations.map((c) => [c.id, c]));
    memoryStore.cards = new Map(seed.cards.map((c) => [c.id, c]));
    memoryStore.connections = new Map(seed.connections.map((c) => [c.id, c]));
    memoryStore.settings = { ...seed.settings };
    memoryStore.initialized = true;
    syncMemoryToLocalStorage();
  }

  return getAllData();
}

export async function getAllData(): Promise<{
  constellations: Constellation[];
  cards: AuraCard[];
  connections: AuraConnection[];
  settings: AuraSettings;
}> {
  const dbConn = getDB();
  if (dbConn) {
    try {
      const db = await dbConn;
      const [constellations, cards, connections, storedSettings] = await Promise.all([
        db.getAll('constellations'),
        db.getAll('cards'),
        db.getAll('connections'),
        db.get('settings', SETTINGS_KEY),
      ]);

      return {
        constellations,
        cards,
        connections,
        settings: {
          ...DEFAULT_AURA_SETTINGS,
          ...(storedSettings ?? {}),
        },
      };
    } catch {
      // Fallback to memory store
    }
  }

  return {
    constellations: Array.from(memoryStore.constellations.values()),
    cards: Array.from(memoryStore.cards.values()),
    connections: Array.from(memoryStore.connections.values()),
    settings: { ...memoryStore.settings },
  };
}

export async function saveConstellation(constellation: Constellation): Promise<Constellation> {
  const dbConn = getDB();
  if (dbConn) {
    try {
      const db = await dbConn;
      await db.put('constellations', constellation);
      return constellation;
    } catch {
      // Fallback
    }
  }

  memoryStore.constellations.set(constellation.id, constellation);
  syncMemoryToLocalStorage();
  return constellation;
}

/**
 * Deletes a constellation and cascades deletion to all associated cards and connections.
 */
export async function deleteConstellation(id: string): Promise<void> {
  const dbConn = getDB();
  if (dbConn) {
    try {
      const db = await dbConn;
      const tx = db.transaction(['constellations', 'cards', 'connections'], 'readwrite');
      await tx.objectStore('constellations').delete(id);

      const allCards = await tx.objectStore('cards').getAll();
      const deletedCardIds = new Set<string>();
      for (const card of allCards) {
        if (card.constellationId === id) {
          deletedCardIds.add(card.id);
          await tx.objectStore('cards').delete(card.id);
        }
      }

      const allConnections = await tx.objectStore('connections').getAll();
      for (const conn of allConnections) {
        if (
          conn.constellationId === id ||
          deletedCardIds.has(conn.fromCardId) ||
          deletedCardIds.has(conn.toCardId)
        ) {
          await tx.objectStore('connections').delete(conn.id);
        }
      }

      await tx.done;
      return;
    } catch {
      // Fallback
    }
  }

  memoryStore.constellations.delete(id);
  const removedCards = new Set<string>();
  for (const [cardId, card] of memoryStore.cards.entries()) {
    if (card.constellationId === id) {
      removedCards.add(cardId);
      memoryStore.cards.delete(cardId);
    }
  }
  for (const [connId, conn] of memoryStore.connections.entries()) {
    if (
      conn.constellationId === id ||
      removedCards.has(conn.fromCardId) ||
      removedCards.has(conn.toCardId)
    ) {
      memoryStore.connections.delete(connId);
    }
  }
  syncMemoryToLocalStorage();
}

export async function saveCard(card: AuraCard): Promise<AuraCard> {
  const dbConn = getDB();
  if (dbConn) {
    try {
      const db = await dbConn;
      await db.put('cards', card);
      return card;
    } catch {
      // Fallback
    }
  }

  memoryStore.cards.set(card.id, card);
  syncMemoryToLocalStorage();
  return card;
}

export async function saveCardsBatch(cards: AuraCard[]): Promise<AuraCard[]> {
  if (cards.length === 0) return [];

  const dbConn = getDB();
  if (dbConn) {
    try {
      const db = await dbConn;
      const tx = db.transaction('cards', 'readwrite');
      const store = tx.objectStore('cards');
      for (const card of cards) {
        await store.put(card);
      }
      await tx.done;
      return cards;
    } catch {
      // Fallback
    }
  }

  for (const card of cards) {
    memoryStore.cards.set(card.id, card);
  }
  syncMemoryToLocalStorage();
  return cards;
}

/**
 * Deletes a card and cascades deletion to all connections referencing it as fromCardId or toCardId.
 */
export async function deleteCard(cardId: string): Promise<void> {
  const dbConn = getDB();
  if (dbConn) {
    try {
      const db = await dbConn;
      const tx = db.transaction(['cards', 'connections'], 'readwrite');
      await tx.objectStore('cards').delete(cardId);

      const allConns = await tx.objectStore('connections').getAll();
      for (const conn of allConns) {
        if (conn.fromCardId === cardId || conn.toCardId === cardId) {
          await tx.objectStore('connections').delete(conn.id);
        }
      }
      await tx.done;
      return;
    } catch {
      // Fallback
    }
  }

  memoryStore.cards.delete(cardId);
  for (const [connId, conn] of memoryStore.connections.entries()) {
    if (conn.fromCardId === cardId || conn.toCardId === cardId) {
      memoryStore.connections.delete(connId);
    }
  }
  syncMemoryToLocalStorage();
}

/**
 * Saves a connection while preventing self-connections and duplicate links between the same pair of cards
 * in either direction.
 */
export async function saveConnection(
  connection: AuraConnection
): Promise<AuraConnection | null> {
  if (!connection.fromCardId || !connection.toCardId) {
    return null;
  }
  if (connection.fromCardId === connection.toCardId) {
    return null;
  }

  const dbConn = getDB();
  if (dbConn) {
    try {
      const db = await dbConn;
      const tx = db.transaction(['cards', 'connections'], 'readwrite');
      const fromCard = await tx.objectStore('cards').get(connection.fromCardId);
      const toCard = await tx.objectStore('cards').get(connection.toCardId);

      if (!fromCard || !toCard) {
        await tx.done;
        return null;
      }

      const existingConns = await tx.objectStore('connections').getAll();
      const duplicate = existingConns.find(
        (c) =>
          c.id !== connection.id &&
          c.constellationId === connection.constellationId &&
          isSamePair(c.fromCardId, c.toCardId, connection.fromCardId, connection.toCardId)
      );

      if (duplicate) {
        if (connection.label !== undefined && connection.label !== duplicate.label) {
          const updated = { ...duplicate, label: connection.label };
          await tx.objectStore('connections').put(updated);
          await tx.done;
          return updated;
        }
        await tx.done;
        return duplicate;
      }

      await tx.objectStore('connections').put(connection);
      await tx.done;
      return connection;
    } catch {
      // Fallback
    }
  }

  const fromCard = memoryStore.cards.get(connection.fromCardId);
  const toCard = memoryStore.cards.get(connection.toCardId);
  if (!fromCard || !toCard) {
    return null;
  }

  for (const existing of memoryStore.connections.values()) {
    if (
      existing.id !== connection.id &&
      existing.constellationId === connection.constellationId &&
      isSamePair(existing.fromCardId, existing.toCardId, connection.fromCardId, connection.toCardId)
    ) {
      if (connection.label !== undefined && connection.label !== existing.label) {
        const updated = { ...existing, label: connection.label };
        memoryStore.connections.set(existing.id, updated);
        syncMemoryToLocalStorage();
        return updated;
      }
      return existing;
    }
  }

  memoryStore.connections.set(connection.id, connection);
  syncMemoryToLocalStorage();
  return connection;
}

export async function deleteConnection(connectionId: string): Promise<void> {
  const dbConn = getDB();
  if (dbConn) {
    try {
      const db = await dbConn;
      await db.delete('connections', connectionId);
      return;
    } catch {
      // Fallback
    }
  }

  memoryStore.connections.delete(connectionId);
  syncMemoryToLocalStorage();
}

export async function saveSettings(settings: AuraSettings): Promise<AuraSettings> {
  const dbConn = getDB();
  if (dbConn) {
    try {
      const db = await dbConn;
      await db.put('settings', settings, SETTINGS_KEY);
      return settings;
    } catch {
      // Fallback
    }
  }

  memoryStore.settings = { ...settings };
  syncMemoryToLocalStorage();
  return settings;
}

/**
 * Removes only constellations, cards, and connections marked with `isDemo: true`,
 * keeping all user-created items intact. If no constellations remain, creates a clean
 * "Mi Universo" constellation so the app never enters an empty/broken state.
 */
export async function clearDemoDataOnly(): Promise<{
  constellations: Constellation[];
  cards: AuraCard[];
  connections: AuraConnection[];
  settings: AuraSettings;
}> {
  const dbConn = getDB();
  if (dbConn) {
    try {
      const db = await dbConn;
      const tx = db.transaction(['constellations', 'cards', 'connections'], 'readwrite');
      const constStore = tx.objectStore('constellations');
      const cardStore = tx.objectStore('cards');
      const connStore = tx.objectStore('connections');

      const allConstellations = await constStore.getAll();
      const remainingConstellationIds = new Set<string>();

      for (const c of allConstellations) {
        if (c.isDemo) {
          await constStore.delete(c.id);
        } else {
          remainingConstellationIds.add(c.id);
        }
      }

      if (remainingConstellationIds.size === 0) {
        const fallbackConst = createDefaultUserConstellation();
        await constStore.put(fallbackConst);
        remainingConstellationIds.add(fallbackConst.id);
      }

      const allCards = await cardStore.getAll();
      const remainingCardIds = new Set<string>();
      for (const card of allCards) {
        if (card.isDemo || !remainingConstellationIds.has(card.constellationId)) {
          await cardStore.delete(card.id);
        } else {
          remainingCardIds.add(card.id);
        }
      }

      const allConns = await connStore.getAll();
      for (const conn of allConns) {
        if (
          conn.isDemo ||
          !remainingConstellationIds.has(conn.constellationId) ||
          !remainingCardIds.has(conn.fromCardId) ||
          !remainingCardIds.has(conn.toCardId)
        ) {
          await connStore.delete(conn.id);
        }
      }

      await tx.done;
      return getAllData();
    } catch {
      // Fallback
    }
  }

  for (const [id, c] of memoryStore.constellations.entries()) {
    if (c.isDemo) {
      memoryStore.constellations.delete(id);
    }
  }
  if (memoryStore.constellations.size === 0) {
    const fallbackConst = createDefaultUserConstellation();
    memoryStore.constellations.set(fallbackConst.id, fallbackConst);
  }

  for (const [id, card] of memoryStore.cards.entries()) {
    if (card.isDemo || !memoryStore.constellations.has(card.constellationId)) {
      memoryStore.cards.delete(id);
    }
  }

  for (const [id, conn] of memoryStore.connections.entries()) {
    if (
      conn.isDemo ||
      !memoryStore.constellations.has(conn.constellationId) ||
      !memoryStore.cards.has(conn.fromCardId) ||
      !memoryStore.cards.has(conn.toCardId)
    ) {
      memoryStore.connections.delete(id);
    }
  }

  syncMemoryToLocalStorage();
  return getAllData();
}

/**
 * Clears all data and restores the 3 original factory demo constellations.
 */
export async function resetToFactoryDemo(): Promise<{
  constellations: Constellation[];
  cards: AuraCard[];
  connections: AuraConnection[];
  settings: AuraSettings;
}> {
  const seed = getInitialDemoSeed();

  const dbConn = getDB();
  if (dbConn) {
    try {
      const db = await dbConn;
      const tx = db.transaction(
        ['constellations', 'cards', 'connections', 'settings'],
        'readwrite'
      );
      await tx.objectStore('constellations').clear();
      await tx.objectStore('cards').clear();
      await tx.objectStore('connections').clear();

      for (const c of seed.constellations) {
        await tx.objectStore('constellations').put(c);
      }
      for (const card of seed.cards) {
        await tx.objectStore('cards').put(card);
      }
      for (const conn of seed.connections) {
        await tx.objectStore('connections').put(conn);
      }
      await tx.objectStore('settings').put(seed.settings, SETTINGS_KEY);
      await tx.done;

      return seed;
    } catch {
      // Fallback
    }
  }

  memoryStore.constellations = new Map(seed.constellations.map((c) => [c.id, c]));
  memoryStore.cards = new Map(seed.cards.map((c) => [c.id, c]));
  memoryStore.connections = new Map(seed.connections.map((c) => [c.id, c]));
  memoryStore.settings = { ...seed.settings };
  memoryStore.initialized = true;
  syncMemoryToLocalStorage();
  return seed;
}

/**
 * Imports a validated backup payload in either 'merge' or 'replace' mode while
 * enforcing full referential integrity across constellations, cards, and connections.
 */
export async function importBackupData(
  payload: AuraBackupPayload,
  mode: 'merge' | 'replace'
): Promise<{
  constellations: Constellation[];
  cards: AuraCard[];
  connections: AuraConnection[];
  settings: AuraSettings;
}> {
  const dbConn = getDB();
  if (dbConn) {
    try {
      const db = await dbConn;
      const tx = db.transaction(
        ['constellations', 'cards', 'connections', 'settings'],
        'readwrite'
      );
      const constStore = tx.objectStore('constellations');
      const cardStore = tx.objectStore('cards');
      const connStore = tx.objectStore('connections');
      const settingsStore = tx.objectStore('settings');

      if (mode === 'replace') {
        await constStore.clear();
        await cardStore.clear();
        await connStore.clear();
      }

      const validConstellationIds = new Set<string>();
      if (mode === 'merge') {
        const existingConsts = await constStore.getAll();
        for (const c of existingConsts) {
          validConstellationIds.add(c.id);
        }
      }

      for (const c of payload.constellations) {
        await constStore.put(c);
        validConstellationIds.add(c.id);
      }

      if (validConstellationIds.size === 0) {
        const fallback = createDefaultUserConstellation();
        await constStore.put(fallback);
        validConstellationIds.add(fallback.id);
      }

      const validCardMap = new Map<string, AuraCard>();
      if (mode === 'merge') {
        const existingCards = await cardStore.getAll();
        for (const card of existingCards) {
          if (validConstellationIds.has(card.constellationId)) {
            validCardMap.set(card.id, card);
          }
        }
      }

      for (const card of payload.cards) {
        if (validConstellationIds.has(card.constellationId)) {
          await cardStore.put(card);
          validCardMap.set(card.id, card);
        }
      }

      const existingConns = mode === 'merge' ? await connStore.getAll() : [];
      const seenPairs = new Set<string>();
      for (const conn of existingConns) {
        const pairKey = [conn.fromCardId, conn.toCardId].sort().join('::');
        seenPairs.add(`${conn.constellationId}::${pairKey}`);
      }

      for (const conn of payload.connections) {
        if (conn.fromCardId === conn.toCardId) continue;
        const fromCard = validCardMap.get(conn.fromCardId);
        const toCard = validCardMap.get(conn.toCardId);
        if (!fromCard || !toCard) continue;
        if (
          fromCard.constellationId !== conn.constellationId ||
          toCard.constellationId !== conn.constellationId
        ) {
          continue;
        }
        const pairKey = [conn.fromCardId, conn.toCardId].sort().join('::');
        const scopedKey = `${conn.constellationId}::${pairKey}`;
        if (seenPairs.has(scopedKey)) continue;
        seenPairs.add(scopedKey);
        await connStore.put(conn);
      }

      const currentSettings =
        (await settingsStore.get(SETTINGS_KEY)) ?? DEFAULT_AURA_SETTINGS;
      const nextSettings: AuraSettings = {
        ...DEFAULT_AURA_SETTINGS,
        ...currentSettings,
        ...(payload.settings ?? {}),
      };
      await settingsStore.put(nextSettings, SETTINGS_KEY);

      await tx.done;
      return getAllData();
    } catch {
      // Fallback
    }
  }

  if (mode === 'replace') {
    memoryStore.constellations.clear();
    memoryStore.cards.clear();
    memoryStore.connections.clear();
  }

  for (const c of payload.constellations) {
    memoryStore.constellations.set(c.id, c);
  }
  if (memoryStore.constellations.size === 0) {
    const fallback = createDefaultUserConstellation();
    memoryStore.constellations.set(fallback.id, fallback);
  }

  for (const card of payload.cards) {
    if (memoryStore.constellations.has(card.constellationId)) {
      memoryStore.cards.set(card.id, card);
    }
  }

  for (const conn of payload.connections) {
    if (conn.fromCardId === conn.toCardId) continue;
    const fromCard = memoryStore.cards.get(conn.fromCardId);
    const toCard = memoryStore.cards.get(conn.toCardId);
    if (!fromCard || !toCard) continue;
    if (
      fromCard.constellationId !== conn.constellationId ||
      toCard.constellationId !== conn.constellationId
    ) {
      continue;
    }
    const duplicate = Array.from(memoryStore.connections.values()).some(
      (existing) =>
        existing.constellationId === conn.constellationId &&
        isSamePair(existing.fromCardId, existing.toCardId, conn.fromCardId, conn.toCardId)
    );
    if (!duplicate) {
      memoryStore.connections.set(conn.id, conn);
    }
  }

  if (payload.settings) {
    memoryStore.settings = {
      ...memoryStore.settings,
      ...payload.settings,
    };
  }

  syncMemoryToLocalStorage();
  return getAllData();
}
