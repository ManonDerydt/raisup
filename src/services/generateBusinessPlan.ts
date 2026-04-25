import { anthropic, GENERATION_MODEL, extractJSON } from './anthropicClient';
import { supabase } from '../lib/supabase';
import type { StartupPayload } from './generateDeck';

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
  startupId?: string,
): Promise<{ documentId: string; content: BusinessPlanContent }> {
  const prompt = `Tu es un expert en stratégie d'entreprise et en rédaction de business plans pour startups.
Génère un business plan complet et détaillé pour la startup suivante, en JSON structuré.

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
  "title": "Business Plan — ${startup.name}",
  "sections": [
    {
      "number": 1,
      "title": "Titre de la section",
      "content": "Contenu détaillé (plusieurs paragraphes)",
      "subsections": [
        { "title": "Sous-section", "content": "Contenu" }
      ]
    }
  ]
}

Sections obligatoires : 1-Résumé exécutif, 2-Présentation entreprise, 3-Analyse marché, 4-Analyse concurrentielle, 5-Stratégie produit, 6-Plan marketing, 7-Organisation équipe, 8-Plan opérationnel, 9-Projections financières 3 ans, 10-Stratégie financement.`;

  const message = await anthropic.messages.create({
    model: GENERATION_MODEL,
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content.find(b => b.type === 'text');
  if (!raw || raw.type !== 'text') throw new Error('Aucun contenu généré par Claude');

  const planJson: BusinessPlanContent = JSON.parse(extractJSON(raw.text));

  let documentId = crypto.randomUUID();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          startup_id: startupId ?? null,
          type: 'business_plan',
          status: 'completed',
          content: planJson,
          pages: 28,
        })
        .select('id')
        .single();
      if (!error && data) documentId = data.id;
    }
  } catch { /* ignore */ }

  return { documentId, content: planJson };
}
