import { describe, expect, it } from 'vitest';
import { parseTelegramInput } from '../../services/telegramBridge';

describe('Telegram Bridge & Smart Input Parser (Unit)', () => {
  it('parses direct Telegram post links (https://t.me/durov/245) with commentary and #hashtags', () => {
    const input =
      'https://t.me/durov/245 Excelente análisis sobre Mini Apps ecosistémicas #tma #producto';
    const parsed = parseTelegramInput(input);

    expect(parsed.sourceUrl).toBe('https://t.me/durov/245');
    expect(parsed.type).toBe('message');
    expect(parsed.telegramMeta?.chatName).toBe('@durov');
    expect(parsed.telegramMeta?.messageId).toBe('245');
    expect(parsed.tags).toContain('telegram');
    expect(parsed.tags).toContain('tma');
    expect(parsed.tags).toContain('producto');
    expect(parsed.title).toContain('Excelente análisis sobre Mini Apps ecosistémicas');
  });

  it('parses forwarded Telegram messages ("Reenviado de @elena_design: ...")', () => {
    const input =
      'Reenviado de @elena_design: Revisar contraste en modo diurno #ux #wcag';
    const parsed = parseTelegramInput(input);

    expect(parsed.type).toBe('message');
    expect(parsed.telegramMeta?.author).toBe('@elena_design');
    expect(parsed.telegramMeta?.chatName).toBe('@elena_design');
    expect(parsed.tags).toContain('telegram');
    expect(parsed.tags).toContain('ux');
    expect(parsed.tags).toContain('wcag');
    expect(parsed.title).toBe('Revisar contraste en modo diurno');
  });

  it('parses free-form thoughts and task prefixes accurately', () => {
    const thought =
      'Explorar distribución de espiral áurea para organizar más de 100 nodos sin colisiones #canvas';
    const parsedThought = parseTelegramInput(thought);

    expect(parsedThought.type).toBe('idea');
    expect(parsedThought.tags).toContain('canvas');
    expect(parsedThought.sourceUrl).toBeUndefined();

    const taskInput = 'TODO: Grabar demostración fluida de 60 segundos #entrega';
    const parsedTask = parseTelegramInput(taskInput);
    expect(parsedTask.type).toBe('task');
    expect(parsedTask.title).toBe('Grabar demostración fluida de 60 segundos');
  });
});
