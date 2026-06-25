import client from './axiosClient';

export const adminApi = {
  dashboard: () => client.get('/admin/dashboard').then((r) => r.data),
  listUsers: (params) => client.get('/admin/users', { params }).then((r) => r.data),
  setUserRole: (id, role) => client.put(`/admin/users/${id}/role`, { role }).then((r) => r.data),
  listAllOrders: (params) => client.get('/orders/all', { params }).then((r) => r.data),
  uploadImage: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return client.post('/upload', fd, { headers: { 'Content-Type': undefined } }).then((r) => r.data);
  },
};
