import { supabase, throwOnError } from '../config/supabase.js';

const TABLE = 'app_settings';

const DEFAULTS = Object.freeze({
  maintenanceMode: false,
  maintenanceMessage: 'Site en maintenance. Nous revenons bientôt.',
  updatedAt: null,
});

/** The whole settings row, mapped to a flat object. */
const map = (row) =>
  row
    ? {
        maintenanceMode: !!row.maintenance_mode,
        maintenanceMessage:
          row.maintenance_message ||
          'Site en maintenance. Nous revenons bientôt.',
        updatedAt: row.updated_at,
      }
    : DEFAULTS;

const rowToPatch = (data = {}) => {
  const patch = { updated_at: new Date().toISOString() };
  if (typeof data.maintenanceMode === 'boolean') {
    patch.maintenance_mode = data.maintenanceMode;
  }
  if (typeof data.maintenanceMessage === 'string' && data.maintenanceMessage.trim()) {
    patch.maintenance_message = data.maintenanceMessage.trim();
  }
  return patch;
};

export const settingsRepo = {
  /**
   * Read the current settings. If the table is missing or any other error
   * happens (RLS, network, etc.) we return the safe defaults instead of
   * throwing — the storefront must never 500 just because the maintenance
   * flag isn't readable. The first run of `update()` will surface the
   * real error so the admin knows to create the table.
   */
  async get() {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      if (error) {
        // Common expected case pre-migration: PGRST205 / 42P01 = "relation
        // does not exist". Log once and return defaults.
        console.warn(
          `[settings] get failed (${error.code ?? 'no-code'}): ${error.message}. ` +
            'Returning defaults — run backend/sql/app_settings.sql to create the table.'
        );
        return { ...DEFAULTS };
      }
      return map(data);
    } catch (e) {
      console.warn('[settings] get threw, returning defaults:', e.message);
      return { ...DEFAULTS };
    }
  },

  async update(data) {
    const patch = rowToPatch(data);
    const { data: updated, error } = await supabase
      .from(TABLE)
      .update(patch)
      .eq('id', 1)
      .select('*')
      .maybeSingle();
    throwOnError(error, 'settings.update');
    return map(updated);
  },
};
