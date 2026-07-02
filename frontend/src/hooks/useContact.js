import { useMutation } from '@tanstack/react-query';
import { contactApi } from '@/api/contact.api';

export function useSendContact() {
  return useMutation({
    mutationFn: (payload) => contactApi.send(payload),
  });
}
