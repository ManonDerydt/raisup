import { anthropic, GENERATION_MODEL, extractJSON } from './anthropicClient';
import { supabase } from '../lib/supabase';
import type { StartupPayload } from './generateDeck';

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
  startupId?: string,
): Promise<{ documentId: string; content: ExecutiveSummaryContent }> {
  const prompt = `Tu es un expert en communication financière pour startups.
Génère un executive summary percutant et concis (2 pages) pour la startup suivante, en JSON structuré.

Startup :
- Nom : ${startup.name}
- Secteur : ${startup.sector}
- Stade : ${startup.stage}
- Montant recherché : ${startup.funding_amount}
- Description : ${startup.description}
- Revenus actuels : ${startup.revenue || 'Non communiqué'}
- Employés : ${startup.employees || 'Non communiqué'}
- Problème adressé : ${startup.problem || 'À détailler'}
- Solution proposée : ${startup.solution || 'À détailler'}
- Marché cible : ${startup.target_market || 'À préciser'}

Réponds UNIQUEMENT avec un JSON valide, sans texte autour, au format :
{
  "title": "Executive Summary — ${startup.name}",
  "tagline": "Une phrase d'accroche percutante",
  "sections": [
    { "title": "Titre", "content": "Contenu concis et percutant" }
  ],
  "key_metrics": [
    { "label": "Métrique clé", "value": "Valeur" }
  ],
  "investment_ask": "Montant et utilisation des fonds en 2-3 phrases"
}

Sections obligatoires : Le Problème, Notre Solution, Marché Adressable, Modèle Économique, Traction, Équipe, Opportunité d'investissement.`;

  const message = await anthropic.messages.create({
    model: GENERATION_MODEL,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content.find(b => b.type === 'text');
  if (!raw || raw.type !== 'text') throw new Error('Aucun contenu généré par Claude');

  const summaryJson: ExecutiveSummaryContent = JSON.parse(extractJSON(raw.text));

  let documentId = crypto.randomUUID();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          startup_id: startupId ?? null,
          type: 'executive_summary',
          status: 'completed',
          content: summaryJson,
          pages: 3,
        })
        .select('id')
        .single();
      if (!error && data) documentId = data.id;
    }
  } catch { /* ignore */ }

  return { documentId, content: summaryJson };
}
