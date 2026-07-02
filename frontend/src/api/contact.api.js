import client from './axiosClient';

export const contactApi = {
  send: (payload) => client.post('/contact', payload).then((r) => r.data),
};
