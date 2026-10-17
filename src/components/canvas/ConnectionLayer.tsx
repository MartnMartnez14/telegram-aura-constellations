import React from 'react';
import type { AuraCard, AuraConnection, CardPosition } from '../../types/aura';

export interface ConnectionLayerProps {
  cards: AuraCard[];
  connections: AuraConnection[];
  selectedCardId: string | null;
  connectingFromCardId: string | null;
  pointerWorldPos: CardPosition | null;
  performanceMode: boolean;
  reducedMotion: boolean;
  onDeleteConnection: (connectionId: string) => void;
}

const CARD_HALF_WIDTH = 130;
const CARD_HALF_HEIGHT = 64;

function getCardCenter(card: AuraCard): CardPosition {
  return {
    x: card.position.x + CARD_HALF_WIDTH,
    y: card.position.y + CARD_HALF_HEIGHT,
  };
}

function buildCubicBezierPath(from: CardPosition, to: CardPosition): {
  path: string;
  midX: number;
  midY: number;
} {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy);
  const curvature = Math.min(140, Math.max(40, dist * 0.28));

  // Gentle astronomical arc
  const c1x = from.x + dx * 0.35;
  const c1y = from.y + dy * 0.15 - curvature * 0.35;
  const c2x = from.x + dx * 0.65;
  const c2y = to.y - dy * 0.15 - curvature * 0.35;

  const midX = (from.x + 3 * c1x + 3 * c2x + to.x) / 8;
  const midY = (from.y + 3 * c1y + 3 * c2y + to.y) / 8;

  return {
    path: `M ${from.x} ${from.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${to.x} ${to.y}`,
    midX,
    midY,
  };
}

export const ConnectionLayer: React.FC<ConnectionLayerProps> = ({
  cards,
  connections,
  selectedCardId,
  connectingFromCardId,
  pointerWorldPos,
  performanceMode,
  reducedMotion,
  onDeleteConnection,
}) => {
  const cardMap = React.useMemo(
    () => new Map<string, AuraCard>(cards.map((c) => [c.id, c])),
    [cards]
  );

  const connectingSource = connectingFromCardId
    ? cardMap.get(connectingFromCardId)
    : undefined;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '4000px',
        height: '4000px',
        overflow: 'visible',
        pointerEvents: 'none',
        zIndex: 1,
      }}
      aria-label="Capa de conexiones de la constelación"
    >
      <defs>
        <linearGradient id="aura-conn-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--accent-amethyst)" stopOpacity="0.72" />
          <stop offset="50%" stopColor="var(--accent-gold)" stopOpacity="0.82" />
          <stop offset="100%" stopColor="var(--accent-sage)" stopOpacity="0.72" />
        </linearGradient>
      </defs>

      {connections.map((conn) => {
        const fromCard = cardMap.get(conn.fromCardId);
        const toCard = cardMap.get(conn.toCardId);
        if (!fromCard || !toCard) return null;

        const fromCenter = getCardCenter(fromCard);
        const toCenter = getCardCenter(toCard);
        const { path, midX, midY } = buildCubicBezierPath(fromCenter, toCenter);

        const isHighlighted =
          selectedCardId === conn.fromCardId ||
          selectedCardId === conn.toCardId ||
          connectingFromCardId === conn.fromCardId ||
          connectingFromCardId === conn.toCardId;

        return (
          <g key={conn.id}>
            {/* Subtle outer glow on active connections when not in performance mode */}
            {isHighlighted && !performanceMode && (
              <path
                d={path}
                fill="none"
                stroke="var(--accent-amethyst)"
                strokeOpacity="0.22"
                strokeWidth="6"
                strokeLinecap="round"
              />
            )}

            {/* Main cubic Bézier stroke */}
            <path
              d={path}
              fill="none"
              stroke={
                isHighlighted
                  ? 'url(#aura-conn-gradient)'
                  : 'var(--canvas-connection-line)'
              }
              strokeWidth={isHighlighted ? 2.4 : 1.65}
              strokeDasharray={isHighlighted ? 'none' : '5 5'}
              strokeLinecap="round"
            />

            {/* Endpoint star anchor dots */}
            <circle
              cx={fromCenter.x}
              cy={fromCenter.y}
              r={3}
              fill="var(--accent-amethyst)"
            />
            <circle
              cx={toCenter.x}
              cy={toCenter.y}
              r={3}
              fill="var(--accent-gold)"
            />

            {/* Interactive Midpoint Badge (Label + Click to Remove Connection) */}
            {(!performanceMode || isHighlighted || conn.label) && (
              <g
                transform={`translate(${midX}, ${midY})`}
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConnection(conn.id);
                }}
                role="button"
                tabIndex={0}
                aria-label={`Conexión ${conn.label || 'activa'}. Clic para eliminar conexión`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    onDeleteConnection(conn.id);
                  }
                }}
              >
                <title>Tocá para desvincular esta conexión ({conn.label || 'enlace'})</title>
                <rect
                  x={-38}
                  y={-11}
                  width={76}
                  height={22}
                  rx={11}
                  fill="var(--bg-elevated)"
                  stroke={isHighlighted ? 'var(--accent-amethyst)' : 'var(--border-subtle)'}
                  strokeWidth={1}
                />
                <text
                  x={0}
                  y={3.5}
                  textAnchor="middle"
                  fill="var(--text-secondary)"
                  fontSize="10"
                  fontWeight="600"
                >
                  {conn.label ? `${conn.label} ×` : 'vínculo ×'}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Live Interactive Guide Line when in "Connect" Mode */}
      {connectingSource && pointerWorldPos && (
        <g>
          <path
            d={buildCubicBezierPath(getCardCenter(connectingSource), pointerWorldPos).path}
            fill="none"
            stroke="var(--accent-gold)"
            strokeWidth="2.4"
            strokeDasharray={reducedMotion ? '4 4' : '7 5'}
            strokeLinecap="round"
          />
          <circle
            cx={pointerWorldPos.x}
            cy={pointerWorldPos.y}
            r="6"
            fill="var(--accent-gold)"
            fillOpacity="0.85"
          />
        </g>
      )}
    </svg>
  );
};

export default ConnectionLayer;
