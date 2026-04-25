import Anthropic from '@anthropic-ai/sdk';

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

if (!apiKey) {
  console.warn('[Fundherz] VITE_ANTHROPIC_API_KEY manquante — les générations de documents échoueront.');
}

// dangerouslyAllowBrowser : la clé est dans le bundle Vite (VITE_ prefix).
// En production, remplacer par un appel via un proxy backend (Edge Function, FastAPI, etc.)
export const anthropic = new Anthropic({
  apiKey: apiKey ?? '',
  dangerouslyAllowBrowser: true,
});

export const GENERATION_MODEL = 'claude-sonnet-4-6';

/** Extrait le JSON depuis une réponse qui peut contenir des balises markdown. */
export function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  return text.trim();
}
