import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  Layers,
  LayoutGrid,
  Search,
  Star,
  X,
} from 'lucide-react';
import { useAura } from '../../state/AuraContext';
import type { AuraCard, CardColor, CardType } from '../../types/aura';

type QuickFilterMode = 'all' | 'favorites' | 'pending' | 'recent';
type SortMode = 'recent' | 'alphabetical' | 'color' | 'connections';

const COLOR_PRIORITY: Record<CardColor, number> = {
  amethyst: 1,
  gold: 2,
  sage: 3,
  coral: 4,
  neutral: 5,
};

const TYPE_LABELS: Record<CardType, string> = {
  idea: 'Idea',
  message: 'Mensaje TG',
  link: 'Enlace',
  task: 'Tarea',
  reference: 'Referencia',
};

export const LibraryView: React.FC = () => {
  const {
    constellations,
    activeConstellationId,
    cards,
    connections,
    selectConstellation,
    selectCard,
    focusCardOnCanvas,
    toggleCardFavorite,
    cycleCardStatus,
  } = useAura();

  const [scope, setScope] = useState<'active' | 'all'>('active');
  const [query, setQuery] = useState<string>('');
  const [quickFilter, setQuickFilter] = useState<QuickFilterMode>('all');
  const [typeFilter, setTypeFilter] = useState<CardType | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortMode>('recent');
  const [groupByCluster, setGroupByCluster] = useState<boolean>(false);

  const connectionCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const conn of connections) {
      map.set(conn.fromCardId, (map.get(conn.fromCardId) ?? 0) + 1);
      map.set(conn.toCardId, (map.get(conn.toCardId) ?? 0) + 1);
    }
    return map;
  }, [connections]);

  const constellationNameMap = useMemo(
    () => new Map(constellations.map((c) => [c.id, c.name])),
    [constellations]
  );

  const scopedCards = useMemo(
    () =>
      scope === 'active'
        ? cards.filter((c) => c.constellationId === activeConstellationId)
        : cards,
    [cards, scope, activeConstellationId]
  );

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const c of scopedCards) {
      for (const t of c.tags) set.add(t);
    }
    return Array.from(set).slice(0, 16);
  }, [scopedCards]);

  const filteredAndSortedCards = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = scopedCards.filter((card) => {
      if (quickFilter === 'favorites' && !card.favorite) return false;
      if (quickFilter === 'pending' && card.status !== 'pending') return false;
      if (typeFilter !== 'all' && card.type !== typeFilter) return false;
      if (tagFilter && !card.tags.includes(tagFilter)) return false;

      if (q) {
        const hit =
          card.title.toLowerCase().includes(q) ||
          card.content.toLowerCase().includes(q) ||
          card.notes.toLowerCase().includes(q) ||
          (card.cluster && card.cluster.toLowerCase().includes(q)) ||
          card.tags.some((t) => t.toLowerCase().includes(q));
        if (!hit) return false;
      }

      return true;
    });

    list.sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title, 'es');
      }
      if (sortBy === 'color') {
        return COLOR_PRIORITY[a.color] - COLOR_PRIORITY[b.color];
      }
      if (sortBy === 'connections') {
        return (
          (connectionCountMap.get(b.id) ?? 0) -
          (connectionCountMap.get(a.id) ?? 0)
        );
      }
      return b.updatedAt.localeCompare(a.updatedAt);
    });

    if (quickFilter === 'recent') {
      return list.slice(0, 8);
    }
    return list;
  }, [scopedCards, query, quickFilter, typeFilter, tagFilter, sortBy, connectionCountMap]);

  const groupedSections = useMemo(() => {
    if (!groupByCluster) {
      return [{ groupTitle: 'Todas las tarjetas', items: filteredAndSortedCards }];
    }
    const map = new Map<string, AuraCard[]>();
    for (const card of filteredAndSortedCards) {
      const key = card.cluster || TYPE_LABELS[card.type] || 'General';
      const arr = map.get(key) ?? [];
      arr.push(card);
      map.set(key, arr);
    }
    return Array.from(map.entries()).map(([groupTitle, items]) => ({
      groupTitle,
      items,
    }));
  }, [filteredAndSortedCards, groupByCluster]);

  return (
    <main
      className="aura-scrollable-view"
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'calc(16px + var(--safe-top)) 16px 130px',
        paddingBottom: '130px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      data-testid="library-screen"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Header & Constellation Scope Switch */}
        <header
          className="aura-glass-panel"
          style={{
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.35rem',
                  fontWeight: 700,
                }}
              >
                Biblioteca Editorial
              </h1>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Explorá, filtrá y gestioná tus ideas sin depender del mapa espacial.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setScope('active')}
                className={`aura-btn ${scope === 'active' ? 'aura-btn-primary' : ''}`.trim()}
                style={{ minHeight: '34px', fontSize: '0.8rem', padding: '5px 12px' }}
              >
                Constelación activa
              </button>
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`aura-btn ${scope === 'all' ? 'aura-btn-primary' : ''}`.trim()}
                style={{ minHeight: '34px', fontSize: '0.8rem', padding: '5px 12px' }}
              >
                Todo el Universo ({cards.length})
              </button>
            </div>
          </div>

          {scope === 'active' && (
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
              {constellations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectConstellation(c.id)}
                  className="aura-tag"
                  style={{
                    cursor: 'pointer',
                    padding: '4px 10px',
                    backgroundColor:
                      c.id === activeConstellationId
                        ? 'var(--accent-amethyst)'
                        : 'var(--bg-elevated)',
                    color:
                      c.id === activeConstellationId
                        ? 'var(--text-on-accent)'
                        : 'var(--text-secondary)',
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {/* Search Input & Sort Selector */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por título, contenido, notas o #etiqueta..."
                aria-label="Buscar en la biblioteca"
                className="aura-input"
                style={{ paddingLeft: '34px' }}
                data-testid="library-search-input"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Limpiar búsqueda"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              aria-label="Ordenar tarjetas por"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortMode)}
              className="aura-select"
              style={{ width: 'auto', minWidth: '185px' }}
              data-testid="library-sort-select"
            >
              <option value="recent">Ordenar: Recientes</option>
              <option value="alphabetical">Ordenar: Alfabético A-Z</option>
              <option value="color">Ordenar: Por Color / Prioridad</option>
              <option value="connections">Ordenar: Por Conexiones</option>
            </select>

            <button
              type="button"
              onClick={() => setGroupByCluster((prev) => !prev)}
              className={`aura-btn ${groupByCluster ? 'aura-btn-primary' : ''}`.trim()}
              style={{ minHeight: '40px', padding: '8px 12px', fontSize: '0.82rem' }}
              aria-label="Alternar vista agrupada por clúster"
              data-testid="library-toggle-group-btn"
            >
              {groupByCluster ? <Layers size={15} /> : <LayoutGrid size={15} />}
              {groupByCluster ? 'Agrupado por Clúster' : 'Cuadrícula continua'}
            </button>
          </div>

          {/* Quick Filters & Type Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setQuickFilter('all')}
              className={`aura-tag ${quickFilter === 'all' ? 'is-active' : ''}`}
              style={{
                cursor: 'pointer',
                padding: '4px 10px',
                backgroundColor:
                  quickFilter === 'all' ? 'var(--accent-amethyst)' : 'var(--bg-elevated)',
                color:
                  quickFilter === 'all' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
              }}
            >
              Todas
            </button>

            <button
              type="button"
              onClick={() => setQuickFilter('favorites')}
              className="aura-tag"
              style={{
                cursor: 'pointer',
                padding: '4px 10px',
                backgroundColor:
                  quickFilter === 'favorites' ? 'var(--accent-gold)' : 'var(--bg-elevated)',
                color:
                  quickFilter === 'favorites'
                    ? 'var(--text-on-accent)'
                    : 'var(--text-secondary)',
              }}
              data-testid="filter-favorites-btn"
            >
              Favoritos ★
            </button>

            <button
              type="button"
              onClick={() => setQuickFilter('pending')}
              className="aura-tag"
              style={{
                cursor: 'pointer',
                padding: '4px 10px',
                backgroundColor:
                  quickFilter === 'pending' ? 'var(--accent-coral)' : 'var(--bg-elevated)',
                color:
                  quickFilter === 'pending'
                    ? 'var(--text-on-accent)'
                    : 'var(--text-secondary)',
              }}
              data-testid="filter-pending-btn"
            >
              Pendientes ⏳
            </button>

            <button
              type="button"
              onClick={() => setQuickFilter('recent')}
              className="aura-tag"
              style={{
                cursor: 'pointer',
                padding: '4px 10px',
                backgroundColor:
                  quickFilter === 'recent' ? 'var(--accent-sage)' : 'var(--bg-elevated)',
                color:
                  quickFilter === 'recent'
                    ? 'var(--text-on-accent)'
                    : 'var(--text-secondary)',
              }}
            >
              Tarjetas recientes
            </button>

            <span style={{ color: 'var(--border-strong)', margin: '0 4px' }}>|</span>

            {(['all', 'idea', 'message', 'link', 'task', 'reference'] as const).map(
              (t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className="aura-tag"
                  style={{
                    cursor: 'pointer',
                    padding: '4px 9px',
                    borderColor:
                      typeFilter === t ? 'var(--accent-amethyst)' : 'var(--border-subtle)',
                    color:
                      typeFilter === t ? 'var(--accent-amethyst)' : 'var(--text-secondary)',
                  }}
                >
                  {t === 'all' ? 'Todos los tipos' : TYPE_LABELS[t]}
                </button>
              )
            )}
          </div>

          {/* Interactive #Tags Filter Row */}
          {allTags.length > 0 && (
            <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '2px' }}>
              {allTags.map((tag) => {
                const active = tagFilter === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setTagFilter(active ? null : tag)}
                    className="aura-tag"
                    style={{
                      cursor: 'pointer',
                      backgroundColor: active
                        ? 'var(--accent-amethyst)'
                        : 'var(--bg-elevated)',
                      color: active ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                    }}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          )}
        </header>

        {/* Results Grid / Grouped View */}
        {filteredAndSortedCards.length === 0 ? (
          <div
            className="aura-glass-panel"
            style={{
              padding: '36px 20px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            No se encontraron tarjetas con los filtros seleccionados.
          </div>
        ) : (
          groupedSections.map((section) => (
            <section
              key={section.groupTitle}
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              {groupByCluster && (
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.96rem',
                    fontWeight: 700,
                    color: 'var(--accent-gold)',
                    letterSpacing: '0.03em',
                  }}
                >
                  {section.groupTitle} ({section.items.length})
                </h2>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(275px, 1fr))',
                  gap: '12px',
                }}
              >
                {section.items.map((card) => {
                  const connCount = connectionCountMap.get(card.id) ?? 0;
                  return (
                    <article
                      key={card.id}
                      className="aura-card"
                      data-color={card.color}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                      data-testid={`library-card-${card.id}`}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                            }}
                          >
                            {TYPE_LABELS[card.type]}
                            {card.cluster ? ` · ${card.cluster}` : ''}
                            {scope === 'all'
                              ? ` · ${constellationNameMap.get(card.constellationId) ?? ''}`
                              : ''}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => void cycleCardStatus(card.id)}
                              className="aura-tag"
                              style={{ cursor: 'pointer', fontSize: '0.68rem' }}
                              title="Cambiar estado (Activa / Pendiente / Completada)"
                            >
                              {card.status === 'pending' ? (
                                <>
                                  <Clock size={11} /> Pendiente
                                </>
                              ) : card.status === 'completed' ? (
                                <>
                                  <CheckCircle2 size={11} /> Completada
                                </>
                              ) : (
                                'Activa'
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => void toggleCardFavorite(card.id)}
                              aria-label={
                                card.favorite ? 'Quitar favorito' : 'Marcar favorito'
                              }
                              style={{
                                padding: '4px',
                                color: card.favorite
                                  ? 'var(--accent-gold)'
                                  : 'var(--text-muted)',
                              }}
                            >
                              <Star
                                size={15}
                                fill={card.favorite ? 'currentColor' : 'none'}
                              />
                            </button>
                          </div>
                        </div>

                        <h3
                          onClick={() => selectCard(card.id)}
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            lineHeight: 1.3,
                          }}
                        >
                          {card.title}
                        </h3>

                        <p
                          style={{
                            fontSize: '0.84rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.45,
                          }}
                        >
                          {card.content}
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {card.tags.map((tag) => (
                            <span key={tag} className="aura-tag" style={{ fontSize: '0.7rem' }}>
                              #{tag}
                            </span>
                          ))}
                          {connCount > 0 && (
                            <span
                              className="aura-tag"
                              style={{ fontSize: '0.7rem', color: 'var(--accent-amethyst)' }}
                            >
                              {connCount} conex.
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                            borderTop: '1px solid var(--border-subtle)',
                            paddingTop: '8px',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => selectCard(card.id)}
                            className="aura-btn"
                            style={{
                              minHeight: '32px',
                              padding: '4px 10px',
                              fontSize: '0.78rem',
                            }}
                            data-testid={`library-open-detail-${card.id}`}
                          >
                            Editar detalles
                          </button>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            {card.sourceUrl && (
                              <a
                                href={card.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="aura-btn aura-btn-ghost"
                                style={{
                                  minHeight: '32px',
                                  padding: '4px 8px',
                                  fontSize: '0.76rem',
                                }}
                                title="Abrir enlace original"
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => focusCardOnCanvas(card.id)}
                              className="aura-btn aura-btn-ghost"
                              style={{
                                minHeight: '32px',
                                padding: '4px 10px',
                                fontSize: '0.78rem',
                                color: 'var(--accent-amethyst)',
                              }}
                              data-testid={`library-view-canvas-${card.id}`}
                            >
                              <Compass size={13} /> Ver en el lienzo
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  );
};

export default LibraryView;
