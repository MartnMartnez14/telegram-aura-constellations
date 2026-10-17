import React, { useState } from 'react';
import {
  ArrowRight,
  Compass,
  Play,
  Sparkles,
  Sun,
  MessageSquare,
  Link2,
  Lightbulb,
} from 'lucide-react';
import { AuraLogo } from '../branding/AuraLogo';
import { useAura } from '../../state/AuraContext';
import { triggerHaptic } from '../../services/telegramBridge';

interface MiniStarNode {
  id: string;
  label: string;
  subtitle: string;
  tag: string;
  color: string;
  x: number;
  y: number;
  connectedTo: string[];
}

const MINI_NODES: MiniStarNode[] = [
  {
    id: 'm1',
    label: 'Nota de @elena_design',
    subtitle: '«Inercia táctil de 220ms sobre cristal esmerilado»',
    tag: '#telegram',
    color: '#D9BC80',
    x: 85,
    y: 44,
    connectedTo: ['m2', 'm3'],
  },
  {
    id: 'm2',
    label: 'Sistema Visual AURA',
    subtitle: 'Paleta Midnight Amethyst + contraste WCAG AA',
    tag: '#diseño',
    color: '#A997DF',
    x: 245,
    y: 38,
    connectedTo: ['m1', 'm4'],
  },
  {
    id: 'm3',
    label: 'API Telegram Mini Apps',
    subtitle: 'ThemeParams, SafeAreaInset & HapticFeedback nativo',
    tag: '#docs',
    color: '#94BFB2',
    x: 115,
    y: 120,
    connectedTo: ['m1', 'm4'],
  },
  {
    id: 'm4',
    label: 'Prototipo Interactivo 60 FPS',
    subtitle: 'Curvas geodésicas y persistencia local IndexedDB',
    tag: '#entrega',
    color: '#E29587',
    x: 268,
    y: 116,
    connectedTo: ['m2', 'm3'],
  },
];

const MINI_EDGES: Array<[string, string, string]> = [
  ['m1', 'm2', 'inspira'],
  ['m1', 'm3', 'captura'],
  ['m2', 'm4', 'define'],
  ['m3', 'm4', 'impulsa'],
];

export const WelcomeScreen: React.FC = () => {
  const {
    constellations,
    setCurrentScreen,
    selectConstellation,
    startGuidedDemo,
  } = useAura();

  const [activeMiniId, setActiveMiniId] = useState<string>('m2');
  const activeMiniNode =
    MINI_NODES.find((n) => n.id === activeMiniId) ?? MINI_NODES[0];

  const handleSelectMini = (id: string) => {
    setActiveMiniId(id);
    triggerHaptic('light');
  };

  const handleExploreUniverse = () => {
    setCurrentScreen('universe');
  };

  const handleOpenDemoConstellation = (constellationId: string) => {
    selectConstellation(constellationId);
    setCurrentScreen('universe');
  };

  const getConstellationIcon = (icon: string) => {
    if (icon === 'compass') return <Compass size={16} />;
    if (icon === 'sun') return <Sun size={16} />;
    return <Sparkles size={16} />;
  };

  return (
    <main
      className="aura-scrollable-view aura-welcome-view"
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'calc(10px + var(--safe-top)) 18px 130px',
        paddingBottom: '130px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      data-testid="welcome-screen"
    >
      <div
        className="aura-welcome-container"
        style={{
          width: '100%',
          maxWidth: '680px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* Top Hero Card */}
        <section
          className="aura-glass-panel aura-welcome-hero"
          style={{
            padding: '12px 18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '6px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <span
            className="aura-tag"
            style={{
              color: 'var(--accent-amethyst)',
              borderColor: 'var(--border-strong)',
              fontSize: '0.7rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            <Sparkles size={11} /> Telegram Mini App &amp; Web Concept
          </span>

          <AuraLogo size={40} animated />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.35rem, 3.2vw, 1.8rem)',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
              }}
            >
              Telegram AURA — Constellations
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.96rem',
                fontWeight: 600,
                color: 'var(--accent-gold)',
              }}
            >
              Tus ideas, conectadas.
            </p>
          </div>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.86rem',
              maxWidth: '520px',
              lineHeight: 1.4,
            }}
          >
            Transformá mensajes valiosos, enlaces y notas de Telegram en un universo visual
            sereno donde cada idea encuentra su conexión.
          </p>

          {/* Primary & Secondary CTAs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center',
              width: '100%',
              marginTop: '2px',
            }}
          >
            <button
              type="button"
              onClick={handleExploreUniverse}
              className="aura-btn aura-btn-primary"
              style={{ minWidth: '175px', minHeight: '34px', padding: '6px 16px', fontSize: '0.85rem' }}
              data-testid="explore-aura-btn"
            >
              Explorar AURA <ArrowRight size={15} />
            </button>

            <button
              type="button"
              onClick={() => void startGuidedDemo()}
              className="aura-btn"
              style={{ minWidth: '195px', minHeight: '34px', padding: '6px 14px', fontSize: '0.85rem' }}
              data-testid="guided-demo-btn"
            >
              <Play size={14} /> Probar demostración guiada
            </button>
          </div>
        </section>

        {/* Live Interactive Mini-Constellation Preview */}
        <section
          className="aura-glass-panel aura-welcome-mini-section"
          style={{
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
          aria-label="Demostración interactiva de constelación"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Mini-constelación en vivo · Tocá una estrella para iluminar sus conexiones
            </span>
            <span className="aura-tag" style={{ color: 'var(--accent-gold)' }}>
              Interactivo
            </span>
          </div>

          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '185px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background:
                'radial-gradient(circle at 35% 35%, rgba(169, 151, 223, 0.14), transparent 65%), var(--bg-canvas)',
              overflow: 'hidden',
              padding: '6px 8px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <svg
              viewBox="0 0 360 155"
              className="aura-welcome-mini-svg"
              style={{ width: '100%', height: '122px', display: 'block', flexShrink: 0 }}
              role="img"
              aria-label="Lienzo miniatura con 4 ideas conectadas"
            >
              {MINI_EDGES.map(([fromId, toId, edgeLabel]) => {
                const from = MINI_NODES.find((n) => n.id === fromId)!;
                const to = MINI_NODES.find((n) => n.id === toId)!;
                const isHighlighted =
                  activeMiniId === fromId || activeMiniId === toId;
                const midX = (from.x + to.x) / 2;
                const midY = (from.y + to.y) / 2 - 14;

                return (
                  <g key={`${fromId}-${toId}`}>
                    <path
                      d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
                      fill="none"
                      stroke={isHighlighted ? '#A997DF' : 'rgba(158, 152, 179, 0.28)'}
                      strokeWidth={isHighlighted ? 2.4 : 1.3}
                      strokeDasharray={isHighlighted ? 'none' : '4 4'}
                    />
                    {isHighlighted && (
                      <text
                        x={midX}
                        y={midY + 4}
                        textAnchor="middle"
                        fill="var(--text-secondary)"
                        fontSize="9"
                        fontWeight="600"
                      >
                        {edgeLabel}
                      </text>
                    )}
                  </g>
                );
              })}

              {MINI_NODES.map((node) => {
                const isSelected = node.id === activeMiniId;
                const isNeighbor = activeMiniNode.connectedTo.includes(node.id);

                return (
                  <g
                    key={node.id}
                    onClick={() => handleSelectMini(node.id)}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Seleccionar nodo ${node.label}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectMini(node.id);
                      }
                    }}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? 22 : isNeighbor ? 16 : 12}
                      fill={node.color}
                      fillOpacity={isSelected ? 0.28 : 0.12}
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? 8.5 : 6.5}
                      fill={node.color}
                      stroke="#F4F0F8"
                      strokeWidth={isSelected ? 2 : 1}
                    />
                    <text
                      x={node.x}
                      y={node.y + 22}
                      textAnchor="middle"
                      fill="var(--text-primary)"
                      fontSize="10.5"
                      fontWeight={isSelected ? '700' : '500'}
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Selected Mini Node Callout */}
            <div
              style={{
                marginTop: '2px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                  {activeMiniNode.label}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {activeMiniNode.subtitle}
                </span>
              </div>
              <span className="aura-tag">{activeMiniNode.tag}</span>
            </div>
          </div>
        </section>

        {/* Direct Access to the 3 Example Constellations */}
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.94rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              Acceso directo a constelaciones de ejemplo
            </h2>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              3 espacios precargados
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px',
            }}
          >
            {constellations.slice(0, 3).map((constellation) => (
              <button
                key={constellation.id}
                type="button"
                onClick={() => handleOpenDemoConstellation(constellation.id)}
                className="aura-card"
                data-color={constellation.accentColor}
                style={{
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '11px 14px',
                  cursor: 'pointer',
                }}
                data-testid={`welcome-constellation-${constellation.id}`}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '0.96rem',
                      }}
                    >
                      {getConstellationIcon(constellation.icon)}
                      {constellation.name}
                    </span>
                    <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45,
                    }}
                  >
                    {constellation.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span className="aura-tag" style={{ fontSize: '0.7rem' }}>
                    Abrir constelación
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Quick 3-Pillar Summary */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '8px',
          }}
        >
          <div className="aura-glass-panel" style={{ padding: '8px 12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <MessageSquare size={16} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block' }}>Captura de Telegram</strong>
              Pegá enlaces <code style={{ fontFamily: 'var(--font-mono)' }}>t.me</code> o mensajes reenviados.
            </div>
          </div>

          <div className="aura-glass-panel" style={{ padding: '8px 12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link2 size={16} style={{ color: 'var(--accent-amethyst)', flexShrink: 0 }} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block' }}>Trazos Geodésicos</strong>
              Relacioná ideas con curvas vivas a 60 FPS.
            </div>
          </div>

          <div className="aura-glass-panel" style={{ padding: '8px 12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Lightbulb size={16} style={{ color: 'var(--accent-sage)', flexShrink: 0 }} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block' }}>Local-First Privado</strong>
              Guardado instantáneo en IndexedDB y respaldo JSON.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default WelcomeScreen;
