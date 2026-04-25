import { anthropic, GENERATION_MODEL, extractJSON } from './anthropicClient';
import { supabase } from '../lib/supabase';

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

export async function generatePitchDeck(
  startup: StartupPayload,
  startupId?: string,
  existingDeckBase64?: string,
): Promise<{ documentId: string; content: PitchDeckContent }> {
  const deckContext = existingDeckBase64
    ? `\n\nJ'ai joint le deck PDF actuel de la startup. Analyse-le attentivement :
- Reprends les éléments forts (messaging, angles différenciants, données clés)
- Corrige les faiblesses (slides trop denses, arguments faibles, structure confuse)
- Améliore le storytelling investor-ready
- Garde la cohérence avec les infos ci-dessus si elles diffèrent`
    : '';

  const prompt = `Tu es un expert senior en levée de fonds, spécialisé pitch decks pour startups tech européennes.
Génère un pitch deck de 10 slides optimisé pour convaincre des investisseurs VC, en JSON structuré.${deckContext}

Startup :
- Nom : ${startup.name}
- Secteur : ${startup.sector}
- Stade : ${startup.stage}
- Montant recherché : ${startup.funding_amount}
- Description : ${startup.description}
- Revenus actuels : ${startup.revenue || 'Pré-revenu'}
- Employés : ${startup.employees || 'Non renseigné'}
- Problème adressé : ${startup.problem || 'À détailler'}
- Solution proposée : ${startup.solution || 'À détailler'}
- Marché cible : ${startup.target_market || 'À préciser'}

Règles de contenu :
- Chaque slide doit avoir un message principal clair (1 insight fort, pas un résumé)
- bullet_points : max 3, concis, chiffrés quand possible
- Slide Traction : cite des métriques réelles ou des proxies crédibles pour le stade
- Slide Marché : TAM/SAM/SOM avec sources si possible
- Call to Action : montant exact, utilisation des fonds (3 postes max), timeline

Réponds UNIQUEMENT avec un JSON valide, sans texte autour :
{
  "title": "Titre du pitch deck",
  "slides": [
    {
      "number": 1,
      "title": "Titre de la slide",
      "content": "Message principal de la slide (2-3 phrases percutantes)",
      "bullet_points": ["Point chiffré 1", "Point chiffré 2", "Point chiffré 3"],
      "speaker_notes": "Notes détaillées pour le présentateur (questions probables des VCs, chiffres à mémoriser)"
    }
  ]
}

Ordre : 1-Cover, 2-Problème, 3-Solution, 4-Marché, 5-Produit, 6-Business Model, 7-Traction, 8-Équipe, 9-Roadmap, 10-Call to Action.`;

  type ContentBlock =
    | { type: 'text'; text: string }
    | { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string } };

  const userContent: ContentBlock[] = existingDeckBase64
    ? [
        {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: existingDeckBase64 },
        },
        { type: 'text', text: prompt },
      ]
    : [{ type: 'text', text: prompt }];

  const message = await anthropic.messages.create({
    model: GENERATION_MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: userContent as Parameters<typeof anthropic.messages.create>[0]['messages'][0]['content'] }],
  });

  const raw = message.content.find(b => b.type === 'text');
  if (!raw || raw.type !== 'text') throw new Error('Aucun contenu généré par Claude');

  const deckJson: PitchDeckContent = JSON.parse(extractJSON(raw.text));

  // Sauvegarde Supabase (best-effort — ne bloque pas si non connecté)
  let documentId = crypto.randomUUID();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          startup_id: startupId ?? null,
          type: 'pitch_deck',
          status: 'completed',
          content: deckJson,
          pages: 10,
        })
        .select('id')
        .single();
      if (!error && data) documentId = data.id;
    }
  } catch { /* ignore */ }

  return { documentId, content: deckJson };
}
