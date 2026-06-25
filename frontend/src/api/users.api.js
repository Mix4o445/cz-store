import client from './axiosClient';

export const usersApi = {
  updateProfile: (payload) => client.put('/users/me', payload).then((r) => r.data),
  listAddresses: () => client.get('/users/me/addresses').then((r) => r.data),
  addAddress: (payload) => client.post('/users/me/addresses', payload).then((r) => r.data),
  updateAddress: (id, payload) => client.put(`/users/me/addresses/${id}`, payload).then((r) => r.data),
  deleteAddress: (id) => client.delete(`/users/me/addresses/${id}`).then((r) => r.data),
};
