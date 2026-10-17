import React, { useEffect, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { useAura } from '../../state/AuraContext';
import type { CardColor, ConstellationIcon } from '../../types/aura';

export interface ConstellationModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  onClose: () => void;
}

export const ConstellationModal: React.FC<ConstellationModalProps> = ({
  isOpen,
  mode,
  onClose,
}) => {
  const {
    activeConstellation,
    constellations,
    createConstellation,
    updateConstellation,
    removeConstellation,
  } = useAura();

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [icon, setIcon] = useState<ConstellationIcon>('sparkles');
  const [accentColor, setAccentColor] = useState<CardColor>('amethyst');
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'edit' && activeConstellation) {
      setName(activeConstellation.name);
      setDescription(activeConstellation.description);
      setIcon(activeConstellation.icon);
      setAccentColor(activeConstellation.accentColor);
    } else {
      setName('');
      setDescription('');
      setIcon('sparkles');
      setAccentColor('amethyst');
    }
    setConfirmDelete(false);
  }, [isOpen, mode, activeConstellation]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (mode === 'create') {
      await createConstellation({
        name,
        description,
        icon,
        accentColor,
      });
    } else if (activeConstellation) {
      await updateConstellation(activeConstellation.id, {
        name,
        description,
        icon,
        accentColor,
      });
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!activeConstellation) return;
    await removeConstellation(activeConstellation.id);
    onClose();
  };

  return (
    <div
      className="aura-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'create' ? 'Crear nueva constelación' : 'Editar constelación'}
      onClick={onClose}
      data-testid="constellation-modal"
    >
      <div
        className="aura-modal-surface"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '460px' }}
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
            {mode === 'create'
              ? 'Nueva Constelación'
              : `Editar «${activeConstellation?.name ?? ''}»`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="aura-btn aura-btn-ghost"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          <div>
            <label
              htmlFor="const-name-input"
              style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}
            >
              Nombre de la constelación *
            </label>
            <input
              id="const-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Lanzamiento Producto Q4, Investigación..."
              className="aura-input"
              data-testid="constellation-name-input"
            />
          </div>

          <div>
            <label
              htmlFor="const-desc-input"
              style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}
            >
              Propósito / Descripción
            </label>
            <textarea
              id="const-desc-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción del espacio de conocimiento..."
              className="aura-textarea"
              data-testid="constellation-desc-input"
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
            }}
          >
            <div>
              <label
                htmlFor="const-icon-select"
                style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}
              >
                Símbolo
              </label>
              <select
                id="const-icon-select"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="aura-select"
              >
                <option value="sparkles">Estrellas (Sparkles)</option>
                <option value="compass">Brújula (Compass)</option>
                <option value="sun">Sol (Sun)</option>
                <option value="orbit">Órbita (Orbit)</option>
                <option value="book">Conocimiento (Book)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="const-color-select"
                style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}
              >
                Acento Astronómico
              </label>
              <select
                id="const-color-select"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value as CardColor)}
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            {mode === 'edit' && constellations.length > 1 ? (
              !confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="aura-btn"
                  style={{ color: 'var(--status-danger)' }}
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  className="aura-btn"
                  style={{
                    backgroundColor: 'var(--status-danger)',
                    color: '#10121D',
                  }}
                >
                  Confirmar borrado
                </button>
              )
            ) : (
              <span />
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={onClose} className="aura-btn">
                Cancelar
              </button>
              <button
                type="submit"
                className="aura-btn aura-btn-primary"
                data-testid="save-constellation-btn"
              >
                {mode === 'create' ? 'Crear constelación' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConstellationModal;
