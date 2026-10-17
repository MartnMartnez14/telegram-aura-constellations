import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Link2,
  Plus,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { useAura } from '../../state/AuraContext';
import type { CardColor, CardStatus, CardType } from '../../types/aura';

const COLOR_OPTIONS: Array<{ value: CardColor; label: string; hex: string }> = [
  { value: 'amethyst', label: 'Midnight Amethyst', hex: '#A997DF' },
  { value: 'gold', label: 'Champagne Gold', hex: '#D9BC80' },
  { value: 'sage', label: 'Sage Green', hex: '#94BFB2' },
  { value: 'coral', label: 'Soft Coral', hex: '#E29587' },
  { value: 'neutral', label: 'Obsidian Neutral', hex: '#9E98B3' },
];

export const CardDetailSheet: React.FC = () => {
  const {
    selectedCard,
    cards,
    connections,
    selectCard,
    updateCard,
    removeCard,
    createConnectionDirect,
    removeConnection,
    showToast,
  } = useAura();

  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [cluster, setCluster] = useState<string>('');
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [targetConnCardId, setTargetConnCardId] = useState<string>('');
  const [connRelationLabel, setConnRelationLabel] = useState<string>('inspira');
  const [confirmDeleteStep, setConfirmDeleteStep] = useState<boolean>(false);

  // Sync local fields when selectedCard changes
  useEffect(() => {
    if (!selectedCard) return;
    setTitle(selectedCard.title);
    setContent(selectedCard.content);
    setNotes(selectedCard.notes);
    setCluster(selectedCard.cluster ?? '');
    setSourceUrl(selectedCard.sourceUrl ?? '');
    setNewTagInput('');
    setConfirmDeleteStep(false);
  }, [selectedCard]);

  // Escape key closes the detail sheet
  useEffect(() => {
    if (!selectedCard) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        selectCard(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedCard, selectCard]);

  const relatedConnections = useMemo(() => {
    if (!selectedCard) return [];
    return connections
      .filter(
        (c) =>
          c.fromCardId === selectedCard.id || c.toCardId === selectedCard.id
      )
      .map((conn) => {
        const otherId =
          conn.fromCardId === selectedCard.id ? conn.toCardId : conn.fromCardId;
        const otherCard = cards.find((c) => c.id === otherId);
        return {
          conn,
          otherCard,
        };
      })
      .filter((item) => Boolean(item.otherCard));
  }, [selectedCard, connections, cards]);

  const candidateCardsForConnection = useMemo(() => {
    if (!selectedCard) return [];
    const connectedIds = new Set(
      relatedConnections.map((r) => r.otherCard!.id)
    );
    return cards.filter(
      (c) =>
        c.constellationId === selectedCard.constellationId &&
        c.id !== selectedCard.id &&
        !connectedIds.has(c.id)
    );
  }, [selectedCard, cards, relatedConnections]);

  useEffect(() => {
    if (candidateCardsForConnection.length > 0) {
      setTargetConnCardId(candidateCardsForConnection[0].id);
    } else {
      setTargetConnCardId('');
    }
  }, [candidateCardsForConnection]);

  if (!selectedCard) return null;

  const handleSaveTextFields = () => {
    void updateCard(selectedCard.id, {
      title,
      content,
      notes,
      cluster: cluster.trim() || undefined,
      sourceUrl: sourceUrl.trim() || undefined,
    });
  };

  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = newTagInput.trim().replace(/^#/, '').toLowerCase();
    if (!cleaned) return;
    if (!selectedCard.tags.includes(cleaned)) {
      void updateCard(selectedCard.id, {
        tags: [...selectedCard.tags, cleaned],
      });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    void updateCard(selectedCard.id, {
      tags: selectedCard.tags.filter((t) => t !== tagToRemove),
    });
  };

  const handleAddConnection = async () => {
    if (!targetConnCardId) return;
    await createConnectionDirect(
      selectedCard.id,
      targetConnCardId,
      connRelationLabel
    );
  };

  const handleCopyCardSummary = async () => {
    const summaryLines = [
      `✦ ${selectedCard.title}`,
      selectedCard.content ? `\n${selectedCard.content}` : '',
      selectedCard.notes ? `\nNotas: ${selectedCard.notes}` : '',
      selectedCard.tags.length > 0
        ? `\nEtiquetas: ${selectedCard.tags.map((t) => `#${t}`).join(' ')}`
        : '',
      selectedCard.sourceUrl ? `\nFuente: ${selectedCard.sourceUrl}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(summaryLines);
      }
      showToast('Copiado al portapapeles', 'success');
    } catch {
      showToast('Copiado al portapapeles', 'success');
    }
  };

  const handleConfirmDelete = async () => {
    await removeCard(selectedCard.id);
    selectCard(null);
  };

  return (
    <div
      className="aura-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalles de tarjeta: ${selectedCard.title}`}
      onClick={() => selectCard(null)}
      data-testid="card-detail-sheet"
    >
      <div
        className="aura-modal-surface"
        style={{
          maxWidth: '580px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '10px',
          }}
        >
          <button
            type="button"
            onClick={() => selectCard(null)}
            className="aura-btn aura-btn-ghost"
            style={{ minHeight: '34px', padding: '5px 10px', fontSize: '0.84rem' }}
            data-testid="back-to-canvas-btn"
          >
            <ArrowLeft size={16} /> Regresar al lienzo
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() =>
                void updateCard(selectedCard.id, {
                  favorite: !selectedCard.favorite,
                })
              }
              className="aura-btn"
              style={{
                minHeight: '34px',
                padding: '5px 10px',
                color: selectedCard.favorite
                  ? 'var(--accent-gold)'
                  : 'var(--text-secondary)',
              }}
              aria-label="Alternar favorito"
            >
              <Star
                size={15}
                fill={selectedCard.favorite ? 'currentColor' : 'none'}
              />
              {selectedCard.favorite ? 'Favorito' : 'Destacar'}
            </button>

            <button
              type="button"
              onClick={() => selectCard(null)}
              className="aura-btn aura-btn-ghost"
              style={{ minHeight: '34px', padding: '5px 8px' }}
              aria-label="Cerrar panel de detalles"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Title, Content & Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label
              htmlFor="detail-title"
              style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}
            >
              Título del elemento
            </label>
            <input
              id="detail-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTextFields}
              className="aura-input"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1.05rem',
              }}
              data-testid="detail-title-input"
            />
          </div>

          <div>
            <label
              htmlFor="detail-content"
              style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}
            >
              Contenido principal
            </label>
            <textarea
              id="detail-content"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleSaveTextFields}
              className="aura-textarea"
              data-testid="detail-content-input"
            />
          </div>

          <div>
            <label
              htmlFor="detail-notes"
              style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}
            >
              Notas adicionales y contexto
            </label>
            <textarea
              id="detail-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleSaveTextFields}
              placeholder="Añadí reflexiones, pasos siguientes o contexto..."
              className="aura-textarea"
              data-testid="detail-notes-input"
            />
          </div>
        </div>

        {/* Type, Status & Cluster Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '10px',
          }}
        >
          <div>
            <label
              htmlFor="detail-type"
              style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}
            >
              Tipo de elemento
            </label>
            <select
              id="detail-type"
              value={selectedCard.type}
              onChange={(e) =>
                void updateCard(selectedCard.id, {
                  type: e.target.value as CardType,
                })
              }
              className="aura-select"
            >
              <option value="idea">Idea</option>
              <option value="message">Mensaje Telegram</option>
              <option value="link">Enlace</option>
              <option value="task">Tarea</option>
              <option value="reference">Referencia</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="detail-status"
              style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}
            >
              Estado
            </label>
            <select
              id="detail-status"
              value={selectedCard.status}
              onChange={(e) =>
                void updateCard(selectedCard.id, {
                  status: e.target.value as CardStatus,
                })
              }
              className="aura-select"
            >
              <option value="active">Activa</option>
              <option value="pending">Pendiente ⏳</option>
              <option value="completed">Completada ✓</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="detail-cluster"
              style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}
            >
              Clúster / Grupo
            </label>
            <input
              id="detail-cluster"
              type="text"
              value={cluster}
              onChange={(e) => setCluster(e.target.value)}
              onBlur={handleSaveTextFields}
              placeholder="Ej: Diseño, Concepto..."
              className="aura-input"
            />
          </div>
        </div>

        {/* Color AURA Selector */}
        <div>
          <span
            style={{
              display: 'block',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              marginBottom: '6px',
            }}
          >
            Color AURA
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {COLOR_OPTIONS.map((opt) => {
              const isSelected = selectedCard.color === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    void updateCard(selectedCard.id, { color: opt.value })
                  }
                  className="aura-btn"
                  style={{
                    minHeight: '32px',
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    borderColor: isSelected ? opt.hex : 'var(--border-subtle)',
                    backgroundColor: isSelected
                      ? 'var(--bg-elevated-hover)'
                      : 'var(--bg-elevated)',
                  }}
                >
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: opt.hex,
                      display: 'inline-block',
                    }}
                  />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags Editor */}
        <div>
          <span
            style={{
              display: 'block',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              marginBottom: '6px',
            }}
          >
            Etiquetas (#tags)
          </span>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '8px',
            }}
          >
            {selectedCard.tags.map((tag) => (
              <span key={tag} className="aura-tag" style={{ padding: '3px 9px' }}>
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  aria-label={`Quitar etiqueta ${tag}`}
                  style={{ marginLeft: '4px', color: 'var(--text-muted)' }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <form
            onSubmit={handleAddTag}
            style={{ display: 'flex', gap: '8px' }}
          >
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              placeholder="Añadir etiqueta (Enter)..."
              className="aura-input"
              style={{ flex: 1, minHeight: '34px', padding: '6px 10px' }}
              data-testid="detail-add-tag-input"
            />
            <button
              type="submit"
              className="aura-btn"
              style={{ minHeight: '34px', padding: '6px 12px' }}
            >
              <Plus size={14} /> Añadir
            </button>
          </form>
        </div>

        {/* Source URL / Telegram Metadata */}
        <div>
          <label
            htmlFor="detail-source-url"
            style={{
              display: 'block',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              marginBottom: '4px',
            }}
          >
            Enlace / Fuente de Telegram
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              id="detail-source-url"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              onBlur={handleSaveTextFields}
              placeholder="https://t.me/canal/1234"
              className="aura-input"
            />
            {selectedCard.sourceUrl && (
              <a
                href={selectedCard.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="aura-btn"
                style={{ whiteSpace: 'nowrap' }}
              >
                Abrir <ExternalLink size={14} />
              </a>
            )}
          </div>
          {selectedCard.telegramMeta && (
            <div
              style={{
                marginTop: '6px',
                fontSize: '0.76rem',
                color: 'var(--accent-gold)',
              }}
            >
              Origen Telegram: {selectedCard.telegramMeta.chatName ?? ''}{' '}
              {selectedCard.telegramMeta.author
                ? `(${selectedCard.telegramMeta.author})`
                : ''}{' '}
              {selectedCard.telegramMeta.forwardedAt
                ? `· ${selectedCard.telegramMeta.forwardedAt}`
                : ''}
            </div>
          )}
        </div>

        {/* Live Connection Manager */}
        <section
          style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Link2 size={14} /> Conexiones en vivo ({relatedConnections.length})
            </span>
          </div>

          {relatedConnections.length === 0 ? (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Esta tarjeta aún no tiene conexiones trazadas.
            </span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {relatedConnections.map(({ conn, otherCard }) => (
                <div
                  key={conn.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => selectCard(otherCard!.id)}
                    style={{
                      textAlign: 'left',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {otherCard!.title}{' '}
                    {conn.label && (
                      <span
                        className="aura-tag"
                        style={{ marginLeft: '6px', fontSize: '0.68rem' }}
                      >
                        {conn.label}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => void removeConnection(conn.id)}
                    className="aura-btn aura-btn-ghost"
                    style={{ minHeight: '28px', padding: '2px 8px', fontSize: '0.75rem' }}
                    aria-label={`Eliminar conexión con ${otherCard!.title}`}
                  >
                    Desvincular
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Connection Selector */}
          {candidateCardsForConnection.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '6px',
                flexWrap: 'wrap',
                marginTop: '4px',
              }}
            >
              <select
                aria-label="Seleccionar tarjeta para conectar"
                value={targetConnCardId}
                onChange={(e) => setTargetConnCardId(e.target.value)}
                className="aura-select"
                style={{ flex: '2 1 160px', minHeight: '34px', padding: '5px 8px' }}
              >
                {candidateCardsForConnection.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>

              <select
                aria-label="Etiqueta de relación"
                value={connRelationLabel}
                onChange={(e) => setConnRelationLabel(e.target.value)}
                className="aura-select"
                style={{ flex: '1 1 100px', minHeight: '34px', padding: '5px 8px' }}
              >
                <option value="inspira">inspira</option>
                <option value="depende de">depende de</option>
                <option value="referencia">referencia</option>
                <option value="amplía">amplía</option>
                <option value="conecta">conecta</option>
              </select>

              <button
                type="button"
                onClick={() => void handleAddConnection()}
                className="aura-btn aura-btn-primary"
                style={{ minHeight: '34px', padding: '5px 12px', fontSize: '0.8rem' }}
                data-testid="detail-add-connection-btn"
              >
                <Plus size={14} /> Conectar
              </button>
            </div>
          )}
        </section>

        {/* Bottom Utility Actions: Copy & Two-Step Delete */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '12px',
          }}
        >
          <button
            type="button"
            onClick={() => void handleCopyCardSummary()}
            className="aura-btn"
            data-testid="copy-card-info-btn"
          >
            <Copy size={15} /> Copiar información
          </button>

          {!confirmDeleteStep ? (
            <button
              type="button"
              onClick={() => setConfirmDeleteStep(true)}
              className="aura-btn"
              style={{ color: 'var(--status-danger)' }}
              data-testid="delete-card-step1-btn"
            >
              <Trash2 size={15} /> Eliminar tarjeta
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--status-danger)' }}>
                ¿Confirmar borrado?
              </span>
              <button
                type="button"
                onClick={() => void handleConfirmDelete()}
                className="aura-btn"
                style={{
                  backgroundColor: 'var(--status-danger)',
                  color: '#10121D',
                  borderColor: 'transparent',
                }}
                data-testid="delete-card-confirm-btn"
              >
                Sí, eliminar
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteStep(false)}
                className="aura-btn"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardDetailSheet;
