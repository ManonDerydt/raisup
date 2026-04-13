import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL as string;

export interface StartupPayload {
  name: string;
  sector: string;
  stage: string;
  funding_amount: string;
  description: string;
  revenue?: string;
  employees?: number;
  problem?: string;
  solution?: string;
  target_market?: string;
}

export interface PitchDeckSlide {
  number: number;
  title: string;
  content: string;
  bullet_points: string[];
  speaker_notes: string;
}

export interface PitchDeckContent {
  title: string;
  slides: PitchDeckSlide[];
}

export interface GenerateResult {
  status: string;
  type: string;
  content: PitchDeckContent;
  pages: number;
}

/**
 * Generates a pitch deck via the FastAPI backend, then saves it to Supabase.
 * Returns the saved document row id.
 */
export async function generatePitchDeck(
  startup: StartupPayload,
  startupId?: string
): Promise<{ documentId: string; content: PitchDeckContent }> {
  // 1. Call FastAPI backend
  const response = await fetch(`${API_URL}/generate/pitch-deck`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(startup),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail ?? 'Erreur lors de la génération du pitch deck');
  }

  const result: GenerateResult = await response.json();

  // 2. Save to Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      startup_id: startupId ?? null,
      type: 'pitch_deck',
      status: 'completed',
      content: result.content,
      pages: result.pages,
    })
    .select('id')
    .single();

  if (error) throw new Error(`Erreur Supabase : ${error.message}`);

  return { documentId: data.id, content: result.content };
}
