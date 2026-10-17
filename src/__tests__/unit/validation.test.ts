import { describe, expect, it } from 'vitest';
import {
  AuraCardSchema,
  AuraConnectionSchema,
  ConstellationSchema,
  MAX_BACKUP_BYTES,
  sanitizeFallbackStoreData,
  sanitizeSafeUrl,
  sanitizeText,
  validateAndSanitizeBackup,
} from '../../schemas/validation';

describe('Validation & Security Schemas (Unit)', () => {
  it('sanitizes text by stripping control characters, script tags, and enforcing max length', () => {
    const dirty = '  Hola \u0000\u0007mundo <script>alert(1)</script> javascript:evil()  ';
    const cleaned = sanitizeText(dirty, 100);

    expect(cleaned).not.toContain('\u0000');
    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('javascript:');
    expect(cleaned).toContain('Hola mundo');

    const truncated = sanitizeText('A'.repeat(300), 50);
    expect(truncated.length).toBe(50);
  });

  it('validates safe URLs and rejects dangerous protocols (javascript:, data:, vbscript:)', () => {
    expect(sanitizeSafeUrl('https://core.telegram.org/bots/webapps')).toBe(
      'https://core.telegram.org/bots/webapps'
    );
    expect(sanitizeSafeUrl('tg://resolve?domain=durov')).toBe('tg://resolve?domain=durov');
    expect(sanitizeSafeUrl('http://localhost:5173/demo')).toBe('http://localhost:5173/demo');

    expect(sanitizeSafeUrl('javascript:alert(1)')).toBeUndefined();
    expect(sanitizeSafeUrl('JAVASCRIPT:alert(document.cookie)')).toBeUndefined();
    expect(sanitizeSafeUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined();
    expect(sanitizeSafeUrl('vbscript:msgbox("xss")')).toBeUndefined();
    expect(sanitizeSafeUrl('')).toBeUndefined();
  });

  it('validates AuraCardSchema, ConstellationSchema, and AuraConnectionSchema', () => {
    const now = new Date().toISOString();

    const constellation = ConstellationSchema.parse({
      id: 'const-1',
      name: '  Creative Studio  ',
      description: 'Espacio de diseño',
      icon: 'sparkles',
      accentColor: 'amethyst',
      createdAt: now,
      updatedAt: now,
    });
    expect(constellation.name).toBe('Creative Studio');

    const card = AuraCardSchema.parse({
      id: 'card-1',
      constellationId: 'const-1',
      title: 'Idea de interfaz',
      content: 'Contenido limpio',
      notes: 'Notas adicionales',
      type: 'idea',
      color: 'gold',
      status: 'active',
      tags: ['UX', '  Telegram ', 'ux'],
      favorite: true,
      sourceUrl: 'javascript:alert(1)',
      position: { x: 240, y: 380 },
      createdAt: now,
      updatedAt: now,
    });

    expect(card.tags).toEqual(['ux', 'telegram']);
    expect(card.sourceUrl).toBeUndefined();

    const connection = AuraConnectionSchema.parse({
      id: 'conn-1',
      constellationId: 'const-1',
      fromCardId: 'card-1',
      toCardId: 'card-2',
      label: '  inspira ',
      createdAt: now,
    });
    expect(connection.label).toBe('inspira');
  });

  it('validates a legitimate backup and automatically strips orphan and self-connections', () => {
    const now = '2026-10-16T12:00:00.000Z';
    const rawBackup = JSON.stringify({
      version: '1.0.0',
      exportedAt: now,
      app: 'telegram-aura-constellations',
      constellations: [
        {
          id: 'c-main',
          name: 'Constelación Principal',
          description: 'Demo',
          icon: 'sparkles',
          accentColor: 'amethyst',
          createdAt: now,
          updatedAt: now,
        },
      ],
      cards: [
        {
          id: 'card-a',
          constellationId: 'c-main',
          title: 'Nodo A',
          content: 'Texto A',
          notes: '',
          type: 'idea',
          color: 'amethyst',
          status: 'active',
          tags: ['alfa'],
          favorite: false,
          position: { x: 100, y: 100 },
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'card-b',
          constellationId: 'c-main',
          title: 'Nodo B',
          content: 'Texto B',
          notes: '',
          type: 'link',
          color: 'sage',
          status: 'pending',
          tags: ['beta'],
          favorite: true,
          sourceUrl: 'https://t.me/durov/10',
          position: { x: 400, y: 200 },
          createdAt: now,
          updatedAt: now,
        },
      ],
      connections: [
        {
          id: 'conn-valid',
          constellationId: 'c-main',
          fromCardId: 'card-a',
          toCardId: 'card-b',
          label: 'conecta',
          createdAt: now,
        },
        {
          id: 'conn-self',
          constellationId: 'c-main',
          fromCardId: 'card-a',
          toCardId: 'card-a',
          label: 'auto',
          createdAt: now,
        },
        {
          id: 'conn-orphan',
          constellationId: 'c-main',
          fromCardId: 'card-a',
          toCardId: 'non-existent-card',
          label: 'huérfana',
          createdAt: now,
        },
      ],
      settings: {
        theme: 'day',
        reducedMotion: true,
      },
    });

    const result = validateAndSanitizeBackup(rawBackup);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.constellations).toHaveLength(1);
      expect(result.data.cards).toHaveLength(2);
      expect(result.data.connections).toHaveLength(1);
      expect(result.data.connections[0].id).toBe('conn-valid');
      expect(result.data.settings?.theme).toBe('day');
    }
  });

  it('rejects malformed JSON and payloads exceeding the 2 MB limit', () => {
    const malformed = validateAndSanitizeBackup('{ "version": "1.0.0", broken_json ');
    expect(malformed.success).toBe(false);

    const oversizedString = 'x'.repeat(MAX_BACKUP_BYTES + 1024);
    const oversizedResult = validateAndSanitizeBackup(oversizedString);
    expect(oversizedResult.success).toBe(false);
    if (!oversizedResult.success) {
      expect(oversizedResult.error).toContain('2 MB');
    }
  });

  it('WH-02: blocks tab/newline obfuscated javascript: URLs and spaced javascript: in text', () => {
    expect(sanitizeSafeUrl('java\tscript:alert(1)')).toBeUndefined();
    expect(sanitizeSafeUrl('java\n\rscript:alert(document.domain)')).toBeUndefined();
    const cleanedText = sanitizeText('Prueba j a v a\ts\nc r i p t :evil() fin');
    expect(cleanedText.toLowerCase()).not.toContain('javascript:');
    expect(cleanedText).toContain('Prueba evil() fin');
  });

  it('WH-03: strips __proto__, constructor, and prototype keys and validates fallback store data', () => {
    const now = '2026-10-16T12:00:00.000Z';
    const rawWithProto = `{
      "version": "1.0.0",
      "exportedAt": "${now}",
      "app": "telegram-aura-constellations",
      "__proto__": { "polluted": true },
      "constellations": [
        {
          "id": "c-proto",
          "name": "Segura",
          "description": "Test",
          "icon": "sparkles",
          "accentColor": "amethyst",
          "createdAt": "${now}",
          "updatedAt": "${now}"
        }
      ],
      "cards": [],
      "connections": []
    }`;

    const backupRes = validateAndSanitizeBackup(rawWithProto);
    expect(backupRes.success).toBe(true);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();

    const fallbackValid = sanitizeFallbackStoreData(
      JSON.stringify({
        constellations: [
          {
            id: 'c-1',
            name: 'Local',
            description: '',
            icon: 'sparkles',
            accentColor: 'gold',
            createdAt: now,
            updatedAt: now,
          },
        ],
        cards: [],
        connections: [],
        settings: { theme: 'night' },
      })
    );
    expect(fallbackValid).not.toBeNull();
    expect(fallbackValid?.constellations[0].id).toBe('c-1');

    expect(sanitizeFallbackStoreData('{ "constellations": [] }')).toBeNull();
    expect(sanitizeFallbackStoreData('invalid json')).toBeNull();
  });
});
