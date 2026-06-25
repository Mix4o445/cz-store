import client from './axiosClient';

export const ordersApi = {
  create: (payload) => client.post('/orders', payload).then((r) => r.data),
  mine: () => client.get('/orders/mine').then((r) => r.data),
  byId: (id) => client.get(`/orders/${id}`).then((r) => r.data),
  updateStatus: (id, status) => client.put(`/orders/${id}/status`, { status }).then((r) => r.data),
};
