# Política y Arquitectura de Seguridad — `SECURITY.md`

**Proyecto:** Telegram AURA — Constellations  
**Principio Rector:** *Privacy by Design* · *Local-First* · *Zero Trust Input Validation*  
**Estado de Auditoría:** Auditado y verificado por `npc-seguridad` y `npc-white-hat`  

---

## 1. Principios de Privacidad por Diseño (*Privacy by Design*)

**Telegram AURA — Constellations** maneja notas personales, ideas de proyectos y referencias a mensajes de Telegram. Por ello, la privacidad no es un complemento, sino el cimiento arquitectónico del sistema:

1. **Almacenamiento 100% Local por Defecto (`IndexedDB`):**  
   Todas las constelaciones, tarjetas, notas, coordenadas y conexiones se guardan directamente en la base de datos `IndexedDB` del navegador del usuario (`telegram-aura-db`). Ningún texto escrito en la aplicación se envía automáticamente a servidores remotos.
2. **Cero Telemetría, Cero Rastreadores y Cero Anuncios:**  
   La aplicación no incluye scripts de analítica de terceros, píxeles de seguimiento, *fingerprinting* ni telemetría oculta.
3. **Cero Acceso No Autorizado a Conversaciones de Telegram:**  
   Ni la aplicación web ni el puente de Telegram Mini App tienen acceso a los chats privados del usuario. La captura de mensajes ocurre **exclusivamente por acción explícita y voluntaria del usuario** (pegando un enlace `t.me`, un texto reenviado o enviando un mensaje directamente a su propio Bot personal de AURA).
4. **Cero Secretos en el Frontend:**  
   El token del Bot (`TELEGRAM_BOT_TOKEN`) y el secreto del Webhook (`TELEGRAM_WEBHOOK_SECRET`) jamás se incluyen en el código cliente ni en variables `VITE_*`. Solo existen en el entorno de ejecución del servidor backend opcional (`backend_tma/`).

---

## 2. Controles Técnicos Implementados y Auditados

### 2.1. Prevención Estricta de Cross-Site Scripting (XSS) y Sanitización de URLs
Auditado en `src/schemas/validation.ts`, `src/services/telegramBridge.ts` y `backend_tma/db.py`:

- **Ausencia total de inyección HTML cruda:**  
  No existe ningún uso de `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `document.write` ni `eval()` en todo el código fuente. Todo el contenido se renderiza como nodos de texto escapados nativamente por React.
- **Sanitización de texto y caracteres de control (`sanitizeText`):**  
  - Elimina caracteres de control invisibles (`[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]`).
  - Neutraliza etiquetas `<script>` y secuencias ofuscadas con espacios intercalados tipo `j a v a s c r i p t :`.
  - Aplica límites estrictos de longitud por campo (ej. `240` caracteres para títulos, `5000` para contenido/notas, `48` para etiquetas).
- **Lista blanca estricta de esquemas URL (`sanitizeSafeUrl`):**  
  - Antes de almacenar o renderizar cualquier `sourceUrl` (en `<a href={...} target="_blank" rel="noopener noreferrer">`), la función elimina caracteres de control y **tabuladores o saltos de línea intercalados** (`[\t\n\r]+`) que los atacantes suelen emplear para evadir filtros (por ejemplo, `java\tscript:alert(1)`).
  - Parsea la URL mediante el estándar `new URL()` / `urlparse()` y verifica que el protocolo pertenezca exclusivamente a la lista blanca permitida:
    - `https:`
    - `http:`
    - `tg:` (enlaces profundos oficiales de Telegram)
  - Cualquier intento de inyectar `javascript:`, `data:`, `vbscript:`, `file:` o `blob:` es rechazado inmediatamente.

---

### 2.2. Validación de Importaciones JSON con `Zod` y Protección Anti-*Prototype Pollution*
La función de importación de respaldos (`validateAndSanitizeBackup` y `sanitizeFallbackStoreData` en `src/schemas/validation.ts`) trata cualquier archivo `.json` externo como entrada no confiable:

1. **Tope Estricto de Tamaño (Anti-DoS en Memoria):**  
   Antes de invocar `JSON.parse`, se calcula el tamaño real en bytes UTF-8 mediante `TextEncoder`. Si el payload supera **`MAX_BACKUP_BYTES` (2 MB)**, se rechaza de inmediato sin bloquear el hilo principal.
2. **Filtro Anti-*Prototype Pollution* (`safeJsonParse`):**  
   El parseo JSON utiliza un *reviver* de seguridad que descarta en cualquier nivel de anidamiento las claves peligrosas:
   - `__proto__`
   - `constructor`
   - `prototype`
3. **Validación Estructural con Esquemas `Zod` (`AuraBackupPayloadSchema`):**  
   - Verifica tipos exactos, rangos finitos de coordenadas (`x, y` entre `-20000` y `20000`), enumeraciones válidas (`type`, `color`, `status`, `theme`) y límites de colecciones (`max(200)` constelaciones, `max(5000)` tarjetas, `max(10000)` conexiones).
   - Utiliza `.strict()` en sub-objetos sensibles (`TelegramMetaSchema`, `AuraSettingsPartialSchema`) para rechazar propiedades no declaradas.
4. **Poda de Integridad Referencial al Importar:**  
   - Deduplica constelaciones y tarjetas por `id`.
   - Descarta tarjetas cuyo `constellationId` no exista en el respaldo.
   - Descarta **auto-conexiones** (`fromCardId === toCardId`), **conexiones huérfanas** (cuyos extremos no existan), conexiones que crucen constelaciones distintas y pares duplicados (`A::B` o `B::A`).

---

### 2.3. Seguridad Criptográfica en el Backend Opcional (`backend_tma/`)
El módulo `backend_tma/` implementa exactamente el estándar criptográfico exigido por la documentación oficial de Telegram Mini Apps:

1. **Verificación `HMAC-SHA256` con Clave Derivada `"WebAppData"` (`telegram_auth.py`):**
   - Extrae el parámetro `hash` (validando que sea una cadena hexadecimal de 64 caracteres `^[0-9a-fA-F]{64}$`).
   - Ordena alfabéticamente el resto de pares `clave=valor` de `initData` separados por `\n` para construir `data_check_string`.
   - Deriva la clave secreta mediante:
     $$\text{secret\_key} = \text{HMAC-SHA256}(\text{key}=\text{"WebAppData"}, \text{msg}=\text{bot\_token})$$
   - Calcula la firma esperada:
     $$\text{computed\_hash} = \text{HMAC-SHA256}(\text{key}=\text{secret\_key}, \text{msg}=\text{data\_check\_string})$$
2. **Comparación en Tiempo Constante (`hmac.compare_digest`):**  
   Tanto la verificación del `hash` de `initData` como la validación de la cabecera `X-Telegram-Bot-Api-Secret-Token` en el webhook (`/api/bot/webhook`) utilizan exclusivamente `hmac.compare_digest(...)` para neutralizar ataques de temporización (*timing attacks*).
3. **Ventana Anti-Replay sobre `auth_date`:**  
   - Verifica que `auth_date` sea un timestamp UNIX entero válido.
   - Rechaza firmas con marcas de tiempo en el futuro (`auth_date > now + 300`).
   - Rechaza sesiones expiradas cuya antigüedad supere `max_age_seconds` (`86400` segundos / 24 horas por defecto).
4. **Validación Estricta de `user.id` en Python:**  
   En Python, `bool` es subclase de `int` (`isinstance(True, int) == True`). Por ello, tanto `telegram_auth.py` como `db.py` y `app.py` verifican explícitamente:
   ```python
   isinstance(user_id, int) and not isinstance(user_id, bool) and user_id > 0
   ```
5. **Consultas SQLite 100% Parametrizadas (`backend_tma/db.py`):**  
   Todas las operaciones `INSERT` y `SELECT` sobre la tabla `forwarded_items` utilizan marcadores posicionales `?` de `sqlite3`, impidiendo por completo cualquier vector de Inyección SQL (SQLi).

---

## 3. Verificación Automatizada de Seguridad

Puedes ejecutar en cualquier momento las pruebas de seguridad que verifican todos los controles anteriores:

```bash
# 1. Pruebas de sanitización XSS, URLs maliciosas, límite de 2MB y anti-Prototype Pollution
npm test

# 2. Pruebas de HMAC-SHA256, anti-replay, webhook secret y SQLite parametrizado
python3 -m unittest discover -s backend_tma -p "test_*.py" -v
```
