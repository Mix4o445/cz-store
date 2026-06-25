import client from './axiosClient';

export const productsApi = {
  list: (params) => client.get('/products', { params }).then((r) => r.data),
  bySlug: (slug) => client.get(`/products/${slug}`).then((r) => r.data),
  byId: (id) => client.get(`/products/${id}`).then((r) => r.data),
  byIds: (ids) =>
    client.get('/products/by-ids', { params: { ids } }).then((r) => r.data),
  featured: () => client.get('/products/featured').then((r) => r.data),
  tags: () => client.get('/products/tags').then((r) => r.data),
  create: (payload) => client.post('/products', payload).then((r) => r.data),
  update: (id, payload) => client.put(`/products/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/products/${id}`).then((r) => r.data),
};
