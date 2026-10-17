import type { CardType, TelegramMeta } from '../types/aura';
import { sanitizeSafeUrl, sanitizeText } from '../schemas/validation';

export interface TelegramWebAppUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramSafeAreaInset {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface TelegramHapticFeedback {
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  selectionChanged: () => void;
}

export interface TelegramWebAppInstance {
  initData?: string;
  initDataUnsafe?: {
    user?: TelegramWebAppUser;
    start_param?: string;
  };
  version?: string;
  platform?: string;
  colorScheme?: 'light' | 'dark';
  safeAreaInset?: TelegramSafeAreaInset;
  isExpanded?: boolean;
  ready: () => void;
  expand: () => void;
  disableVerticalSwipes?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  HapticFeedback?: TelegramHapticFeedback;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebAppInstance;
    };
  }
}

export interface TelegramEnvironmentState {
  isTelegramMiniApp: boolean;
  colorScheme: 'light' | 'dark' | null;
  safeAreaInset: TelegramSafeAreaInset;
  user: TelegramWebAppUser | null;
  platform: string;
  version: string;
}

export interface ParsedTelegramCapture {
  title: string;
  content: string;
  sourceUrl?: string;
  type: CardType;
  tags: string[];
  telegramMeta?: TelegramMeta;
}

const DEFAULT_SAFE_AREA: TelegramSafeAreaInset = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

function getTelegramWebApp(): TelegramWebAppInstance | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.Telegram?.WebApp;
}

/**
 * Safely initializes the Telegram Mini App SDK if running inside Telegram.
 * Disables vertical swipes (Bot API 7.7+) so dragging cards on the canvas does not close the Mini App.
 */
export function initTelegramMiniApp(): TelegramEnvironmentState {
  const webApp = getTelegramWebApp();

  if (!webApp || (!webApp.initData && !webApp.platform)) {
    return {
      isTelegramMiniApp: false,
      colorScheme: null,
      safeAreaInset: { ...DEFAULT_SAFE_AREA },
      user: null,
      platform: 'web',
      version: 'web-standalone',
    };
  }

  try {
    webApp.ready();
    webApp.expand();
    webApp.disableVerticalSwipes?.();
  } catch {
    // Ignore SDK invocation errors in emulated or restricted browser contexts
  }

  const safeArea = webApp.safeAreaInset ?? DEFAULT_SAFE_AREA;
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (safeArea.top > 0) root.style.setProperty('--safe-top', `${safeArea.top}px`);
    if (safeArea.bottom > 0) root.style.setProperty('--safe-bottom', `${safeArea.bottom}px`);
    if (safeArea.left > 0) root.style.setProperty('--safe-left', `${safeArea.left}px`);
    if (safeArea.right > 0) root.style.setProperty('--safe-right', `${safeArea.right}px`);
  }

  return {
    isTelegramMiniApp: Boolean(webApp.initData && webApp.initData.length > 0),
    colorScheme: webApp.colorScheme ?? null,
    safeAreaInset: {
      top: safeArea.top ?? 0,
      bottom: safeArea.bottom ?? 0,
      left: safeArea.left ?? 0,
      right: safeArea.right ?? 0,
    },
    user: webApp.initDataUnsafe?.user ?? null,
    platform: webApp.platform ?? 'telegram',
    version: webApp.version ?? '8.0',
  };
}

/**
 * Synchronizes Telegram Mini App header and background colors with AURA's active theme.
 */
export function syncTelegramColors(effectiveTheme: 'night' | 'day'): void {
  const webApp = getTelegramWebApp();
  const hexColor = effectiveTheme === 'night' ? '#10121D' : '#F7F5F1';

  try {
    webApp?.setHeaderColor?.(hexColor);
    webApp?.setBackgroundColor?.(hexColor);
  } catch {
    // Safe no-op in older clients or external browsers
  }
}

/**
 * Triggers native Telegram haptic feedback when available without failing on desktop/web.
 */
export function triggerHaptic(
  type: 'light' | 'medium' | 'success' | 'warning'
): void {
  const haptic = getTelegramWebApp()?.HapticFeedback;
  if (!haptic) return;

  try {
    if (type === 'light' || type === 'medium') {
      haptic.impactOccurred(type);
    } else {
      haptic.notificationOccurred(type);
    }
  } catch {
    // Ignore unsupported haptic calls
  }
}

/**
 * Intelligently parses a user-pasted Telegram link, forwarded message, or raw thought
 * and extracts suggested title, clean content, URL, card type, #hashtags, and Telegram metadata.
 */
export function parseTelegramInput(rawInput: string): ParsedTelegramCapture {
  const cleanedRaw = sanitizeText(rawInput, 4500);
  if (!cleanedRaw) {
    return {
      title: 'Nueva nota estelar',
      content: '',
      type: 'idea',
      tags: ['telegram'],
    };
  }

  // Extract #hashtags
  const hashtagMatches = Array.from(
    cleanedRaw.matchAll(/#([a-zA-Z0-9_áéíóúÁÉÍÓÚñÑüÜ-]{2,36})/g),
    (m) => m[1].toLowerCase()
  );
  const extractedTags = Array.from(new Set(hashtagMatches)).slice(0, 8);

  // Detect URLs (prioritizing t.me / telegram.me or standard https links)
  const urlMatch = cleanedRaw.match(/(https?:\/\/[^\s<>"]+|tg:\/\/[^\s<>"]+)/i);
  const detectedUrl = urlMatch ? sanitizeSafeUrl(urlMatch[1]) : undefined;

  let type: CardType = 'idea';
  let telegramMeta: TelegramMeta | undefined;
  let workingBody = cleanedRaw;

  // Check if URL is a Telegram link: https://t.me/channel/1234 or https://t.me/c/12345/678
  if (detectedUrl) {
    const tmeMatch = detectedUrl.match(
      /^https?:\/\/(?:t\.me|telegram\.me|telegram\.dog)\/(?:c\/(\d+)|([a-zA-Z0-9_]{3,64}))(?:\/(\d+))?/i
    );
    if (tmeMatch) {
      const channelSlug = tmeMatch[2] || (tmeMatch[1] ? `Chat #${tmeMatch[1]}` : 'Telegram');
      const messageId = tmeMatch[3];
      telegramMeta = {
        chatName: channelSlug.startsWith('@') ? channelSlug : `@${channelSlug}`,
        author: channelSlug.startsWith('@') ? channelSlug : `@${channelSlug}`,
        messageId: messageId || undefined,
        forwardedAt: 'Capturado desde enlace t.me',
      };
      type = messageId ? 'message' : 'link';
      if (!extractedTags.includes('telegram')) {
        extractedTags.unshift('telegram');
      }
    } else {
      type = 'link';
    }
  }

  // Check forwarded message headers such as:
  // "Reenviado de @elena_design: ..." or "Forwarded from Design Systems TG (@elena): ..."
  const forwardPrefixRegex =
    /^(?:reenviado de|forwarded from|de|from)\s+([^:\n]{2,60}?)\s*:\s*([\s\S]+)$/i;
  const forwardMatch = workingBody.match(forwardPrefixRegex);

  if (forwardMatch) {
    const sourceDescriptor = sanitizeText(forwardMatch[1], 80);
    workingBody = sanitizeText(forwardMatch[2], 4000);
    type = 'message';

    const handleMatch = sourceDescriptor.match(/@[a-zA-Z0-9_]{3,40}/);
    const author = handleMatch ? handleMatch[0] : sourceDescriptor;

    telegramMeta = {
      chatName: telegramMeta?.chatName ?? sourceDescriptor,
      author: telegramMeta?.author ?? author,
      messageId: telegramMeta?.messageId,
      forwardedAt: 'Hoy · Captura directa',
    };
    if (!extractedTags.includes('telegram')) {
      extractedTags.unshift('telegram');
    }
  } else {
    // Also detect inline @mention if no forward prefix was used
    const mentionMatch = workingBody.match(/(?:^|\s)(@[a-zA-Z0-9_]{3,36})\b/);
    if (mentionMatch && !telegramMeta) {
      telegramMeta = {
        author: mentionMatch[1],
        chatName: `Mensaje de ${mentionMatch[1]}`,
        forwardedAt: 'Reciente',
      };
      if (type === 'idea') {
        type = 'message';
      }
    }
  }

  // Detect task intent if starts with TODO:, [ ], Pendiente:, etc.
  if (/^(?:todo|tarea|pendiente|\[\s?\])\s*[:-]?\s+/i.test(workingBody)) {
    type = 'task';
    workingBody = workingBody.replace(/^(?:todo|tarea|pendiente|\[\s?\])\s*[:-]?\s+/i, '');
  }

  // Strip standalone URL from body if there is additional descriptive text
  const textWithoutUrl = detectedUrl
    ? workingBody.replace(detectedUrl, '').trim()
    : workingBody.trim();

  const cleanSentence = (textWithoutUrl || workingBody)
    .replace(/#[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑüÜ-]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  let suggestedTitle = '';
  if (cleanSentence.length > 0) {
    const firstLine = cleanSentence.split(/[\n.!?]/)[0].trim();
    suggestedTitle =
      firstLine.length > 68 ? `${firstLine.slice(0, 65).trim()}…` : firstLine;
  } else if (telegramMeta?.chatName) {
    suggestedTitle = `Publicación de ${telegramMeta.chatName}${
      telegramMeta.messageId ? ` #${telegramMeta.messageId}` : ''
    }`;
  } else if (detectedUrl) {
    try {
      const u = new URL(detectedUrl);
      suggestedTitle = `Enlace de ${u.hostname.replace(/^www\./, '')}`;
    } catch {
      suggestedTitle = 'Enlace guardado de Telegram';
    }
  } else {
    suggestedTitle = 'Idea capturada en AURA';
  }

  const finalContent =
    textWithoutUrl.length > 0
      ? textWithoutUrl
      : detectedUrl
        ? `Recurso vinculado desde ${detectedUrl}`
        : workingBody;

  return {
    title: sanitizeText(suggestedTitle, 140) || 'Idea capturada',
    content: sanitizeText(finalContent, 3000),
    sourceUrl: detectedUrl,
    type,
    tags: extractedTags.length > 0 ? extractedTags : ['captura'],
    telegramMeta,
  };
}
