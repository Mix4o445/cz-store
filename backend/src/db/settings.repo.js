import { supabase, throwOnError } from '../config/supabase.js';

const TABLE = 'app_settings';

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
    : {
        maintenanceMode: false,
        maintenanceMessage: 'Site en maintenance. Nous revenons bientôt.',
        updatedAt: null,
      };

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
  async get() {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    throwOnError(error, 'settings.get');
    return map(data);
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
