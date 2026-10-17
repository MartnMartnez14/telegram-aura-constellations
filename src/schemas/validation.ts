import { z } from 'zod';
import type {
  AuraBackupPayload,
  AuraCard,
  AuraConnection,
  AuraSettings,
  Constellation,
} from '../types/aura';

export const MAX_BACKUP_BYTES = 2 * 1024 * 1024; // 2MB

const CONTROL_CHARS_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;

/**
 * Sanitizes text input by stripping dangerous control characters, normalizing whitespace,
 * and enforcing a maximum length while preserving plain text safely without HTML execution.
 */
export function sanitizeText(input: string, maxLength = 2000): string {
  if (typeof input !== 'string') {
    return '';
  }
  const cleaned = input
    .replace(CONTROL_CHARS_REGEX, '')
    .replace(/<\s*\/?\s*script\b[^>]*>/gi, '')
    .replace(/j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/gi, '')
    .trim();

  if (cleaned.length > maxLength) {
    return cleaned.slice(0, maxLength);
  }
  return cleaned;
}

const ALLOWED_PROTOCOLS = new Set(['https:', 'http:', 'tg:']);

/**
 * Validates and sanitizes a URL, allowing only safe protocols ('https:', 'http:', 'tg:')
 * and rejecting dangerous schemes such as 'javascript:', 'data:', 'vbscript:', or 'file:'.
 */
export function sanitizeSafeUrl(url?: string): string | undefined {
  if (!url || typeof url !== 'string') {
    return undefined;
  }
  const trimmed = url.replace(CONTROL_CHARS_REGEX, '').replace(/[\t\n\r]+/g, '').trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();
    if (!ALLOWED_PROTOCOLS.has(protocol)) {
      return undefined;
    }
    return trimmed.slice(0, 2048);
  } catch {
    return undefined;
  }
}

export const CardTypeSchema = z.enum(['idea', 'message', 'link', 'task', 'reference']);
export const CardColorSchema = z.enum(['amethyst', 'gold', 'sage', 'coral', 'neutral']);
export const CardStatusSchema = z.enum(['active', 'pending', 'completed']);
export const ThemeModeSchema = z.enum(['night', 'day', 'auto']);

export const TelegramMetaSchema = z
  .object({
    chatName: z
      .string()
      .optional()
      .transform((v) => (v ? sanitizeText(v, 140) : undefined)),
    author: z
      .string()
      .optional()
      .transform((v) => (v ? sanitizeText(v, 100) : undefined)),
    messageId: z
      .string()
      .optional()
      .transform((v) => (v ? sanitizeText(v, 64) : undefined)),
    forwardedAt: z
      .string()
      .optional()
      .transform((v) => (v ? sanitizeText(v, 64) : undefined)),
  })
  .strict();

export const AuraCardSchema: z.ZodType<AuraCard> = z.object({
  id: z
    .string()
    .min(1)
    .max(128)
    .transform((v) => sanitizeText(v, 128)),
  constellationId: z
    .string()
    .min(1)
    .max(128)
    .transform((v) => sanitizeText(v, 128)),
  title: z
    .string()
    .min(1)
    .max(240)
    .transform((v) => sanitizeText(v, 240) || 'Sin título'),
  content: z
    .string()
    .max(5000)
    .transform((v) => sanitizeText(v, 5000)),
  notes: z
    .string()
    .max(5000)
    .default('')
    .transform((v) => sanitizeText(v, 5000)),
  type: CardTypeSchema,
  color: CardColorSchema,
  status: CardStatusSchema,
  tags: z
    .array(z.string().max(60))
    .max(24)
    .default([])
    .transform((tags) =>
      Array.from(
        new Set(
          tags
            .map((t) => sanitizeText(t, 48).toLowerCase())
            .filter((t) => t.length > 0)
        )
      )
    ),
  favorite: z.boolean().default(false),
  cluster: z
    .string()
    .max(100)
    .optional()
    .transform((v) => {
      if (!v) return undefined;
      const s = sanitizeText(v, 100);
      return s.length > 0 ? s : undefined;
    }),
  sourceUrl: z
    .string()
    .max(2048)
    .optional()
    .transform((v) => sanitizeSafeUrl(v)),
  telegramMeta: TelegramMetaSchema.optional(),
  position: z.object({
    x: z.number().finite().min(-20000).max(20000),
    y: z.number().finite().min(-20000).max(20000),
  }),
  isDemo: z.boolean().optional(),
  createdAt: z
    .string()
    .min(1)
    .max(64)
    .transform((v) => sanitizeText(v, 64)),
  updatedAt: z
    .string()
    .min(1)
    .max(64)
    .transform((v) => sanitizeText(v, 64)),
});

export const AuraConnectionSchema: z.ZodType<AuraConnection> = z.object({
  id: z
    .string()
    .min(1)
    .max(128)
    .transform((v) => sanitizeText(v, 128)),
  constellationId: z
    .string()
    .min(1)
    .max(128)
    .transform((v) => sanitizeText(v, 128)),
  fromCardId: z
    .string()
    .min(1)
    .max(128)
    .transform((v) => sanitizeText(v, 128)),
  toCardId: z
    .string()
    .min(1)
    .max(128)
    .transform((v) => sanitizeText(v, 128)),
  label: z
    .string()
    .max(80)
    .optional()
    .transform((v) => {
      if (!v) return undefined;
      const s = sanitizeText(v, 80);
      return s.length > 0 ? s : undefined;
    }),
  isDemo: z.boolean().optional(),
  createdAt: z
    .string()
    .min(1)
    .max(64)
    .transform((v) => sanitizeText(v, 64)),
});

export const ConstellationSchema: z.ZodType<Constellation> = z.object({
  id: z
    .string()
    .min(1)
    .max(128)
    .transform((v) => sanitizeText(v, 128)),
  name: z
    .string()
    .min(1)
    .max(120)
    .transform((v) => sanitizeText(v, 120) || 'Constelación'),
  description: z
    .string()
    .max(600)
    .default('')
    .transform((v) => sanitizeText(v, 600)),
  icon: z
    .string()
    .min(1)
    .max(48)
    .default('sparkles')
    .transform((v) => sanitizeText(v, 48) || 'sparkles'),
  accentColor: CardColorSchema,
  isDemo: z.boolean().optional(),
  createdAt: z
    .string()
    .min(1)
    .max(64)
    .transform((v) => sanitizeText(v, 64)),
  updatedAt: z
    .string()
    .min(1)
    .max(64)
    .transform((v) => sanitizeText(v, 64)),
});

export const AuraSettingsPartialSchema: z.ZodType<Partial<AuraSettings>> = z
  .object({
    theme: ThemeModeSchema.optional(),
    reducedMotion: z.boolean().optional(),
    performanceMode: z.boolean().optional(),
    showGrid: z.boolean().optional(),
    showClusterHalos: z.boolean().optional(),
    hasSeenWelcome: z.boolean().optional(),
    tmaPreviewFrame: z.boolean().optional(),
  })
  .strict();

export const AuraBackupPayloadSchema: z.ZodType<AuraBackupPayload> = z.object({
  version: z.literal('1.0.0'),
  exportedAt: z
    .string()
    .min(1)
    .max(64)
    .transform((v) => sanitizeText(v, 64)),
  app: z.literal('telegram-aura-constellations'),
  constellations: z.array(ConstellationSchema).max(200),
  cards: z.array(AuraCardSchema).max(5000),
  connections: z.array(AuraConnectionSchema).max(10000),
  settings: AuraSettingsPartialSchema.optional(),
});

const FORBIDDEN_PROTO_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function safeJsonParse(rawJsonString: string): unknown {
  return JSON.parse(rawJsonString, (key, value) => {
    if (FORBIDDEN_PROTO_KEYS.has(key)) {
      return undefined;
    }
    return value;
  });
}

const FallbackStoreSchema = z.object({
  constellations: z.array(ConstellationSchema).min(1).max(200),
  cards: z.array(AuraCardSchema).max(5000).default([]),
  connections: z.array(AuraConnectionSchema).max(10000).default([]),
  settings: AuraSettingsPartialSchema.optional(),
});

export function sanitizeFallbackStoreData(raw: string): {
  constellations: Constellation[];
  cards: AuraCard[];
  connections: AuraConnection[];
  settings?: Partial<AuraSettings>;
} | null {
  if (typeof raw !== 'string' || !raw.trim()) {
    return null;
  }
  const byteSize =
    typeof TextEncoder !== 'undefined'
      ? new TextEncoder().encode(raw).length
      : raw.length;
  if (byteSize > MAX_BACKUP_BYTES) {
    return null;
  }

  try {
    const parsedRaw = safeJsonParse(raw);
    const result = FallbackStoreSchema.safeParse(parsedRaw);
    if (!result.success) {
      return null;
    }
    return result.data;
  } catch {
    return null;
  }
}

export type BackupValidationResult =
  | { success: true; data: AuraBackupPayload }
  | { success: false; error: string };

export function validateAndSanitizeBackup(rawJsonString: string): BackupValidationResult {
  if (typeof rawJsonString !== 'string' || !rawJsonString.trim()) {
    return {
      success: false,
      error: 'El archivo de respaldo está vacío o no contiene texto válido.',
    };
  }

  const byteSize =
    typeof TextEncoder !== 'undefined'
      ? new TextEncoder().encode(rawJsonString).length
      : rawJsonString.length;

  if (byteSize > MAX_BACKUP_BYTES) {
    return {
      success: false,
      error: `El archivo supera el límite máximo permitido de 2 MB (${(byteSize / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  let parsedRaw: unknown;
  try {
    parsedRaw = safeJsonParse(rawJsonString);
  } catch {
    return {
      success: false,
      error: 'El archivo no tiene un formato JSON válido.',
    };
  }

  const validation = AuraBackupPayloadSchema.safeParse(parsedRaw);
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    const pathStr = firstIssue?.path?.join('.') || 'estructura raíz';
    return {
      success: false,
      error: `Formato de respaldo incompatible en "${pathStr}": ${firstIssue?.message ?? 'datos inválidos'}.`,
    };
  }

  const payload = validation.data;

  // Deduplicate constellations by ID
  const constellationMap = new Map<string, Constellation>();
  for (const constellation of payload.constellations) {
    constellationMap.set(constellation.id, constellation);
  }
  const validConstellations = Array.from(constellationMap.values());
  const validConstellationIds = new Set(validConstellations.map((c) => c.id));

  // Filter cards belonging to existing constellations & deduplicate by ID
  const cardMap = new Map<string, AuraCard>();
  for (const card of payload.cards) {
    if (validConstellationIds.has(card.constellationId)) {
      cardMap.set(card.id, card);
    }
  }
  const validCards = Array.from(cardMap.values());

  // Filter orphan connections, self-connections, cross-constellation mismatches, and duplicate pairs
  const seenPairKeys = new Set<string>();
  const validConnections: AuraConnection[] = [];

  for (const conn of payload.connections) {
    if (conn.fromCardId === conn.toCardId) {
      continue;
    }
    const fromCard = cardMap.get(conn.fromCardId);
    const toCard = cardMap.get(conn.toCardId);

    if (!fromCard || !toCard) {
      continue;
    }
    if (
      fromCard.constellationId !== conn.constellationId ||
      toCard.constellationId !== conn.constellationId
    ) {
      continue;
    }

    const pairKey = [conn.fromCardId, conn.toCardId].sort().join('::');
    const scopedKey = `${conn.constellationId}::${pairKey}`;
    if (seenPairKeys.has(scopedKey)) {
      continue;
    }
    seenPairKeys.add(scopedKey);
    validConnections.push(conn);
  }

  return {
    success: true,
    data: {
      ...payload,
      constellations: validConstellations,
      cards: validCards,
      connections: validConnections,
    },
  };
}
