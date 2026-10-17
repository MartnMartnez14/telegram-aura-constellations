import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { generateStressTestCards } from '../../services/demoSeed';
import {
  clearDemoDataOnly,
  deleteCard,
  getAllData,
  importBackupData,
  initStorage,
  saveCard,
  saveCardsBatch,
  saveConnection,
  saveConstellation,
} from '../../services/storage';
import { validateAndSanitizeBackup } from '../../schemas/validation';
import type { AuraBackupPayload, AuraCard, Constellation } from '../../types/aura';

describe('Storage & Persistence Integration (fake-indexeddb)', () => {
  it('completes the full lifecycle: seed, custom constellation, CRUD, cascade delete, clear demo, backup & 105-card stress batch', async () => {
    // 1. Initialize storage and verify the 3 demo constellations exist
    const initial = await initStorage();
    expect(initial.constellations).toHaveLength(3);
    const demoNames = initial.constellations.map((c) => c.name);
    expect(demoNames).toContain('Creative Studio');
    expect(demoNames).toContain('Learning Universe');
    expect(demoNames).toContain('Daily Life');
    expect(initial.cards.length).toBeGreaterThanOrEqual(17);
    expect(initial.connections.length).toBeGreaterThanOrEqual(15);

    // 2. Create a custom user constellation ("Mi Proyecto Telegram")
    const now = new Date().toISOString();
    const customConstellation: Constellation = {
      id: 'const-mi-proyecto-tg',
      name: 'Mi Proyecto Telegram',
      description: 'Constelación personal de arquitectura y lanzamiento.',
      icon: 'orbit',
      accentColor: 'amethyst',
      isDemo: false,
      createdAt: now,
      updatedAt: now,
    };
    await saveConstellation(customConstellation);

    // 3. Add cards to the custom constellation and edit them
    const card1: AuraCard = {
      id: 'user-card-1',
      constellationId: customConstellation.id,
      title: 'Diseño de Bot Webhook',
      content: 'Sincronización voluntaria con SQLite.',
      notes: 'Nota inicial',
      type: 'idea',
      color: 'amethyst',
      status: 'active',
      tags: ['backend', 'bot'],
      favorite: false,
      position: { x: 220, y: 180 },
      isDemo: false,
      createdAt: now,
      updatedAt: now,
    };

    const card2: AuraCard = {
      id: 'user-card-2',
      constellationId: customConstellation.id,
      title: 'Validación HMAC-SHA256',
      content: 'Verificar initData en el servidor.',
      notes: 'Seguridad TMA',
      type: 'task',
      color: 'gold',
      status: 'pending',
      tags: ['seguridad', 'hmac'],
      favorite: true,
      position: { x: 560, y: 200 },
      isDemo: false,
      createdAt: now,
      updatedAt: now,
    };

    const card3: AuraCard = {
      id: 'user-card-3',
      constellationId: customConstellation.id,
      title: 'Nodo Temporal para Eliminar',
      content: 'Se probará borrado en cascada.',
      notes: '',
      type: 'reference',
      color: 'sage',
      status: 'active',
      tags: ['temp'],
      favorite: false,
      position: { x: 400, y: 450 },
      isDemo: false,
      createdAt: now,
      updatedAt: now,
    };

    await saveCard(card1);
    await saveCard(card2);
    await saveCard(card3);

    // Edit card1 (title, notes, color, tags, position)
    const updatedCard1: AuraCard = {
      ...card1,
      title: 'Diseño de Bot Webhook v2',
      notes: 'Nota actualizada con más detalle',
      color: 'coral',
      tags: ['backend', 'bot', 'v2'],
      position: { x: 250, y: 210 },
      updatedAt: new Date().toISOString(),
    };
    await saveCard(updatedCard1);

    // 4. Create connections and verify self-connections and duplicates are prevented
    const selfConn = await saveConnection({
      id: 'conn-self-attempt',
      constellationId: customConstellation.id,
      fromCardId: card1.id,
      toCardId: card1.id,
      createdAt: now,
    });
    expect(selfConn).toBeNull();

    const conn12 = await saveConnection({
      id: 'conn-user-1-2',
      constellationId: customConstellation.id,
      fromCardId: card1.id,
      toCardId: card2.id,
      label: 'protege',
      isDemo: false,
      createdAt: now,
    });
    expect(conn12).not.toBeNull();

    // Attempt reverse duplicate connection between card2 and card1
    const duplicateConn21 = await saveConnection({
      id: 'conn-user-2-1-dup',
      constellationId: customConstellation.id,
      fromCardId: card2.id,
      toCardId: card1.id,
      label: 'protege',
      isDemo: false,
      createdAt: now,
    });
    expect(duplicateConn21?.id).toBe('conn-user-1-2');

    // Connect card2 -> card3
    await saveConnection({
      id: 'conn-user-2-3',
      constellationId: customConstellation.id,
      fromCardId: card2.id,
      toCardId: card3.id,
      label: 'depende',
      isDemo: false,
      createdAt: now,
    });

    // 5. Delete card3 and verify its connections are cascade-deleted (zero orphan connections)
    await deleteCard(card3.id);
    const afterCardDelete = await getAllData();
    const customConns = afterCardDelete.connections.filter(
      (c) => c.constellationId === customConstellation.id
    );
    expect(customConns).toHaveLength(1);
    expect(customConns[0].id).toBe('conn-user-1-2');

    // 6. Execute clearDemoDataOnly() and verify the 3 demo constellations disappear while "Mi Proyecto Telegram" stays intact
    const afterClearDemo = await clearDemoDataOnly();
    expect(afterClearDemo.constellations).toHaveLength(1);
    expect(afterClearDemo.constellations[0].name).toBe('Mi Proyecto Telegram');
    expect(afterClearDemo.cards).toHaveLength(2);
    const persistedCard1 = afterClearDemo.cards.find((c) => c.id === 'user-card-1');
    expect(persistedCard1?.title).toBe('Diseño de Bot Webhook v2');
    expect(persistedCard1?.color).toBe('coral');
    expect(afterClearDemo.connections).toHaveLength(1);

    // 7. Export and re-import backup payload, verifying full persistence via getAllData()
    const exportedPayload: AuraBackupPayload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      app: 'telegram-aura-constellations',
      constellations: afterClearDemo.constellations,
      cards: afterClearDemo.cards,
      connections: afterClearDemo.connections,
      settings: { theme: 'day', performanceMode: true },
    };

    const validated = validateAndSanitizeBackup(JSON.stringify(exportedPayload));
    expect(validated.success).toBe(true);
    if (validated.success) {
      await importBackupData(validated.data, 'replace');
    }

    const reopened = await getAllData();
    expect(reopened.constellations).toHaveLength(1);
    expect(reopened.constellations[0].id).toBe(customConstellation.id);
    expect(reopened.cards).toHaveLength(2);
    expect(reopened.connections).toHaveLength(1);
    expect(reopened.settings.theme).toBe('day');
    expect(reopened.settings.performanceMode).toBe(true);

    // 8. Test generateStressTestCards with 105 cards and batch save (saveCardsBatch)
    const stress = generateStressTestCards(customConstellation.id, 105);
    expect(stress.cards).toHaveLength(105);
    expect(stress.connections.length).toBeGreaterThan(100);

    await saveCardsBatch(stress.cards);
    const afterStress = await getAllData();
    expect(afterStress.cards.length).toBe(107); // 2 user cards + 105 stress cards
  });
});
