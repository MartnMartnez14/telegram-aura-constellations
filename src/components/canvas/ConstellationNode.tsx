import React, { useRef } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lightbulb,
  Link2,
  MessageSquare,
  Star,
} from 'lucide-react';
import type { AuraCard, CardPosition, CardType } from '../../types/aura';

export interface ConstellationNodeProps {
  card: AuraCard;
  zoom: number;
  isSelected: boolean;
  isConnectingSource: boolean;
  isConnectingMode: boolean;
  isDimmed: boolean;
  connectionCount: number;
  onSelect: (cardId: string) => void;
  onMove: (cardId: string, nextPos: CardPosition, persist: boolean) => void;
  onStartConnect: (cardId: string) => void;
  onCompleteConnect: (targetCardId: string) => void;
  onToggleFavorite: (cardId: string) => void;
}

const TYPE_LABELS: Record<CardType, string> = {
  idea: 'Idea',
  message: 'Mensaje TG',
  link: 'Enlace',
  task: 'Tarea',
  reference: 'Referencia',
};

function renderTypeIcon(type: CardType) {
  switch (type) {
    case 'message':
      return <MessageSquare size={13} />;
    case 'link':
      return <ExternalLink size={13} />;
    case 'task':
      return <Clock size={13} />;
    case 'reference':
      return <BookOpen size={13} />;
    default:
      return <Lightbulb size={13} />;
  }
}

export const ConstellationNode: React.FC<ConstellationNodeProps> = React.memo(
  ({
    card,
    zoom,
    isSelected,
    isConnectingSource,
    isConnectingMode,
    isDimmed,
    connectionCount,
    onSelect,
    onMove,
    onStartConnect,
    onCompleteConnect,
    onToggleFavorite,
  }) => {
    const dragRef = useRef<{
      active: boolean;
      pointerId: number;
      startClientX: number;
      startClientY: number;
      originX: number;
      originY: number;
      hasMoved: boolean;
    } | null>(null);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest('button, a')) {
        return;
      }
      e.stopPropagation();

      if (isConnectingMode && !isConnectingSource) {
        onCompleteConnect(card.id);
        return;
      }

      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = {
        active: true,
        pointerId: e.pointerId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        originX: card.position.x,
        originY: card.position.y,
        hasMoved: false,
      };
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      const state = dragRef.current;
      if (!state || !state.active || state.pointerId !== e.pointerId) return;
      e.stopPropagation();

      const dxScreen = e.clientX - state.startClientX;
      const dyScreen = e.clientY - state.startClientY;

      if (!state.hasMoved && Math.hypot(dxScreen, dyScreen) < 5) {
        return;
      }

      state.hasMoved = true;
      const safeZoom = Math.max(0.25, zoom);
      const nextX = state.originX + dxScreen / safeZoom;
      const nextY = state.originY + dyScreen / safeZoom;

      onMove(card.id, { x: nextX, y: nextY }, false);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      const state = dragRef.current;
      if (!state || state.pointerId !== e.pointerId) return;
      e.stopPropagation();

      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore capture release errors
      }

      dragRef.current = null;

      if (state.hasMoved) {
        const safeZoom = Math.max(0.25, zoom);
        const finalX = state.originX + (e.clientX - state.startClientX) / safeZoom;
        const finalY = state.originY + (e.clientY - state.startClientY) / safeZoom;
        onMove(card.id, { x: finalX, y: finalY }, true);
      } else {
        onSelect(card.id);
      }
    };

    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`Tarjeta ${card.title} (${TYPE_LABELS[card.type]})`}
        data-testid={`canvas-card-${card.id}`}
        data-color={card.color}
        className={`aura-card ${isSelected || isConnectingSource ? 'is-selected' : ''}`.trim()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (isConnectingMode && !isConnectingSource) {
              onCompleteConnect(card.id);
            } else {
              onSelect(card.id);
            }
          }
        }}
        style={{
          position: 'absolute',
          left: `${card.position.x}px`,
          top: `${card.position.y}px`,
          width: '260px',
          minHeight: '124px',
          zIndex: isSelected || isConnectingSource ? 20 : 10,
          opacity: isDimmed ? 0.34 : 1,
          cursor: isConnectingMode
            ? isConnectingSource
              ? 'default'
              : 'crosshair'
            : 'grab',
          outline: isConnectingSource
            ? '2px dashed var(--accent-gold)'
            : isConnectingMode
              ? '1px dashed var(--accent-amethyst)'
              : undefined,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '8px',
          touchAction: 'none',
        }}
      >
        {/* Top Metadata Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {renderTypeIcon(card.type)}
            {TYPE_LABELS[card.type]}
            {card.cluster ? ` · ${card.cluster}` : ''}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {card.status === 'pending' && (
              <span
                title="Pendiente"
                style={{
                  fontSize: '0.68rem',
                  padding: '1px 6px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(217, 188, 128, 0.18)',
                  color: 'var(--status-warning)',
                  fontWeight: 600,
                }}
              >
                ⏳
              </span>
            )}
            {card.status === 'completed' && (
              <span
                title="Completada"
                style={{
                  display: 'inline-flex',
                  color: 'var(--status-success)',
                }}
              >
                <CheckCircle2 size={14} />
              </span>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(card.id);
              }}
              aria-label={
                card.favorite ? 'Quitar de favoritos' : 'Marcar como favorito'
              }
              title={card.favorite ? 'Favorito' : 'Marcar favorito'}
              style={{
                padding: '3px',
                borderRadius: '6px',
                color: card.favorite ? 'var(--accent-gold)' : 'var(--text-muted)',
              }}
            >
              <Star size={14} fill={card.favorite ? 'currentColor' : 'none'} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isConnectingMode && !isConnectingSource) {
                  onCompleteConnect(card.id);
                } else {
                  onStartConnect(card.id);
                }
              }}
              aria-label={`Conectar tarjeta ${card.title}`}
              title="Trazar conexión desde esta tarjeta"
              style={{
                padding: '3px 6px',
                borderRadius: '6px',
                fontSize: '0.7rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                backgroundColor: isConnectingSource
                  ? 'var(--accent-gold)'
                  : 'var(--bg-elevated)',
                color: isConnectingSource
                  ? 'var(--text-on-accent)'
                  : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
              data-testid={`connect-btn-${card.id}`}
            >
              <Link2 size={12} />
              {connectionCount > 0 ? connectionCount : ''}
            </button>
          </div>
        </div>

        {/* Title & Snippet */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.94rem',
              fontWeight: 700,
              lineHeight: 1.28,
              color: 'var(--text-primary)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {card.title}
          </h3>

          {card.content && (
            <p
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {card.content}
            </p>
          )}
        </div>

        {/* Telegram Meta / Tags Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px',
            flexWrap: 'wrap',
            marginTop: '2px',
          }}
        >
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {card.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="aura-tag"
                style={{ fontSize: '0.68rem', padding: '1px 7px' }}
              >
                #{tag}
              </span>
            ))}
          </div>

          {card.telegramMeta?.author && (
            <span
              style={{
                fontSize: '0.7rem',
                color: 'var(--accent-gold)',
                fontWeight: 500,
              }}
            >
              {card.telegramMeta.author}
            </span>
          )}
        </div>
      </div>
    );
  }
);

ConstellationNode.displayName = 'ConstellationNode';

export default ConstellationNode;
