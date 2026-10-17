import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Crosshair,
  Edit3,
  Link2,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';
import { useAura } from '../../state/AuraContext';
import type { AuraCard, CardColor, CardPosition, CardType } from '../../types/aura';
import { parseTelegramInput } from '../../services/telegramBridge';
import { ConnectionLayer } from './ConnectionLayer';
import { ConstellationNode } from './ConstellationNode';

export interface UniverseCanvasProps {
  onOpenNewConstellationModal: () => void;
  onOpenEditConstellationModal: () => void;
}

interface ClusterHaloBox {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: CardColor;
}

const MIN_ZOOM = 0.34;
const MAX_ZOOM = 2.2;

export const UniverseCanvas: React.FC<UniverseCanvasProps> = ({
  onOpenNewConstellationModal,
  onOpenEditConstellationModal,
}) => {
  const {
    constellations,
    activeConstellation,
    activeCards,
    activeConnections,
    selectedCardId,
    connectingFromCardId,
    focusedCardId,
    searchQuery,
    activeTagFilter,
    settings,
    effectiveReducedMotion,
    selectConstellation,
    selectCard,
    clearFocusedCard,
    setSearchQuery,
    setActiveTagFilter,
    createCard,
    updateCardPosition,
    toggleCardFavorite,
    startConnecting,
    completeConnection,
    removeConnection,
    autoArrangeActiveConstellation,
    showToast,
  } = useAura();

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [pan, setPan] = useState<CardPosition>({ x: 40, y: 30 });
  const [zoom, setZoom] = useState<number>(0.88);
  const [pointerWorldPos, setPointerWorldPos] = useState<CardPosition | null>(null);

  // Quick Capture / Telegram Smart Modal State
  const [isCaptureOpen, setIsCaptureOpen] = useState<boolean>(false);
  const [rawTelegramText, setRawTelegramText] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newType, setNewType] = useState<CardType>('idea');
  const [newColor, setNewColor] = useState<CardColor>('amethyst');
  const [newTags, setNewTags] = useState<string>('telegram, idea');
  const [newCluster, setNewCluster] = useState<string>('Concepto');
  const [newSourceUrl, setNewSourceUrl] = useState<string>('');

  const panGestureRef = useRef<{
    active: boolean;
    pointerId: number;
    startClientX: number;
    startClientY: number;
    originPanX: number;
    originPanY: number;
  } | null>(null);

  // Center camera on focusedCardId when triggered from Library or Creation
  useEffect(() => {
    if (!focusedCardId) return;
    const card = activeCards.find((c) => c.id === focusedCardId);
    if (card && viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const targetZoom = Math.max(0.85, Math.min(1.15, zoom));
      const nextPanX = rect.width / 2 - (card.position.x + 130) * targetZoom;
      const nextPanY = rect.height / 2 - (card.position.y + 65) * targetZoom;
      setZoom(targetZoom);
      setPan({ x: Math.round(nextPanX), y: Math.round(nextPanY) });
    }
    clearFocusedCard();
  }, [focusedCardId, activeCards, zoom, clearFocusedCard]);

  // Escape key cancels Connect Mode or Capture Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (connectingFromCardId) {
          startConnecting(null);
        }
        if (isCaptureOpen) {
          setIsCaptureOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [connectingFromCardId, isCaptureOpen, startConnecting]);

  // Fit or center constellation on screen
  const fitCanvasToCards = useCallback(() => {
    const container = viewportRef.current;
    if (!container || activeCards.length === 0) {
      setPan({ x: 60, y: 40 });
      setZoom(0.95);
      return;
    }

    const viewW = container.clientWidth || container.getBoundingClientRect().width;
    const viewH = container.clientHeight || container.getBoundingClientRect().height;
    if (viewW === 0 || viewH === 0) return;

    const isMobile = viewW < 640;

    // Include cluster halo margins so dotted borders and labels also fit cleanly
    const padLeft = settings.showClusterHalos ? 36 : 16;
    const padRight = settings.showClusterHalos ? 36 : 16;
    const padTop = settings.showClusterHalos ? 42 : 16;
    const padBottom = settings.showClusterHalos ? 34 : 16;

    const minX = Math.min(...activeCards.map((c) => c.position.x)) - padLeft;
    const maxX = Math.max(...activeCards.map((c) => c.position.x + 260)) + padRight;
    const minY = Math.min(...activeCards.map((c) => c.position.y)) - padTop;
    const maxY = Math.max(...activeCards.map((c) => c.position.y + 145)) + padBottom;

    const contentW = Math.max(320, maxX - minX);
    const contentH = Math.max(240, maxY - minY);

    // Reserve space for top bar (topInset), bottom dock (bottomInset) and floating right controls (rightInset)
    const topInset = isMobile ? 175 : 120;
    const bottomInset = 96;
    const rightInset = 64;
    const leftInset = isMobile ? 12 : 24;

    const fullH = window.innerHeight || viewH + topInset;
    const headerAlreadyExcluded = viewH <= fullH - 80;
    const effectiveTopSafe = headerAlreadyExcluded ? (isMobile ? 14 : 20) : topInset;

    const availW = Math.max(180, viewW - leftInset - rightInset);
    const availH = Math.max(180, viewH - effectiveTopSafe - bottomInset);

    const minAllowedZoom = isMobile ? 0.34 : 0.42;
    const rawZoom = Math.min(availW / contentW, availH / contentH);
    const fitZoom = Math.min(1.0, Math.max(minAllowedZoom, rawZoom));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const safeCenterX = leftInset + availW / 2;
    const safeCenterY = effectiveTopSafe + availH / 2;

    const scaledW = contentW * fitZoom;
    const nextPanX =
      scaledW > availW
        ? Math.round(leftInset - minX * fitZoom)
        : Math.round(safeCenterX - centerX * fitZoom);

    setZoom(Number(fitZoom.toFixed(2)));
    setPan({
      x: nextPanX,
      y: Math.round(safeCenterY - centerY * fitZoom),
    });
  }, [activeCards, settings.showClusterHalos]);

  const handleCenterMap = fitCanvasToCards;

  // Auto-fit when constellation changes or on mount / viewport resize
  useEffect(() => {
    fitCanvasToCards();
  }, [activeConstellation?.id, fitCanvasToCards]);

  useEffect(() => {
    const container = viewportRef.current;
    if (!container) return;

    let frameId: number | null = null;
    const triggerFit = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        fitCanvasToCards();
      });
    };

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => triggerFit())
        : null;

    if (observer) {
      observer.observe(container);
    }
    window.addEventListener('resize', triggerFit);

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      observer?.disconnect();
      window.removeEventListener('resize', triggerFit);
    };
  }, [fitCanvasToCards]);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 48, y: 36 });
  }, []);

  const adjustZoom = useCallback((delta: number) => {
    setZoom((prevZoom) => {
      const nextZoom = Number(
        Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prevZoom + delta)).toFixed(2)
      );
      if (nextZoom === prevZoom) return prevZoom;

      const container = viewportRef.current;
      if (container) {
        const viewW = container.clientWidth || container.getBoundingClientRect().width;
        const viewH = container.clientHeight || container.getBoundingClientRect().height;
        const isMobile = viewW < 640;
        const pivotX = isMobile ? (viewW - 46) / 2 : viewW / 2;
        const pivotY = (viewH - 70) / 2;

        setPan((prevPan) => {
          const worldX = (pivotX - prevPan.x) / prevZoom;
          const worldY = (pivotY - prevPan.y) / prevZoom;
          return {
            x: Math.round(pivotX - worldX * nextZoom),
            y: Math.round(pivotY - worldY * nextZoom),
          };
        });
      }
      return nextZoom;
    });
  }, []);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    adjustZoom(delta);
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-testid^="canvas-card-"]')) {
      return;
    }

    if (connectingFromCardId) {
      startConnecting(null);
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    panGestureRef.current = {
      active: true,
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      originPanX: pan.x,
      originPanY: pan.y,
    };
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (connectingFromCardId && viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const wx = (e.clientX - rect.left - pan.x) / zoom;
      const wy = (e.clientY - rect.top - pan.y) / zoom;
      setPointerWorldPos({ x: wx, y: wy });
    }

    const gesture = panGestureRef.current;
    if (!gesture || !gesture.active || gesture.pointerId !== e.pointerId) return;

    const dx = e.clientX - gesture.startClientX;
    const dy = e.clientY - gesture.startClientY;
    setPan({
      x: Math.round(gesture.originPanX + dx),
      y: Math.round(gesture.originPanY + dy),
    });
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const gesture = panGestureRef.current;
    if (!gesture || gesture.pointerId !== e.pointerId) return;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore capture errors
    }
    panGestureRef.current = null;
  };

  // Available tags & clusters in active constellation
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    for (const c of activeCards) {
      for (const t of c.tags) set.add(t);
    }
    return Array.from(set).slice(0, 12);
  }, [activeCards]);

  // Connection counts per card
  const connectionCountMap = useMemo(() => {
    const counts = new Map<string, number>();
    for (const conn of activeConnections) {
      counts.set(conn.fromCardId, (counts.get(conn.fromCardId) ?? 0) + 1);
      counts.set(conn.toCardId, (counts.get(conn.toCardId) ?? 0) + 1);
    }
    return counts;
  }, [activeConnections]);

  // Check if a card matches current search or tag filter
  const cardMatchSet = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const hasFilter = q.length > 0 || Boolean(activeTagFilter);
    if (!hasFilter) return null;

    const matched = new Set<string>();
    for (const card of activeCards) {
      const matchesQuery =
        !q ||
        card.title.toLowerCase().includes(q) ||
        card.content.toLowerCase().includes(q) ||
        card.notes.toLowerCase().includes(q) ||
        (card.cluster && card.cluster.toLowerCase().includes(q)) ||
        card.tags.some((t) => t.toLowerCase().includes(q));

      const matchesTag =
        !activeTagFilter || card.tags.includes(activeTagFilter);

      if (matchesQuery && matchesTag) {
        matched.add(card.id);
      }
    }
    return matched;
  }, [activeCards, searchQuery, activeTagFilter]);

  // Compute Cluster Halos when settings.showClusterHalos is enabled
  const clusterHalos = useMemo<ClusterHaloBox[]>(() => {
    if (!settings.showClusterHalos || settings.performanceMode) return [];
    const groups = new Map<string, AuraCard[]>();
    for (const card of activeCards) {
      if (!card.cluster) continue;
      const list = groups.get(card.cluster) ?? [];
      list.push(card);
      groups.set(card.cluster, list);
    }

    const boxes: ClusterHaloBox[] = [];
    for (const [name, groupCards] of groups.entries()) {
      if (groupCards.length === 0) continue;
      const minX = Math.min(...groupCards.map((c) => c.position.x)) - 34;
      const minY = Math.min(...groupCards.map((c) => c.position.y)) - 38;
      const maxX = Math.max(...groupCards.map((c) => c.position.x + 260)) + 34;
      const maxY = Math.max(...groupCards.map((c) => c.position.y + 135)) + 30;

      boxes.push({
        name,
        x: minX,
        y: minY,
        width: Math.max(300, maxX - minX),
        height: Math.max(190, maxY - minY),
        color: groupCards[0].color,
      });
    }
    return boxes;
  }, [activeCards, settings.showClusterHalos, settings.performanceMode]);

  // Handle smart Telegram paste autocomplete
  const handleParseTelegramPaste = (input: string) => {
    setRawTelegramText(input);
    if (!input.trim()) return;
    const parsed = parseTelegramInput(input);
    setNewTitle(parsed.title);
    setNewContent(parsed.content);
    setNewType(parsed.type);
    setNewTags(parsed.tags.join(', '));
    if (parsed.sourceUrl) {
      setNewSourceUrl(parsed.sourceUrl);
    }
    if (parsed.type === 'message') {
      setNewColor('gold');
    } else if (parsed.type === 'link') {
      setNewColor('sage');
    }
  };

  const handleCreateCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTelegram = rawTelegramText.trim()
      ? parseTelegramInput(rawTelegramText)
      : undefined;

    const finalTitle =
      newTitle.trim() || parsedTelegram?.title || 'Nueva estrella en AURA';
    const finalContent =
      newContent.trim() || parsedTelegram?.content || '';
    const tagArray = newTags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    await createCard({
      title: finalTitle,
      content: finalContent,
      type: newType,
      color: newColor,
      tags: tagArray.length > 0 ? tagArray : ['idea'],
      cluster: newCluster.trim() || undefined,
      sourceUrl: newSourceUrl.trim() || parsedTelegram?.sourceUrl,
      telegramMeta: parsedTelegram?.telegramMeta,
    });

    setRawTelegramText('');
    setNewTitle('');
    setNewContent('');
    setNewSourceUrl('');
    setIsCaptureOpen(false);
  };

  const handleToggleConnectToolbar = () => {
    if (connectingFromCardId) {
      startConnecting(null);
      return;
    }
    const startId = selectedCardId ?? activeCards[0]?.id ?? null;
    if (!startId) {
      showToast('Creá al menos dos tarjetas para conectarlas', 'warning');
      return;
    }
    startConnecting(startId);
  };

  return (
    <section
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
      data-testid="universe-screen"
    >
      {/* Contextual Observatory Header */}
      <header
        className="aura-glass-panel"
        style={{
          margin: 'calc(8px + var(--safe-top)) 12px 0',
          padding: '10px 14px',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* Top Row: Constellation Selector Pills + Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              maxWidth: '100%',
              paddingBottom: '2px',
            }}
            role="tablist"
            aria-label="Selector de Constelación"
          >
            {constellations.map((c) => {
              const isActive = c.id === activeConstellation?.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => selectConstellation(c.id)}
                  className={`aura-btn ${isActive ? 'aura-btn-primary' : ''}`.trim()}
                  style={{
                    minHeight: '34px',
                    padding: '5px 12px',
                    fontSize: '0.82rem',
                    borderRadius: 'var(--radius-pill)',
                    whiteSpace: 'nowrap',
                  }}
                  data-testid={`constellation-pill-${c.id}`}
                >
                  <Sparkles size={13} />
                  {c.name}
                </button>
              );
            })}

            <button
              type="button"
              onClick={onOpenNewConstellationModal}
              className="aura-btn"
              style={{
                minHeight: '34px',
                padding: '5px 11px',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-pill)',
                whiteSpace: 'nowrap',
              }}
              aria-label="Nueva constelación"
              data-testid="new-constellation-btn"
            >
              <Plus size={14} /> Nueva constelación
            </button>

            <button
              type="button"
              onClick={onOpenEditConstellationModal}
              className="aura-btn aura-btn-ghost"
              style={{
                minHeight: '34px',
                padding: '5px 9px',
                fontSize: '0.8rem',
              }}
              aria-label="Editar nombre y detalles de constelación"
              title="Editar constelación activa"
              data-testid="edit-constellation-btn"
            >
              <Edit3 size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsCaptureOpen(true)}
            className="aura-btn aura-btn-primary"
            style={{
              minHeight: '36px',
              padding: '6px 14px',
              fontSize: '0.84rem',
            }}
            data-testid="open-capture-modal-btn"
          >
            <Send size={14} /> Capturar de Telegram / + Nueva Tarjeta
          </button>
        </div>

        {/* Bottom Row: Live Search + Tag Filter Chips */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '170px' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ideas, mensajes o #etiquetas en el lienzo..."
              aria-label="Buscar tarjetas en el lienzo"
              className="aura-input"
              style={{
                padding: '6px 28px 6px 30px',
                fontSize: '0.82rem',
                minHeight: '32px',
              }}
              data-testid="canvas-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Limpiar búsqueda"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              overflowX: 'auto',
              maxWidth: '100%',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTagFilter(null)}
              className="aura-tag"
              style={{
                cursor: 'pointer',
                backgroundColor: !activeTagFilter
                  ? 'var(--accent-amethyst)'
                  : 'var(--bg-elevated)',
                color: !activeTagFilter
                  ? 'var(--text-on-accent)'
                  : 'var(--text-secondary)',
              }}
            >
              Todas ({activeCards.length})
            </button>
            {availableTags.map((tag) => {
              const isSelectedTag = activeTagFilter === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setActiveTagFilter(isSelectedTag ? null : tag)
                  }
                  className="aura-tag"
                  style={{
                    cursor: 'pointer',
                    backgroundColor: isSelectedTag
                      ? 'var(--accent-amethyst)'
                      : 'var(--bg-elevated)',
                    color: isSelectedTag
                      ? 'var(--text-on-accent)'
                      : 'var(--text-secondary)',
                  }}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Active Connect Mode Banner */}
      {connectingFromCardId && (
        <div
          className="aura-glass-panel"
          style={{
            margin: '8px 12px 0',
            padding: '8px 14px',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            borderColor: 'var(--accent-gold)',
          }}
          role="status"
          data-testid="connecting-mode-banner"
        >
          <span style={{ fontSize: '0.84rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
            ✨ Modo Conectar activo: Tocá otra tarjeta para trazar una conexión (o Esc / Cancelar)
          </span>
          <button
            type="button"
            onClick={() => startConnecting(null)}
            className="aura-btn"
            style={{ minHeight: '28px', padding: '4px 10px', fontSize: '0.76rem' }}
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Interactive 2D Viewport */}
      <div
        ref={viewportRef}
        className={`aura-canvas-viewport ${settings.showGrid ? 'has-grid' : ''}`.trim()}
        onWheel={handleWheel}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        data-testid="universe-viewport"
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transformOrigin: '0 0',
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            width: '4000px',
            height: '4000px',
            pointerEvents: 'auto',
          }}
        >
          {/* Astronomical Cluster Halos */}
          {clusterHalos.map((halo) => (
            <div
              key={halo.name}
              style={{
                position: 'absolute',
                left: `${halo.x}px`,
                top: `${halo.y}px`,
                width: `${halo.width}px`,
                height: `${halo.height}px`,
                borderRadius: '32px',
                border: '1px dashed var(--border-subtle)',
                background:
                  halo.color === 'gold'
                    ? 'radial-gradient(circle, var(--canvas-halo-gold), transparent 75%)'
                    : halo.color === 'sage'
                      ? 'radial-gradient(circle, var(--canvas-halo-sage), transparent 75%)'
                      : 'radial-gradient(circle, var(--canvas-halo-amethyst), transparent 75%)',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '16px',
                  background: 'var(--bg-canvas)',
                  padding: '2px 10px',
                  borderRadius: '999px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--text-muted)',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                }}
              >
                Clúster · {halo.name}
              </span>
            </div>
          ))}

          {/* SVG Bézier Connections */}
          <ConnectionLayer
            cards={activeCards}
            connections={activeConnections}
            selectedCardId={selectedCardId}
            connectingFromCardId={connectingFromCardId}
            pointerWorldPos={pointerWorldPos}
            performanceMode={settings.performanceMode}
            reducedMotion={effectiveReducedMotion}
            onDeleteConnection={(connId) => void removeConnection(connId)}
          />

          {/* Constellation Card Nodes */}
          {activeCards.map((card) => (
            <ConstellationNode
              key={card.id}
              card={card}
              zoom={zoom}
              isSelected={selectedCardId === card.id}
              isConnectingSource={connectingFromCardId === card.id}
              isConnectingMode={Boolean(connectingFromCardId)}
              isDimmed={cardMatchSet ? !cardMatchSet.has(card.id) : false}
              connectionCount={connectionCountMap.get(card.id) ?? 0}
              onSelect={(id) => selectCard(id)}
              onMove={(id, pos, persist) => void updateCardPosition(id, pos, persist)}
              onStartConnect={(id) => startConnecting(id)}
              onCompleteConnect={(targetId) => void completeConnection(targetId)}
              onToggleFavorite={(id) => void toggleCardFavorite(id)}
            />
          ))}
        </div>

        {/* Floating Observatory Controls */}
        <aside
          className="aura-glass-panel"
          aria-label="Controles flotantes del Observatorio"
          style={{
            position: 'absolute',
            right: '14px',
            bottom: 'calc(88px + var(--safe-bottom))',
            zIndex: 25,
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <button
            type="button"
            onClick={() => adjustZoom(0.14)}
            className="aura-btn"
            style={{ minHeight: '34px', padding: '6px 10px' }}
            aria-label="Acercar zoom"
            title="Acercar (+)"
            data-testid="zoom-in-btn"
          >
            <Plus size={15} />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="aura-btn aura-btn-ghost"
            style={{
              minHeight: '30px',
              padding: '4px 6px',
              fontSize: '0.74rem',
              fontFamily: 'var(--font-mono)',
            }}
            aria-label="Restablecer zoom al 100%"
            title="Restablecer zoom (100%)"
            data-testid="zoom-indicator-btn"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={() => adjustZoom(-0.14)}
            className="aura-btn"
            style={{ minHeight: '34px', padding: '6px 10px' }}
            aria-label="Alejar zoom"
            title="Alejar (-)"
            data-testid="zoom-out-btn"
          >
            <Minus size={15} />
          </button>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          <button
            type="button"
            onClick={handleCenterMap}
            className="aura-btn"
            style={{ minHeight: '34px', padding: '6px 10px' }}
            aria-label="Centrar mapa"
            title="Centrar constelación"
            data-testid="center-map-btn"
          >
            <Crosshair size={15} />
          </button>

          <button
            type="button"
            onClick={() => void autoArrangeActiveConstellation()}
            className="aura-btn"
            style={{ minHeight: '34px', padding: '6px 10px' }}
            aria-label="Reorganizar constelación automáticamente"
            title="Reorganizar constelación en geometría armónica"
            data-testid="auto-arrange-btn"
          >
            <Wand2 size={15} />
          </button>

          <button
            type="button"
            onClick={handleToggleConnectToolbar}
            className={`aura-btn ${connectingFromCardId ? 'aura-btn-primary' : ''}`.trim()}
            style={{ minHeight: '34px', padding: '6px 10px' }}
            aria-label="Alternar Modo Conectar"
            title="Modo Conectar tarjetas"
            data-testid="toggle-connect-mode-btn"
          >
            <Link2 size={15} />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="aura-btn"
            style={{ minHeight: '34px', padding: '6px 10px' }}
            aria-label="Restablecer vista inicial"
            title="Restablecer cámara"
          >
            <RotateCcw size={14} />
          </button>
        </aside>
      </div>

      {/* Modal: Smart Telegram Capture & New Card */}
      {isCaptureOpen && (
        <div
          className="aura-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Capturar de Telegram o crear nueva tarjeta"
          onClick={() => setIsCaptureOpen(false)}
        >
          <div
            className="aura-modal-surface"
            onClick={(e) => e.stopPropagation()}
            data-testid="capture-modal"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                }}
              >
                Capturar de Telegram / Nueva Tarjeta
              </h2>
              <button
                type="button"
                onClick={() => setIsCaptureOpen(false)}
                className="aura-btn aura-btn-ghost"
                aria-label="Cerrar ventana de captura"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => void handleCreateCardSubmit(e)}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {/* Smart Telegram Parser Box */}
              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <label
                  htmlFor="tg-raw-input"
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--accent-gold)',
                  }}
                >
                  Pegado inteligente de Telegram (opcional)
                </label>
                <textarea
                  id="tg-raw-input"
                  rows={2}
                  value={rawTelegramText}
                  onChange={(e) => handleParseTelegramPaste(e.target.value)}
                  placeholder='Ej: Reenviado de @elena_design: Nueva arquitectura visual https://t.me/designers/42 #ux #tma'
                  className="aura-textarea"
                  style={{ fontSize: '0.84rem' }}
                  data-testid="telegram-smart-input"
                />
                <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                  Detecta automáticamente autor (@canal), enlaces t.me, tipo de tarjeta y #etiquetas.
                </span>
              </div>

              <div>
                <label
                  htmlFor="card-title-input"
                  style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}
                >
                  Título *
                </label>
                <input
                  id="card-title-input"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Título de la idea, nota o mensaje..."
                  className="aura-input"
                  data-testid="new-card-title-input"
                />
              </div>

              <div>
                <label
                  htmlFor="card-content-input"
                  style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}
                >
                  Contenido principal
                </label>
                <textarea
                  id="card-content-input"
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Desarrollá la nota o síntesis del mensaje..."
                  className="aura-textarea"
                  data-testid="new-card-content-input"
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '10px',
                }}
              >
                <div>
                  <label
                    htmlFor="card-type-select"
                    style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}
                  >
                    Tipo
                  </label>
                  <select
                    id="card-type-select"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as CardType)}
                    className="aura-select"
                  >
                    <option value="idea">Idea</option>
                    <option value="message">Mensaje de Telegram</option>
                    <option value="link">Enlace</option>
                    <option value="task">Tarea</option>
                    <option value="reference">Referencia</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="card-color-select"
                    style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}
                  >
                    Color AURA
                  </label>
                  <select
                    id="card-color-select"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value as CardColor)}
                    className="aura-select"
                  >
                    <option value="amethyst">Midnight Amethyst</option>
                    <option value="gold">Champagne Gold</option>
                    <option value="sage">Sage Green</option>
                    <option value="coral">Soft Coral</option>
                    <option value="neutral">Obsidian Neutral</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '10px',
                }}
              >
                <div>
                  <label
                    htmlFor="card-tags-input"
                    style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}
                  >
                    Etiquetas (separadas por coma)
                  </label>
                  <input
                    id="card-tags-input"
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="ux, telegram, estrategia"
                    className="aura-input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="card-cluster-input"
                    style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}
                  >
                    Clúster / Grupo
                  </label>
                  <input
                    id="card-cluster-input"
                    type="text"
                    value={newCluster}
                    onChange={(e) => setNewCluster(e.target.value)}
                    placeholder="Concepto, Diseño, Entrega..."
                    className="aura-input"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="card-url-input"
                  style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}
                >
                  Enlace / Fuente (https://t.me/...)
                </label>
                <input
                  id="card-url-input"
                  type="url"
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  placeholder="https://t.me/canal/123"
                  className="aura-input"
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '6px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsCaptureOpen(false)}
                  className="aura-btn"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="aura-btn aura-btn-primary"
                  data-testid="submit-new-card-btn"
                >
                  Guardar en Constelación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default UniverseCanvas;
