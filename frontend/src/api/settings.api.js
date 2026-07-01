import client from './axiosClient';

export const settingsApi = {
  getMaintenance: () => client.get('/settings/maintenance').then((r) => r.data),
  setMaintenance: (payload) =>
    client.put('/settings/maintenance', payload).then((r) => r.data),
};
