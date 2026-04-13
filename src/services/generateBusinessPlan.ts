import { supabase } from '../lib/supabase';
import type { StartupPayload } from './generateDeck';

const API_URL = import.meta.env.VITE_API_URL as string;

export interface BusinessPlanSubsection {
  title: string;
  content: string;
}

export interface BusinessPlanSection {
  number: number;
  title: string;
  content: string;
  subsections: BusinessPlanSubsection[];
}

export interface BusinessPlanContent {
  title: string;
  sections: BusinessPlanSection[];
}

export async function generateBusinessPlan(
  startup: StartupPayload,
  startupId?: string
): Promise<{ documentId: string; content: BusinessPlanContent }> {
  // 1. Call FastAPI backend
  const response = await fetch(`${API_URL}/generate/business-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(startup),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail ?? 'Erreur lors de la génération du business plan');
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
      type: 'business_plan',
      status: 'completed',
      content: result.content,
      pages: result.pages,
    })
    .select('id')
    .single();

  if (error) throw new Error(`Erreur Supabase : ${error.message}`);

  return { documentId: data.id, content: result.content };
}
