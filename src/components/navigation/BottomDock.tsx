import React from 'react';
import { BookOpen, Compass, Settings, Sparkles } from 'lucide-react';
import { useAura } from '../../state/AuraContext';
import type { ScreenId } from '../../types/aura';

interface NavItem {
  id: ScreenId;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'welcome', label: 'Inicio', icon: <Sparkles size={17} /> },
  { id: 'universe', label: 'Universo', icon: <Compass size={17} /> },
  { id: 'library', label: 'Biblioteca', icon: <BookOpen size={17} /> },
  { id: 'settings', label: 'Ajustes', icon: <Settings size={17} /> },
];

export const BottomDock: React.FC = () => {
  const { currentScreen, setCurrentScreen, activeCards } = useAura();

  return (
    <nav
      aria-label="Navegación principal de AURA"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 'calc(12px + var(--safe-bottom))',
        transform: 'translateX(-50%)',
        zIndex: 60,
        width: 'calc(100% - 24px)',
        maxWidth: '460px',
      }}
      data-testid="bottom-dock"
    >
      <div
        className="aura-glass-panel"
        style={{
          padding: '6px 8px',
          borderRadius: 'var(--radius-pill)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '4px',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentScreen(item.id)}
              aria-current={isActive ? 'page' : undefined}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                padding: '6px 4px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: isActive
                  ? 'var(--accent-amethyst)'
                  : 'transparent',
                color: isActive
                  ? 'var(--text-on-accent)'
                  : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.72rem',
                transition: 'all 160ms ease',
              }}
              data-testid={`nav-${item.id}-btn`}
            >
              {item.icon}
              <span>
                {item.label}
                {item.id === 'library' ? ` (${activeCards.length})` : ''}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomDock;
