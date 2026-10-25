/**
 * AI stylist backed by Claude, called from the server with ANTHROPIC_API_KEY so the key never
 * reaches the browser. Without a key the rule-based stylist answers, so the chat still works.
 */
import Anthropic from '@anthropic-ai/sdk';

import { SYSTEM, contextNote, offlineStylist, type ChatTurn, type StylistContext } from '../src/shared/stylist.ts';

let client: Anthropic | null = null;
export const stylistConfigured = () => !!process.env.ANTHROPIC_API_KEY;

export async function askStylist(history: ChatTurn[], ctx: StylistContext): Promise<string> {
  if (!stylistConfigured()) return offlineStylist(history[history.length - 1]?.text ?? '', ctx);
  client ??= new Anthropic();

  let response;
  try {
    response = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 2048,
      // The catalogue prompt is the same on every request, so it is cached; the profile follows it.
      system: [
        { type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: `Client profile: ${contextNote(ctx)}` },
      ],
      output_config: { effort: 'low' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      messages: history.map((t) => ({ role: t.role, content: t.text })),
    });
  } catch (err) {
    // A bad key, rate limit or network problem shouldn't leave the shopper without an answer.
    if (err instanceof Anthropic.AuthenticationError) console.error('Stylist: the ANTHROPIC_API_KEY in .env was rejected.');
    else if (err instanceof Anthropic.APIError) console.error(`Stylist: Claude request failed (${err.status ?? 'network'}): ${err.message}`);
    else throw err;
    return offlineStylist(history[history.length - 1]?.text ?? '', ctx);
  }

  if (response.stop_reason === 'refusal') {
    return "I can't help with that one, but I'd love to help you choose an outfit or plan your week.";
  }
  return response.content
    .map((b) => (b.type === 'text' ? b.text : ''))
    .join('')
    .trim();
}
