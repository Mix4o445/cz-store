import client from './axiosClient';

export const brandsApi = {
  list: () => client.get('/brands').then((r) => r.data),
  create: (payload) => client.post('/brands', payload).then((r) => r.data),
  update: (id, payload) => client.put(`/brands/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/brands/${id}`).then((r) => r.data),
};
