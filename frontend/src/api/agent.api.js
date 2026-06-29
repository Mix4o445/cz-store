import client from './axiosClient';

export const agentApi = {
  // messages: [{ role: 'user'|'assistant', content: string }]
  chat: (messages) => client.post('/admin/agent', { messages }).then((r) => r.data),
};
