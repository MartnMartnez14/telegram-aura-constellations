import React, { useState } from 'react';
import { AuraProvider, useAura } from './state/AuraContext';
import { IntroSplash } from './components/branding/IntroSplash';
import { WelcomeScreen } from './components/views/WelcomeScreen';
import { UniverseCanvas } from './components/canvas/UniverseCanvas';
import { LibraryView } from './components/views/LibraryView';
import { SettingsView } from './components/views/SettingsView';
import { CardDetailSheet } from './components/views/CardDetailSheet';
import { BottomDock } from './components/navigation/BottomDock';
import { ConstellationModal } from './components/modals/ConstellationModal';
import { AuraLogo } from './components/branding/AuraLogo';

const AuraAppContent: React.FC = () => {
  const {
    showSplash,
    completeSplash,
    currentScreen,
    settings,
    effectiveReducedMotion,
    toastMessage,
    dismissToast,
  } = useAura();

  const [constellationModal, setConstellationModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
  }>({
    isOpen: false,
    mode: 'create',
  });

  return (
    <div
      className={`aura-tma-frame-wrapper ${
        settings.tmaPreviewFrame ? 'is-tma-preview' : ''
      }`.trim()}
    >
      <div className="aura-app-shell">
        {/* Native Telegram Mini App Preview Header when tmaPreviewFrame is enabled */}
        {settings.tmaPreviewFrame && (
          <div
            style={{
              height: '44px',
              padding: '0 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              fontWeight: 600,
              zIndex: 50,
            }}
            data-testid="tma-preview-header"
          >
            <span style={{ color: 'var(--text-secondary)' }}>Cerrar</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-display)',
              }}
            >
              <AuraLogo size={18} /> Telegram AURA
            </span>
            <span style={{ color: 'var(--accent-amethyst)' }}>⋯</span>
          </div>
        )}

        {/* Intro Splash (<=1.5s with Skip button) */}
        {showSplash && (
          <IntroSplash
            onComplete={completeSplash}
            durationMs={1400}
            reducedMotion={effectiveReducedMotion}
          />
        )}

        {/* Screen Router */}
        {currentScreen === 'welcome' && <WelcomeScreen />}
        {currentScreen === 'universe' && (
          <UniverseCanvas
            onOpenNewConstellationModal={() =>
              setConstellationModal({ isOpen: true, mode: 'create' })
            }
            onOpenEditConstellationModal={() =>
              setConstellationModal({ isOpen: true, mode: 'edit' })
            }
          />
        )}
        {currentScreen === 'library' && <LibraryView />}
        {currentScreen === 'settings' && <SettingsView />}

        {/* Slide-over / Modal Card Detail Sheet */}
        <CardDetailSheet />

        {/* Constellation Create / Edit Modal */}
        <ConstellationModal
          isOpen={constellationModal.isOpen}
          mode={constellationModal.mode}
          onClose={() =>
            setConstellationModal((prev) => ({ ...prev, isOpen: false }))
          }
        />

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            onClick={dismissToast}
            style={{
              position: 'fixed',
              top: 'calc(14px + var(--safe-top))',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 110,
              padding: '9px 16px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
              boxShadow: 'var(--shadow-card)',
              fontSize: '0.82rem',
              fontWeight: 600,
              color:
                toastMessage.tone === 'error'
                  ? 'var(--status-danger)'
                  : toastMessage.tone === 'warning'
                    ? 'var(--status-warning)'
                    : toastMessage.tone === 'success'
                      ? 'var(--status-success)'
                      : 'var(--text-primary)',
              cursor: 'pointer',
              maxWidth: 'calc(100vw - 32px)',
              textAlign: 'center',
            }}
            data-testid="aura-toast"
          >
            {toastMessage.text}
          </div>
        )}

        {/* Persistent Bottom Navigation Dock */}
        <BottomDock />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuraProvider>
      <AuraAppContent />
    </AuraProvider>
  );
};

export default App;
