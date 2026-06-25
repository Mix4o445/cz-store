import client from './axiosClient';

export const reviewsApi = {
  listForProduct: (productId) =>
    client.get(`/reviews/product/${productId}`).then((r) => r.data),
  upsert: (productId, payload) =>
    client.post(`/reviews/product/${productId}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/reviews/${id}`).then((r) => r.data),
};
