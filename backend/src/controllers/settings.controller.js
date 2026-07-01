import { z } from 'zod';
import { settingsRepo } from '../db/settings.repo.js';
import { ok } from '../utils/apiResponse.js';
import { badRequest } from '../utils/apiError.js';

const maintenanceSchema = z.object({
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().min(1).max(500).optional(),
});

/** Public — anyone (including the storefront) can read the current
 *  maintenance state so the React app can switch to a maintenance page. */
export async function getMaintenance(_req, res, next) {
  try {
    const s = await settingsRepo.get();
    return ok(res, {
      maintenanceMode: s.maintenanceMode,
      maintenanceMessage: s.maintenanceMessage,
    });
  } catch (e) {
    next(e);
  }
}

/** Admin only — toggle the flag and/or update the message. */
export async function setMaintenance(req, res, next) {
  try {
    const parsed = maintenanceSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid payload', parsed.error.flatten());
    if (
      parsed.data.maintenanceMode === undefined &&
      parsed.data.maintenanceMessage === undefined
    ) {
      throw badRequest('No settings to update');
    }
    const updated = await settingsRepo.update(parsed.data);
    return ok(res, {
      maintenanceMode: updated.maintenanceMode,
      maintenanceMessage: updated.maintenanceMessage,
    });
  } catch (e) {
    next(e);
  }
}
