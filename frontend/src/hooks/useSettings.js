import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/api/settings.api';

const KEY = ['settings', 'maintenance'];

/** Public — used by the storefront on app boot to decide whether to show
 *  the maintenance page. */
export function useMaintenance() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const res = await settingsApi.getMaintenance();
      return res.data ?? { maintenanceMode: false, maintenanceMessage: '' };
    },
    // Cheap endpoint, cache aggressively so we don't hit the API on every
    // page navigation. 1 minute is plenty.
    staleTime: 60_000,
  });
}

/** Admin only — toggle the flag and/or update the message. */
export function useSetMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => settingsApi.setMaintenance(payload),
    onSuccess: (data) => {
      // Optimistic-ish: write the new value into the cache so every consumer
      // (storefront, admin page) updates instantly.
      qc.setQueryData(KEY, (prev) => ({
        ...(prev ?? {}),
        ...(data?.data ?? {}),
      }));
    },
  });
}
