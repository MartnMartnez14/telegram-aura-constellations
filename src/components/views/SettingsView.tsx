import React, { useRef, useState } from 'react';
import {
  Activity,
  Copy,
  Download,
  Eye,
  Monitor,
  Moon,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react';
import { useAura } from '../../state/AuraContext';
import type { ThemeMode } from '../../types/aura';

export const SettingsView: React.FC = () => {
  const {
    settings,
    effectiveTheme,
    telegramEnv,
    constellations,
    cards,
    connections,
    updateSettings,
    exportBackupJson,
    importBackupJson,
    clearDemoData,
    resetDemoData,
    loadPerformanceTestConstellation,
    showToast,
  } = useAura();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [rawImportText, setRawImportText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [exportedPreview, setExportedPreview] = useState<string>('');

  const handleThemeSelect = (mode: ThemeMode) => {
    void updateSettings({ theme: mode });
  };

  const handleExportDownload = () => {
    const jsonStr = exportBackupJson();
    setExportedPreview(jsonStr);

    try {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `telegram-aura-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Archivo JSON de respaldo exportado con éxito', 'success');
    } catch {
      showToast('Respaldo JSON generado. Podés copiarlo abajo.', 'info');
    }
  };

  const handleCopyExportedJson = async () => {
    const content = exportedPreview || exportBackupJson();
    setExportedPreview(content);
    try {
      await navigator.clipboard?.writeText(content);
      showToast('JSON copiado al portapapeles', 'success');
    } catch {
      showToast('JSON listo en el cuadro de vista previa', 'info');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setRawImportText(text);
    const res = await importBackupJson(text, importMode);
    setImportStatus(res);
    e.target.value = '';
  };

  const handleManualImport = async () => {
    const res = await importBackupJson(rawImportText, importMode);
    setImportStatus(res);
  };

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
      data-testid="settings-screen"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '760px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        {/* Header */}
        <header className="aura-glass-panel" style={{ padding: '18px 20px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.35rem',
              fontWeight: 700,
            }}
          >
            Configuración y Respaldo
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Personalizá la atmósfera visual de AURA, el rendimiento del observatorio y la
            persistencia local de tus constelaciones.
          </p>
        </header>

        {/* 1. Appearance (Aura Design System) */}
        <section
          className="aura-glass-panel"
          style={{
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.02rem',
                fontWeight: 700,
              }}
            >
              Apariencia · Aura Design System
            </h2>
            <span className="aura-tag">
              Activo: {effectiveTheme === 'night' ? 'Nocturno' : 'Diurno'}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '10px',
            }}
          >
            <button
              type="button"
              onClick={() => handleThemeSelect('night')}
              className={`aura-btn ${settings.theme === 'night' ? 'aura-btn-primary' : ''}`.trim()}
              style={{ justifyContent: 'flex-start', padding: '12px 14px' }}
              data-testid="theme-night-btn"
            >
              <Moon size={16} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 700 }}>Tema Nocturno</div>
                <div style={{ fontSize: '0.73rem', opacity: 0.85 }}>Midnight Amethyst</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleThemeSelect('day')}
              className={`aura-btn ${settings.theme === 'day' ? 'aura-btn-primary' : ''}`.trim()}
              style={{ justifyContent: 'flex-start', padding: '12px 14px' }}
              data-testid="theme-day-btn"
            >
              <Sun size={16} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 700 }}>Tema Diurno</div>
                <div style={{ fontSize: '0.73rem', opacity: 0.85 }}>Pearl Lavender</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleThemeSelect('auto')}
              className={`aura-btn ${settings.theme === 'auto' ? 'aura-btn-primary' : ''}`.trim()}
              style={{ justifyContent: 'flex-start', padding: '12px 14px' }}
              data-testid="theme-auto-btn"
            >
              <Monitor size={16} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 700 }}>Tema Automático</div>
                <div style={{ fontSize: '0.73rem', opacity: 0.85 }}>Sistema / Telegram</div>
              </div>
            </button>
          </div>
        </section>

        {/* 2. Accessibility & Performance */}
        <section
          className="aura-glass-panel"
          style={{
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.02rem',
              fontWeight: 700,
            }}
          >
            Accesibilidad, Lienzo y Rendimiento
          </h2>

          {/* Toggle Rows */}
          {[
            {
              key: 'reducedMotion' as const,
              title: 'Reducción de animaciones',
              desc: 'Simplifica transiciones y respeta prefers-reduced-motion.',
              value: settings.reducedMotion,
              testId: 'toggle-reduced-motion',
            },
            {
              key: 'showGrid' as const,
              title: 'Cuadrícula astronómica',
              desc: 'Muestra puntos de referencia espacial sobre el lienzo del observatorio.',
              value: settings.showGrid,
              testId: 'toggle-show-grid',
            },
            {
              key: 'showClusterHalos' as const,
              title: 'Halos de agrupación (Clústeres)',
              desc: 'Dibuja regiones atmosféricas suaves detrás de cada grupo temático.',
              value: settings.showClusterHalos,
              testId: 'toggle-cluster-halos',
            },
            {
              key: 'performanceMode' as const,
              title: 'Modo de alto rendimiento',
              desc: 'Optimiza trazos SVG y desactiva resplandores pesados para constelaciones densas.',
              value: settings.performanceMode,
              testId: 'toggle-performance-mode',
            },
            {
              key: 'tmaPreviewFrame' as const,
              title: 'Marco de vista previa Telegram Mini App (390px)',
              desc: 'Simula en escritorio la carcasa móvil de 390×844px con barra superior de Telegram.',
              value: settings.tmaPreviewFrame,
              testId: 'toggle-tma-preview',
            },
          ].map((item) => (
            <div
              key={item.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {item.desc}
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={item.value}
                onClick={() => void updateSettings({ [item.key]: !item.value })}
                className={`aura-btn ${item.value ? 'aura-btn-primary' : ''}`.trim()}
                style={{ minWidth: '84px', minHeight: '34px', fontSize: '0.78rem' }}
                data-testid={item.testId}
              >
                {item.value ? 'Activado' : 'Inactivo'}
              </button>
            </div>
          ))}

          {/* Stress Test 105+ Cards Button */}
          <div
            style={{
              marginTop: '4px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--accent-gold)' }}>
                Laboratorio de fluidez 60 FPS (+100 nodos)
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Genera una constelación en espiral áurea con 105 tarjetas conectadas en vivo.
              </div>
            </div>

            <button
              type="button"
              onClick={() => void loadPerformanceTestConstellation(105)}
              className="aura-btn"
              data-testid="stress-test-105-btn"
            >
              <Activity size={15} /> Probar estrés de rendimiento (105 tarjetas)
            </button>
          </div>
        </section>

        {/* 3. Data & Backup (Local IndexedDB Persistence) */}
        <section
          className="aura-glass-panel"
          style={{
            padding: '18px 20px',
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
              gap: '8px',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.02rem',
                fontWeight: 700,
              }}
            >
              Datos y Respaldo (IndexedDB Local)
            </h2>
            <span className="aura-tag">
              {constellations.length} constelaciones · {cards.length} tarjetas ·{' '}
              {connections.length} conexiones
            </span>
          </div>

          {/* Export Actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button
              type="button"
              onClick={handleExportDownload}
              className="aura-btn aura-btn-primary"
              data-testid="export-json-btn"
            >
              <Download size={15} /> Exportar universo (JSON)
            </button>

            <button
              type="button"
              onClick={() => void handleCopyExportedJson()}
              className="aura-btn"
              data-testid="copy-export-json-btn"
            >
              <Copy size={15} /> Copiar JSON de respaldo
            </button>

            <button
              type="button"
              onClick={() =>
                setExportedPreview((prev) => (prev ? '' : exportBackupJson()))
              }
              className="aura-btn aura-btn-ghost"
            >
              <Eye size={15} /> {exportedPreview ? 'Ocultar vista previa' : 'Ver JSON'}
            </button>
          </div>

          {exportedPreview && (
            <textarea
              readOnly
              rows={5}
              value={exportedPreview}
              aria-label="Vista previa de respaldo JSON exportado"
              className="aura-textarea"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
            />
          )}

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Import Backup Zone */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Importar respaldo (JSON validado con esquema Zod)
              </span>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setImportMode('merge')}
                  className={`aura-tag ${importMode === 'merge' ? 'is-active' : ''}`}
                  style={{
                    cursor: 'pointer',
                    backgroundColor:
                      importMode === 'merge'
                        ? 'var(--accent-amethyst)'
                        : 'var(--bg-elevated)',
                    color:
                      importMode === 'merge'
                        ? 'var(--text-on-accent)'
                        : 'var(--text-secondary)',
                  }}
                >
                  Modo: Combinar (Merge)
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className="aura-tag"
                  style={{
                    cursor: 'pointer',
                    backgroundColor:
                      importMode === 'replace'
                        ? 'var(--accent-gold)'
                        : 'var(--bg-elevated)',
                    color:
                      importMode === 'replace'
                        ? 'var(--text-on-accent)'
                        : 'var(--text-secondary)',
                  }}
                >
                  Modo: Reemplazar todo
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={(e) => void handleFileUpload(e)}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aura-btn"
                data-testid="upload-json-file-btn"
              >
                <Upload size={15} /> Subir archivo .json
              </button>
            </div>

            <textarea
              rows={3}
              value={rawImportText}
              onChange={(e) => setRawImportText(e.target.value)}
              placeholder="O pegá aquí el contenido JSON de tu respaldo para validarlo e importarlo..."
              className="aura-textarea"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}
              data-testid="import-json-textarea"
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <button
                type="button"
                onClick={() => void handleManualImport()}
                disabled={!rawImportText.trim()}
                className="aura-btn aura-btn-primary"
                data-testid="validate-and-import-btn"
              >
                Validar e Importar JSON
              </button>

              {importStatus && (
                <span
                  role="status"
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: importStatus.ok
                      ? 'var(--status-success)'
                      : 'var(--status-danger)',
                  }}
                  data-testid="import-status-message"
                >
                  {importStatus.message}
                </span>
              )}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Demo Data Management */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button
              type="button"
              onClick={() => void clearDemoData()}
              className="aura-btn"
              data-testid="clear-demo-data-btn"
            >
              <Trash2 size={15} /> Borrar datos de demostración
            </button>

            <button
              type="button"
              onClick={() => void resetDemoData()}
              className="aura-btn"
              data-testid="reset-demo-data-btn"
            >
              <RefreshCw size={15} /> Restaurar demostración original
            </button>
          </div>
        </section>

        {/* 4. Privacy, Security & Telegram Integration */}
        <section
          className="aura-glass-panel"
          style={{
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} style={{ color: 'var(--accent-sage)' }} />
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.02rem',
                fontWeight: 700,
              }}
            >
              Privacidad, Seguridad e Integración Telegram
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '10px',
              fontSize: '0.81rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-elevated)',
              }}
            >
              <strong style={{ color: 'var(--text-primary)', display: 'block' }}>
                Almacenamiento Local IndexedDB
              </strong>
              Tus notas, coordenadas y enlaces residen localmente en tu dispositivo. Cero
              rastreadores externos ni telemetría oculta.
            </div>

            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-elevated)',
              }}
            >
              <strong style={{ color: 'var(--text-primary)', display: 'block' }}>
                Puente Bot &amp; HMAC-SHA256
              </strong>
              El micro-puente opcional en FastAPI verifica criptográficamente{' '}
              <code style={{ fontFamily: 'var(--font-mono)' }}>initData</code> con{' '}
              <code style={{ fontFamily: 'var(--font-mono)' }}>HMAC-SHA256</code> y nunca
              expone tokens en el cliente.
            </div>

            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-elevated)',
              }}
            >
              <strong style={{ color: 'var(--text-primary)', display: 'block' }}>
                Entorno Detectado ({telegramEnv.isTelegramMiniApp ? 'Telegram Mini App' : 'Web Demo'})
              </strong>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Smartphone size={13} /> Plataforma: {telegramEnv.platform} · Versión:{' '}
                {telegramEnv.version}
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default SettingsView;
