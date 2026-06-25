import client from './axiosClient';

export const categoriesApi = {
  list: () => client.get('/categories').then((r) => r.data),
  create: (payload) => client.post('/categories', payload).then((r) => r.data),
  update: (id, payload) => client.put(`/categories/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/categories/${id}`).then((r) => r.data),
};
