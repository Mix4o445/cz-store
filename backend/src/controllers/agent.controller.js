import { z } from 'zod';
import { runAgent } from '../services/aiAgent.service.js';
import { ok } from '../utils/apiResponse.js';
import { badRequest } from '../utils/apiError.js';

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(8000),
      })
    )
    .min(1)
    .max(40),
});

export async function agentChat(req, res, next) {
  try {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid payload', parsed.error.flatten());
    const { reply, actions } = await runAgent(parsed.data.messages);
    return ok(res, { reply, actions });
  } catch (e) {
    next(e);
  }
}
