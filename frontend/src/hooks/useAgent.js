import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agentApi } from '@/api/agent.api';

/**
 * Sends the chat history to the AI admin agent. When the agent reports that it
 * mutated data (actions[]), we invalidate the relevant React Query caches so
 * the rest of the admin UI reflects the changes immediately.
 */
export function useAgentChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (messages) => agentApi.chat(messages),
    onSuccess: (res) => {
      const actions = res?.data?.actions ?? [];
      if (actions.some((a) => a.ok)) {
        qc.invalidateQueries({ queryKey: ['products'] });
        qc.invalidateQueries({ queryKey: ['categories'] });
        qc.invalidateQueries({ queryKey: ['admin'] });
      }
    },
  });
}
