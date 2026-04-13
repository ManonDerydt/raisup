import { supabase } from '../lib/supabase';
import type { StartupPayload } from './generateDeck';

const API_URL = import.meta.env.VITE_API_URL as string;

export interface SummarySection {
  title: string;
  content: string;
}

export interface KeyMetric {
  label: string;
  value: string;
}

export interface ExecutiveSummaryContent {
  title: string;
  tagline: string;
  sections: SummarySection[];
  key_metrics: KeyMetric[];
  investment_ask: string;
}

export async function generateExecutiveSummary(
  startup: StartupPayload,
  startupId?: string
): Promise<{ documentId: string; content: ExecutiveSummaryContent }> {
  // 1. Call FastAPI backend
  const response = await fetch(`${API_URL}/generate/executive-summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(startup),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail ?? "Erreur lors de la génération de l'executive summary");
  }

  const result = await response.json();

  // 2. Save to Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      startup_id: startupId ?? null,
      type: 'executive_summary',
      status: 'completed',
      content: result.content,
      pages: result.pages,
    })
    .select('id')
    .single();

  if (error) throw new Error(`Erreur Supabase : ${error.message}`);

  return { documentId: data.id, content: result.content };
}
