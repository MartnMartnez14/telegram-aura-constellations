export type CardType = 'idea' | 'message' | 'link' | 'task' | 'reference';

export type CardColor = 'amethyst' | 'gold' | 'sage' | 'coral' | 'neutral';

export type CardStatus = 'active' | 'pending' | 'completed';

export type ThemeMode = 'night' | 'day' | 'auto';

export type ScreenId = 'welcome' | 'universe' | 'library' | 'settings';

export type ConstellationIcon = 'sparkles' | 'compass' | 'book' | 'sun' | 'orbit' | string;

export interface TelegramMeta {
  chatName?: string;
  author?: string;
  messageId?: string;
  forwardedAt?: string;
}

export interface CardPosition {
  x: number;
  y: number;
}

export interface AuraCard {
  id: string;
  constellationId: string;
  title: string;
  content: string;
  notes: string;
  type: CardType;
  color: CardColor;
  status: CardStatus;
  tags: string[];
  favorite: boolean;
  cluster?: string;
  sourceUrl?: string;
  telegramMeta?: TelegramMeta;
  position: CardPosition;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuraConnection {
  id: string;
  constellationId: string;
  fromCardId: string;
  toCardId: string;
  label?: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface Constellation {
  id: string;
  name: string;
  description: string;
  icon: ConstellationIcon;
  accentColor: CardColor;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuraSettings {
  theme: ThemeMode;
  reducedMotion: boolean;
  performanceMode: boolean;
  showGrid: boolean;
  showClusterHalos: boolean;
  hasSeenWelcome: boolean;
  tmaPreviewFrame: boolean;
}

export interface AuraBackupPayload {
  version: '1.0.0';
  exportedAt: string;
  app: 'telegram-aura-constellations';
  constellations: Constellation[];
  cards: AuraCard[];
  connections: AuraConnection[];
  settings?: Partial<AuraSettings>;
}
