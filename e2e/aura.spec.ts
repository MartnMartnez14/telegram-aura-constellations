import { test, expect, type Page } from '@playwright/test';

async function skipSplashIfPresent(page: Page) {
  const skipBtn = page.getByTestId('splash-skip-button');
  if (await skipBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
    await skipBtn.click();
  }
  await expect(page.getByTestId('intro-splash')).toBeHidden({ timeout: 5000 });
}

test.describe('Telegram AURA — Constellations E2E & Visual Suite', () => {
  test('Test 1 — Pantalla de Bienvenida y Animación Inicial', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // Verify IntroSplash appears or can be skipped cleanly
    await skipSplashIfPresent(page);

    // Verify Welcome Screen and AURA Identity
    const welcomeScreen = page.getByTestId('welcome-screen');
    await expect(welcomeScreen).toBeVisible();
    await expect(
      welcomeScreen.getByRole('heading', { name: 'Telegram AURA — Constellations' })
    ).toBeVisible();
    await expect(welcomeScreen.getByText('Tus ideas, conectadas.')).toBeVisible();

    // Verify Interactive Live Mini-Constellation
    const miniSection = welcomeScreen.getByRole('region', {
      name: 'Demostración interactiva de constelación',
    });
    await expect(miniSection).toBeVisible();
    await expect(miniSection.getByText('Sistema Visual AURA').first()).toBeVisible();
    await expect(
      miniSection.getByText('Paleta Midnight Amethyst + contraste WCAG AA')
    ).toBeVisible();

    // Click another star node in the mini-constellation to verify interactivity
    const miniNodeElena = miniSection.getByRole('button', {
      name: 'Seleccionar nodo Nota de @elena_design',
    });
    await miniNodeElena.click();
    await expect(
      miniSection.getByText('«Inercia táctil de 220ms sobre cristal esmerilado»')
    ).toBeVisible();

    // Verify the 3 preloaded demo constellations are displayed
    const creativeCard = page.getByTestId('welcome-constellation-const-creative-studio');
    const learningCard = page.getByTestId('welcome-constellation-const-learning-universe');
    const dailyCard = page.getByTestId('welcome-constellation-const-daily-life');

    await expect(creativeCard).toContainText('Creative Studio');
    await expect(learningCard).toContainText('Learning Universe');
    await expect(dailyCard).toContainText('Daily Life');
  });

  test('Test 2 — Universo Principal, Creación de Constelación, Tarjetas, Conexiones y Persistencia tras Recarga', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await skipSplashIfPresent(page);

    // Enter Main Universe via "Explorar AURA"
    await page.getByTestId('explore-aura-btn').click();
    await expect(page.getByTestId('universe-screen')).toBeVisible();

    // Create a new constellation first and verify it appears in the pill bar
    await page.getByTestId('new-constellation-btn').click();
    await expect(page.getByTestId('constellation-modal')).toBeVisible();
    await page.getByTestId('constellation-name-input').fill('Product Architecture');
    await page
      .getByTestId('constellation-desc-input')
      .fill('Estrategia y nodos de diseño en Telegram');
    await page.getByTestId('save-constellation-btn').click();
    await expect(page.getByTestId('constellation-modal')).toBeHidden();
    await expect(
      page.getByRole('tab', { name: /Product Architecture/i })
    ).toBeVisible();

    // Switch back to Creative Studio to test Telegram smart capture and connections with existing cards
    await page.getByTestId('constellation-pill-const-creative-studio').click();
    await expect(
      page.getByTestId('canvas-card-card-cs-manifesto')
    ).toBeVisible();

    // Open Telegram Smart Capture Modal and paste a t.me link with #aura
    await page.getByTestId('open-capture-modal-btn').click();
    await expect(page.getByTestId('capture-modal')).toBeVisible();

    const smartInput = page.getByTestId('telegram-smart-input');
    await smartInput.fill(
      'Reenviado de @designers: Sistema de constelaciones https://t.me/designers/42 #aura'
    );

    // Verify smart parser autocompleted title and URL
    const titleInput = page.getByTestId('new-card-title-input');
    await expect(titleInput).toHaveValue(/Sistema de constelaciones/i);

    await page.getByTestId('submit-new-card-btn').click();
    await expect(page.getByTestId('capture-modal')).toBeHidden();

    // Verify new card is rendered on the canvas
    const createdCardNode = page
      .locator('[data-testid^="canvas-card-"]')
      .filter({ hasText: 'Sistema de constelaciones' });
    await expect(createdCardNode).toBeVisible();

    // Open CardDetailSheet of the newly created card
    await createdCardNode.click();
    const detailSheet = page.getByTestId('card-detail-sheet');
    await expect(detailSheet).toBeVisible();

    // Edit title and notes
    const detailTitle = page.getByTestId('detail-title-input');
    await detailTitle.fill('Arquitectura Telegram #42 Editada');
    await detailTitle.blur();

    const detailNotes = page.getByTestId('detail-notes-input');
    await detailNotes.fill('Nota persistente verificada en IndexedDB');
    await detailNotes.blur();

    // Change card color to Sage Green
    await detailSheet.getByRole('button', { name: 'Sage Green' }).click();

    // Create a live connection with another card in the constellation
    const addConnBtn = page.getByTestId('detail-add-connection-btn');
    await expect(addConnBtn).toBeVisible();
    await addConnBtn.click();
    await expect(detailSheet.getByText(/Conexiones en vivo \(1\)/)).toBeVisible();

    // Close detail sheet
    await page.getByTestId('back-to-canvas-btn').click();
    await expect(detailSheet).toBeHidden();

    // Reload page and verify all changes persist in IndexedDB
    await page.reload();
    await skipSplashIfPresent(page);

    // Since hasSeenWelcome is true after entering Universe, it boots directly into Universe
    await expect(page.getByTestId('universe-screen')).toBeVisible();
    await expect(
      page.getByRole('tab', { name: /Product Architecture/i })
    ).toBeVisible();

    const persistedCard = page
      .locator('[data-testid^="canvas-card-"]')
      .filter({ hasText: 'Arquitectura Telegram #42 Editada' });
    await expect(persistedCard).toBeVisible();
    await expect(persistedCard).toHaveAttribute('data-color', 'sage');

    // Open persisted card detail sheet to verify notes and connection persisted
    await persistedCard.click();
    await expect(page.getByTestId('detail-notes-input')).toHaveValue(
      'Nota persistente verificada en IndexedDB'
    );
    await expect(
      page.getByTestId('card-detail-sheet').getByText(/Conexiones en vivo \(1\)/)
    ).toBeVisible();
  });

  test('Test 3 — Navegación a Biblioteca (Búsqueda, Filtros y Ordenamiento)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await skipSplashIfPresent(page);

    // Navigate to Library tab via BottomDock
    await page.getByTestId('nav-library-btn').click();
    const libraryScreen = page.getByTestId('library-screen');
    await expect(libraryScreen).toBeVisible();

    // Initially Creative Studio has 6 demo cards
    const libraryCards = libraryScreen.locator('[data-testid^="library-card-"]');
    await expect(libraryCards).toHaveCount(6);

    // Test text search
    const searchInput = page.getByTestId('library-search-input');
    await searchInput.fill('Manifiesto Visual');
    await expect(libraryCards).toHaveCount(1);
    await expect(libraryCards.first()).toContainText(
      'Manifiesto Visual: Observatorio Silencioso'
    );

    // Clear search
    await searchInput.fill('');
    await expect(libraryCards).toHaveCount(6);

    // Filter by Favorites (Creative Studio has 2 favorites: Manifesto & Video Task)
    await page.getByTestId('filter-favorites-btn').click();
    await expect(libraryCards).toHaveCount(2);

    // Filter by Pending (Creative Studio has 1 pending task: Grabar prototipo en vivo)
    await page.getByTestId('filter-pending-btn').click();
    await expect(libraryCards).toHaveCount(1);
    await expect(libraryCards.first()).toContainText(
      'Grabar prototipo en vivo de 60s para @designers'
    );

    // Reset quick filter to 'Todas' and test Alphabetical sorting
    await libraryScreen.getByRole('button', { name: 'Todas', exact: true }).click();
    await expect(libraryCards).toHaveCount(6);

    await page.getByTestId('library-sort-select').selectOption('alphabetical');
    await expect(libraryCards.first()).toContainText(
      'Especificación Oficial Telegram Mini Apps 8.0+'
    );
  });

  test('Test 4 — Configuración, Cambio de Tema (Nocturno / Diurno), Exportación/Importación y Estados de Error', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await skipSplashIfPresent(page);

    // Navigate to SettingsView
    await page.getByTestId('nav-settings-btn').click();
    const settingsScreen = page.getByTestId('settings-screen');
    await expect(settingsScreen).toBeVisible();

    // Default theme is 'night' (Midnight Amethyst)
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');

    // Switch to Day theme (Pearl Lavender)
    await page.getByTestId('theme-day-btn').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'day');

    // Switch back to Night theme (Midnight Amethyst)
    await page.getByTestId('theme-night-btn').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');

    // Test invalid / malicious JSON import validation
    const importTextarea = page.getByTestId('import-json-textarea');
    const validateBtn = page.getByTestId('validate-and-import-btn');

    await importTextarea.fill('{ "malformed": true, <script>alert(1)</script> }');
    await validateBtn.click();

    const statusMsg = page.getByTestId('import-status-message');
    await expect(statusMsg).toBeVisible();
    await expect(statusMsg).toContainText(/El archivo no tiene un formato JSON válido/i);

    // Also test valid JSON with wrong schema structure
    await importTextarea.fill(
      JSON.stringify({
        version: '1.0.0',
        app: 'wrong-app-identifier',
        constellations: [],
      })
    );
    await validateBtn.click();
    await expect(statusMsg).toBeVisible();
    await expect(statusMsg).toContainText(/Formato de respaldo incompatible/i);

    // Verify application remains healthy and interactive
    await expect(settingsScreen).toBeVisible();
  });

  test('Test 5 — Pruebas Visuales y Responsivas (Móvil 390x844, 360x800 y Escritorio 1440x900) + Capturas Reales', async ({
    page,
  }) => {
    // 1. Desktop 1440x900 — Welcome Screen in Night Mode (01-welcome-night.png)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await skipSplashIfPresent(page);
    await expect(page.getByTestId('welcome-screen')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');

    await page.screenshot({
      path: 'docs/screenshots/01-welcome-night.png',
      fullPage: false,
    });

    // 2. Desktop 1440x900 — Main Universe Creative Studio in Night Mode (02-universe-night-desktop.png)
    await page.getByTestId('explore-aura-btn').click();
    await expect(page.getByTestId('universe-screen')).toBeVisible();
    await page.getByTestId('center-map-btn').click();

    await page.screenshot({
      path: 'docs/screenshots/02-universe-night-desktop.png',
      fullPage: false,
    });

    // 3. Desktop 1440x900 — Main Universe in Day Mode Pearl Lavender (03-universe-day-desktop.png)
    await page.getByTestId('nav-settings-btn').click();
    await page.getByTestId('theme-day-btn').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'day');

    await page.getByTestId('nav-universe-btn').click();
    await expect(page.getByTestId('universe-screen')).toBeVisible();
    await page.getByTestId('center-map-btn').click();

    await page.screenshot({
      path: 'docs/screenshots/03-universe-day-desktop.png',
      fullPage: false,
    });

    // Switch back to Night Mode for the remaining captures
    await page.getByTestId('nav-settings-btn').click();
    await page.getByTestId('theme-night-btn').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');

    // 4. Desktop 1440x900 — Library View with filters and tags (05-library-view.png)
    await page.getByTestId('nav-library-btn').click();
    await expect(page.getByTestId('library-screen')).toBeVisible();

    await page.screenshot({
      path: 'docs/screenshots/05-library-view.png',
      fullPage: false,
    });

    // 5. Desktop 1440x900 — Card Detail Sheet open over Universe (06-card-detail-sheet.png)
    await page.getByTestId('nav-universe-btn').click();
    await expect(page.getByTestId('universe-screen')).toBeVisible();
    await page.getByTestId('center-map-btn').click();
    await page.getByTestId('canvas-card-card-cs-manifesto').click();
    await expect(page.getByTestId('card-detail-sheet')).toBeVisible();

    await page.screenshot({
      path: 'docs/screenshots/06-card-detail-sheet.png',
      fullPage: false,
    });

    // Close detail sheet before mobile viewport tests
    await page.getByTestId('back-to-canvas-btn').click();
    await expect(page.getByTestId('card-detail-sheet')).toBeHidden();

    // 6. Mobile 390x844 — Responsive check + Screenshot (04-mobile-390-universe.png)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByTestId('center-map-btn').click();

    const overflow390 = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    expect(overflow390).toBe(true);

    await page.screenshot({
      path: 'docs/screenshots/04-mobile-390-universe.png',
      fullPage: false,
    });

    // Also verify Library and Welcome have no horizontal overflow at 390x844
    await page.getByTestId('nav-library-btn').click();
    await expect(page.getByTestId('library-screen')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);

    // 7. Mobile 360x800 — Responsive check across screens
    await page.setViewportSize({ width: 360, height: 800 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);

    await page.getByTestId('nav-universe-btn').click();
    await expect(page.getByTestId('universe-screen')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);

    await page.getByTestId('nav-welcome-btn').click();
    await expect(page.getByTestId('welcome-screen')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
  });
});
