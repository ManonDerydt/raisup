import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Circle, ChevronLeft, Palette, Type,
  Download, Sparkles, Edit2, Save, X,
} from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { jsPDF } from 'jspdf';

// ─── Types ────────────────────────────────────────────────────────────────────

type DocType = 'bp' | 'deck' | 'teaser';

interface Slide {
  title: string;
  content: string;
  bullets?: string[];
}

interface DocBranding {
  primaryColor: string;
  secondaryColor: string;
  fontStyle: 'moderne' | 'classique' | 'élégant';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMoney(n: number | null | undefined): string {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M€`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K€`;
  return `${n}€`;
}

function isColorDark(hex: string): boolean {
  const c = hex.replace('#', '');
  const n = parseInt(c, 16);
  const r = (n >> 16) & 255; const g = (n >> 8) & 255; const b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}

const FONT_MAP: Record<string, string> = {
  'moderne': 'Inter, system-ui, sans-serif',
  'classique': 'Georgia, serif',
  'élégant': 'Georgia, Palatino, serif',
};

const COLOR_PRESETS = [
  { primary: '#0A0A0A', secondary: '#F4B8CC' },
  { primary: '#1A3A8F', secondary: '#ABC5FE' },
  { primary: '#2D6A00', secondary: '#D8FFBD' },
  { primary: '#3D0D8F', secondary: '#CDB4FF' },
  { primary: '#92400E', secondary: '#FFB96D' },
  { primary: '#881337', secondary: '#FFB3B3' },
];

// ─── Doc content generators ───────────────────────────────────────────────────

function getBPSlides(profile: ReturnType<typeof useUserProfile>['profile']): Slide[] {
  const mrr = fmtMoney(profile.mrr);
  const goal = fmtMoney(profile.fundraisingGoal);
  const name = profile.startupName || 'Ma Startup';
  return [
    {
      title: '1. Résumé exécutif',
      content: `${name} est une startup ${profile.sector || 'tech'} au stade ${profile.stage || 'seed'} qui s'attaque au problème suivant : ${profile.problem || 'un problème majeur non résolu dans son marché'}. Notre solution : ${profile.solution || 'une approche innovante et scalable'}.`,
      bullets: [
        `Secteur : ${profile.sector || 'Non renseigné'}`,
        `Stade : ${profile.stage || 'Seed'}`,
        `MRR actuel : ${mrr}`,
        `Levée visée : ${goal}`,
      ],
    },
    {
      title: '2. Le Problème',
      content: profile.problem || 'Les entreprises font face à un problème majeur qui coûte en moyenne X% de leur productivité. Les solutions existantes sont inadaptées, trop chères ou trop complexes.',
      bullets: [
        'Coût élevé pour les entreprises',
        'Aucune solution adaptée sur le marché',
        'Croissance du problème +20%/an',
      ],
    },
    {
      title: '3. Notre Solution',
      content: profile.solution || 'Une plateforme tout-en-un qui automatise et simplifie le process, avec une intégration native dans les outils existants.',
      bullets: [
        'Déploiement en moins de 48h',
        'ROI positif dès le 1er mois',
        `Avantage : ${profile.competitiveAdvantage || 'technologie propriétaire'}`,
      ],
    },
    {
      title: '4. Marché',
      content: `Nous adressons un marché de ${profile.sector || 'technologie'} en forte croissance, avec un TAM estimé à plusieurs milliards d'euros en Europe.`,
      bullets: [
        `Clients cibles : ${profile.clientType || 'PME & Grandes entreprises'}`,
        `Modèle : ${profile.businessModel || 'SaaS récurrent'}`,
        'Croissance marché : +25%/an',
      ],
    },
    {
      title: '5. Traction',
      content: `${name} a déjà démontré une traction significative avec ${profile.activeClients ?? 0} clients actifs et un MRR de ${mrr}.`,
      bullets: [
        `MRR : ${mrr}`,
        `Clients actifs : ${profile.activeClients ?? 0}`,
        `Croissance MoM : ${profile.momGrowth ?? 0}%`,
        `Runway : ${profile.runway ?? 0} mois`,
      ],
    },
    {
      title: '6. Équipe',
      content: `Une équipe complémentaire de ${profile.teamSize ?? 2} personnes avec une expérience cumulée de plusieurs années dans le secteur.`,
      bullets: [
        profile.hasCTO ? 'CTO identifié ✓' : 'CTO en cours de recrutement',
        `${profile.teamSize ?? 2} membres fondateurs`,
        'Expérience terrain dans le secteur',
      ],
    },
    {
      title: '7. Plan Financier',
      content: `Nous visons une levée de ${goal} pour financer notre croissance sur 18 mois. L'argent sera utilisé pour le recrutement (50%), la R&D (30%) et le commercial (20%).`,
      bullets: [
        `Montant : ${goal}`,
        `Dilution max : ${profile.maxDilution ?? 20}%`,
        'Utilisation : équipe 50% · R&D 30% · Go-to-market 20%',
        `Objectif post-levée : 50K€ MRR`,
      ],
    },
  ];
}

function getDeckSlides(profile: ReturnType<typeof useUserProfile>['profile']): Slide[] {
  const name = profile.startupName || 'Ma Startup';
  const goal = fmtMoney(profile.fundraisingGoal);
  const mrr = fmtMoney(profile.mrr);
  return [
    { title: 'Cover', content: name, bullets: [profile.sector || 'Tech', profile.stage || 'Seed', goal] },
    { title: 'Le Problème', content: profile.problem || 'Un problème critique non résolu.', bullets: ['Impact financier fort', 'Solutions existantes inadaptées', 'Marché en attente'] },
    { title: 'Notre Solution', content: profile.solution || 'La solution innovante.', bullets: ['Simple à déployer', 'ROI immédiat', profile.competitiveAdvantage || 'Tech propriétaire'] },
    { title: 'Marché', content: `TAM addressable : milliards €`, bullets: [`Cible : ${profile.clientType || 'PME'}`, `Modèle : ${profile.businessModel || 'SaaS'}`, 'Croissance marché +25%/an'] },
    { title: 'Produit', content: 'Interface intuitive, déploiement rapide, intégrations natives.', bullets: ['Onboarding < 48h', 'API & intégrations', 'Dashboard temps réel'] },
    { title: 'Business Model', content: `Abonnement mensuel ${profile.businessModel || 'SaaS'} avec upsell.`, bullets: ['Récurrence mensuelle', 'NRR > 110%', 'LTV/CAC > 3'] },
    { title: 'Traction', content: `${profile.activeClients ?? 0} clients actifs, ${mrr} MRR.`, bullets: [`MRR : ${mrr}`, `Clients : ${profile.activeClients ?? 0}`, `Croissance : ${profile.momGrowth ?? 0}%/mois`] },
    { title: 'Équipe', content: `${profile.teamSize ?? 2} fondateurs expérimentés.`, bullets: [profile.hasCTO ? 'CTO ✓' : 'CTO recherché', `${profile.teamSize ?? 2} personnes`, 'Background secteur'] },
    { title: 'Roadmap', content: '18 mois pour atteindre les prochains milestones.', bullets: ['Q1 : Produit V2', 'Q2 : 50 clients', 'Q3 : Expansion EU'] },
    { title: 'Call to Action', content: `Nous levons ${goal} pour accélérer.`, bullets: [`Montant : ${goal}`, `Dilution : ${profile.maxDilution ?? 20}%`, 'Closing : 3 mois'] },
  ];
}

function getTeaserSlides(profile: ReturnType<typeof useUserProfile>['profile']): Slide[] {
  const name = profile.startupName || 'Ma Startup';
  const goal = fmtMoney(profile.fundraisingGoal);
  const mrr = fmtMoney(profile.mrr);
  return [
    {
      title: 'Proposition de valeur',
      content: `${name} — ${profile.sector || 'Tech'} · ${profile.stage || 'Seed'}`,
      bullets: [profile.problem ? `Problème : ${profile.problem.slice(0, 80)}…` : 'Problème majeur non résolu', profile.solution ? `Solution : ${profile.solution.slice(0, 80)}…` : 'Solution innovante'],
    },
    {
      title: 'Métriques clés',
      content: 'Traction démontrée',
      bullets: [`MRR : ${mrr}`, `Clients : ${profile.activeClients ?? 0}`, `Croissance : ${profile.momGrowth ?? 0}%/mois`, `Runway : ${profile.runway ?? 0} mois`],
    },
    {
      title: 'Opportunité d\'investissement',
      content: `Levée de ${goal} en cours.`,
      bullets: [`Montant recherché : ${goal}`, `Dilution max : ${profile.maxDilution ?? 20}%`, `Secteur : ${profile.sector || 'Tech'}`, `Contact : ${profile.email || 'contact@startup.com'}`],
    },
  ];
}

function getImprovements(type: DocType, profile: ReturnType<typeof useUserProfile>['profile']): { id: string; label: string; done: boolean; priority: 'high' | 'medium' | 'low' }[] {
  const checks: { id: string; label: string; done: boolean; priority: 'high' | 'medium' | 'low' }[] = [];
  if (type === 'bp' || type === 'deck') {
    checks.push({ id: 'problem', label: 'Décrire précisément le problème (> 50 mots)', done: (profile.problem?.length ?? 0) > 50, priority: 'high' });
    checks.push({ id: 'solution', label: 'Détailler la solution proposée (> 50 mots)', done: (profile.solution?.length ?? 0) > 50, priority: 'high' });
    checks.push({ id: 'advantage', label: 'Préciser l\'avantage concurrentiel unique', done: (profile.competitiveAdvantage?.length ?? 0) > 20, priority: 'high' });
    checks.push({ id: 'biz', label: 'Définir le modèle économique', done: !!profile.businessModel, priority: 'high' });
    checks.push({ id: 'sector', label: 'Renseigner le secteur d\'activité', done: !!profile.sector, priority: 'medium' });
    checks.push({ id: 'clients', label: 'Préciser le type de clients cibles', done: !!profile.clientType, priority: 'medium' });
    checks.push({ id: 'mrr', label: 'Renseigner le MRR actuel', done: !!profile.mrr && profile.mrr > 0, priority: 'medium' });
    checks.push({ id: 'team', label: 'Compléter la taille de l\'équipe', done: !!profile.teamSize && profile.teamSize >= 2, priority: 'medium' });
    checks.push({ id: 'cto', label: 'Identifier un CTO ou co-fondateur tech', done: !!profile.hasCTO, priority: 'medium' });
    checks.push({ id: 'goal', label: 'Définir l\'objectif de levée', done: !!profile.fundraisingGoal, priority: 'high' });
    checks.push({ id: 'dilution', label: 'Fixer la dilution maximum acceptée', done: !!profile.maxDilution, priority: 'low' });
    checks.push({ id: 'moat', label: 'Expliquer les barrières à l\'entrée (moat)', done: (profile.moat?.length ?? 0) > 20, priority: 'low' });
  }
  if (type === 'deck') {
    checks.push({ id: 'deck-file', label: 'Générer le deck via le Générateur IA', done: !!profile.deckFileName, priority: 'high' });
    checks.push({ id: 'growth', label: 'Renseigner la croissance MoM', done: !!profile.momGrowth, priority: 'medium' });
    checks.push({ id: 'ambition', label: 'Définir l\'ambition à 5 ans', done: (profile.ambition?.length ?? 0) > 10, priority: 'low' });
  }
  if (type === 'teaser') {
    checks.push({ id: 'name', label: 'Renseigner le nom de la startup', done: !!profile.startupName, priority: 'high' });
    checks.push({ id: 't-sector', label: 'Définir le secteur d\'activité', done: !!profile.sector, priority: 'high' });
    checks.push({ id: 't-problem', label: 'Décrire le problème en 1 phrase', done: (profile.problem?.length ?? 0) > 10, priority: 'high' });
    checks.push({ id: 't-goal', label: 'Indiquer le montant recherché', done: !!profile.fundraisingGoal, priority: 'high' });
    checks.push({ id: 't-mrr', label: 'Renseigner les métriques clés (MRR, clients)', done: !!profile.mrr || !!profile.activeClients, priority: 'medium' });
    checks.push({ id: 't-email', label: 'Vérifier l\'email de contact', done: !!profile.email, priority: 'medium' });
  }
  return checks.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  });
}

// ─── Slide preview component ──────────────────────────────────────────────────

const SlidePreview: React.FC<{ slide: Slide; branding: DocBranding; isActive: boolean }> = ({ slide, branding, isActive }) => {
  const onPrimary = isColorDark(branding.primaryColor) ? '#fff' : '#111';
  const fontFamily = FONT_MAP[branding.fontStyle];
  return (
    <div
      className="rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all"
      style={{ fontFamily, outline: isActive ? `2px solid ${branding.primaryColor}` : 'none' }}
    >
      {/* Header band */}
      <div className="px-4 py-3" style={{ backgroundColor: branding.primaryColor }}>
        <p className="text-[13px] font-bold truncate" style={{ color: onPrimary }}>{slide.title}</p>
      </div>
      {/* Content */}
      <div className="p-4 bg-white min-h-[90px]">
        <p className="text-[12px] text-gray-700 leading-relaxed mb-2 line-clamp-2">{slide.content}</p>
        {slide.bullets && (
          <ul className="space-y-1">
            {slide.bullets.slice(0, 3).map((b, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-500">
                <span className="font-bold shrink-0" style={{ color: branding.primaryColor }}>·</span>
                <span className="truncate">{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Footer accent */}
      <div className="h-1" style={{ backgroundColor: branding.secondaryColor }} />
    </div>
  );
};

// ─── Editable slide ───────────────────────────────────────────────────────────

const EditableSlide: React.FC<{
  slide: Slide;
  branding: DocBranding;
  onChange: (s: Slide) => void;
}> = ({ slide, branding, onChange }) => {
  const [editing, setEditing] = useState(false);
  const onPrimary = isColorDark(branding.primaryColor) ? '#fff' : '#111';
  const fontFamily = FONT_MAP[branding.fontStyle];

  if (!editing) {
    return (
      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm group" style={{ fontFamily }}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ backgroundColor: branding.primaryColor }}>
          <p className="text-[14px] font-bold" style={{ color: onPrimary }}>{slide.title}</p>
          <button onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: onPrimary }}>
            <Edit2 className="h-3 w-3" /> Éditer
          </button>
        </div>
        <div className="p-5 bg-white">
          <p className="text-[13px] text-gray-700 leading-relaxed mb-3">{slide.content}</p>
          {slide.bullets && (
            <ul className="space-y-1.5">
              {slide.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-gray-600">
                  <span className="font-black text-[11px] mt-0.5 shrink-0" style={{ color: branding.primaryColor }}>→</span>
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="h-1.5" style={{ backgroundColor: branding.secondaryColor }} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border-2 shadow-md" style={{ borderColor: branding.primaryColor, fontFamily }}>
      <div className="flex items-center justify-between px-5 py-3.5" style={{ backgroundColor: branding.primaryColor }}>
        <input
          className="text-[14px] font-bold bg-transparent outline-none flex-1"
          style={{ color: onPrimary }}
          value={slide.title}
          onChange={e => onChange({ ...slide, title: e.target.value })}
        />
        <button onClick={() => setEditing(false)}
          className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: onPrimary }}>
          <Save className="h-3 w-3" /> Sauver
        </button>
      </div>
      <div className="p-5 bg-white space-y-3">
        <textarea
          rows={3}
          className="w-full text-[13px] text-gray-700 border border-gray-200 rounded-lg p-2.5 resize-none outline-none focus:border-gray-400"
          value={slide.content}
          onChange={e => onChange({ ...slide, content: e.target.value })}
        />
        {slide.bullets && (
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Points clés</p>
            {slide.bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-black text-[11px]" style={{ color: branding.primaryColor }}>→</span>
                <input
                  className="flex-1 text-[12px] border-b border-gray-200 outline-none py-0.5 focus:border-gray-500"
                  value={b}
                  onChange={e => {
                    const nb = [...slide.bullets!]; nb[i] = e.target.value;
                    onChange({ ...slide, bullets: nb });
                  }}
                />
                <button onClick={() => {
                  const nb = slide.bullets!.filter((_, j) => j !== i);
                  onChange({ ...slide, bullets: nb });
                }}><X className="h-3.5 w-3.5 text-gray-400 hover:text-red-400" /></button>
              </div>
            ))}
            <button
              onClick={() => onChange({ ...slide, bullets: [...(slide.bullets ?? []), 'Nouveau point'] })}
              className="text-[11px] font-semibold" style={{ color: branding.primaryColor }}>
              + Ajouter un point
            </button>
          </div>
        )}
      </div>
      <div className="h-1.5" style={{ backgroundColor: branding.secondaryColor }} />
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const DOC_META: Record<DocType, { label: string; color: string; bg: string; border: string }> = {
  bp:     { label: 'Business Plan',       color: '#92520A', bg: '#FFFBF5', border: '#FFB96D' },
  deck:   { label: 'Pitch Deck',          color: '#3730A3', bg: '#F5F7FF', border: '#C7D2FE' },
  teaser: { label: 'Teaser Investisseur', color: '#2D6A00', bg: '#F0FFF4', border: '#D8FFBD' },
};

const DocumentEditorPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  const docType = (type === 'bp' || type === 'deck' || type === 'teaser' ? type : 'deck') as DocType;
  const meta = DOC_META[docType];

  const [branding, setBranding] = useState<DocBranding>({
    primaryColor: '#0A0A0A',
    secondaryColor: '#F4B8CC',
    fontStyle: 'moderne',
  });

  const [activeSlide, setActiveSlide] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const initialSlides = useMemo(() => {
    if (docType === 'bp') return getBPSlides(profile);
    if (docType === 'teaser') return getTeaserSlides(profile);
    return getDeckSlides(profile);
  }, [docType, profile]);

  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const improvements = useMemo(() => getImprovements(docType, profile), [docType, profile]);

  const doneCount = improvements.filter(i => i.done || checkedItems.has(i.id)).length;
  const completionPct = Math.round((doneCount / improvements.length) * 100);

  const toggleCheck = (id: string) => setCheckedItems(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210; const M = 15;
    let y = 0;

    const txt = (text: string, x: number, yy: number, size: number, bold = false, r = 50, g = 50, b = 50) => {
      doc.setFontSize(size); doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setTextColor(r, g, b); doc.text(text, x, yy);
    };

    const hexToRgb = (hex: string): [number, number, number] => {
      const c = hex.replace('#', ''); const n = parseInt(c, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const [pr, pg, pb] = hexToRgb(branding.primaryColor);
    const [sr, sg, sb] = hexToRgb(branding.secondaryColor);

    doc.setFillColor(pr, pg, pb);
    doc.rect(0, 0, W, 25, 'F');
    doc.setFillColor(sr, sg, sb);
    doc.rect(0, 25, W, 3, 'F');
    txt(meta.label, M, 11, 14, true, 255, 255, 255);
    txt(`${profile.startupName || 'Ma Startup'} · ${new Date().toLocaleDateString('fr-FR')}`, M, 19, 8, false, 200, 200, 200);
    y = 36;

    slides.forEach((slide, i) => {
      if (y > 260) { doc.addPage(); y = 15; }
      doc.setFillColor(pr, pg, pb);
      doc.rect(M, y, W - 2 * M, 7, 'F');
      txt(slide.title, M + 2, y + 5, 10, true, 255, 255, 255);
      y += 10;
      const lines = doc.splitTextToSize(slide.content, W - 2 * M);
      lines.forEach((line: string) => {
        if (y > 265) { doc.addPage(); y = 15; }
        txt(line, M, y, 9, false, 60, 60, 60);
        y += 5;
      });
      if (slide.bullets) {
        slide.bullets.forEach(b => {
          if (y > 265) { doc.addPage(); y = 15; }
          txt(`→ ${b}`, M + 3, y, 8, false, 80, 80, 80);
          y += 4.5;
        });
      }
      doc.setFillColor(sr, sg, sb);
      doc.rect(M, y, W - 2 * M, 1.5, 'F');
      y += 6;
    });

    doc.save(`${docType}-${(profile.startupName || 'startup').replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="min-h-full py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F8F8F8' }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="rounded-2xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap"
          style={{ backgroundColor: '#0A0A0A' }}>
          <div>
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-[12px] mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <ChevronLeft className="h-3.5 w-3.5" /> Retour au dashboard
            </button>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: meta.border, color: meta.color }}>
                {meta.label}
              </span>
              <h1 className="text-[20px] font-black text-white">{profile.startupName || 'Ma Startup'}</h1>
            </div>
            <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {slides.length} sections · Complétion {completionPct}%
            </p>
          </div>
          <button onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-bold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#F4B8CC', color: '#0A0A0A' }}>
            <Download className="h-4 w-4" /> Télécharger PDF
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Editor + checklist ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Branding panel */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-4 w-4" style={{ color: '#C4728A' }} />
                <h2 className="text-[15px] font-bold text-gray-900">Charte graphique</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Couleur primaire */}
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Couleur principale</p>
                  <div className="flex items-center gap-2 mb-2">
                    <input type="color" value={branding.primaryColor}
                      onChange={e => setBranding(p => ({ ...p, primaryColor: e.target.value }))}
                      className="h-8 w-14 rounded border cursor-pointer" />
                    <span className="text-[12px] font-mono text-gray-500">{branding.primaryColor}</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {COLOR_PRESETS.map(p => (
                      <button key={p.primary}
                        onClick={() => setBranding(b => ({ ...b, primaryColor: p.primary, secondaryColor: p.secondary }))}
                        className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                        style={{ backgroundColor: p.primary, borderColor: branding.primaryColor === p.primary ? '#666' : '#E5E7EB' }} />
                    ))}
                  </div>
                </div>
                {/* Couleur secondaire */}
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Couleur accentuation</p>
                  <div className="flex items-center gap-2 mb-2">
                    <input type="color" value={branding.secondaryColor}
                      onChange={e => setBranding(p => ({ ...p, secondaryColor: e.target.value }))}
                      className="h-8 w-14 rounded border cursor-pointer" />
                    <span className="text-[12px] font-mono text-gray-500">{branding.secondaryColor}</span>
                  </div>
                </div>
                {/* Police */}
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    <Type className="h-3.5 w-3.5 inline mr-1" />Police
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {(['moderne', 'classique', 'élégant'] as const).map(f => (
                      <button key={f} onClick={() => setBranding(b => ({ ...b, fontStyle: f }))}
                        className="px-3 py-1 rounded-full text-[12px] font-semibold border transition-all"
                        style={{
                          backgroundColor: branding.fontStyle === f ? '#0A0A0A' : '#F9FAFB',
                          color: branding.fontStyle === f ? '#fff' : '#374151',
                          borderColor: branding.fontStyle === f ? '#0A0A0A' : '#E5E7EB',
                        }}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Slides éditables */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" style={{ color: '#C4728A' }} />
                <h2 className="text-[15px] font-bold text-gray-900">Contenu — cliquez sur une section pour éditer</h2>
              </div>
              {slides.map((slide, i) => (
                <EditableSlide
                  key={i}
                  slide={slide}
                  branding={branding}
                  onChange={updated => {
                    const ns = [...slides]; ns[i] = updated; setSlides(ns);
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── Right: Preview + checklist ── */}
          <div className="space-y-5">

            {/* Mini preview */}
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[14px] font-bold text-gray-900">Aperçu</h2>
                <div className="flex gap-1">
                  {slides.map((_, i) => (
                    <button key={i} onClick={() => setActiveSlide(i)}
                      className="w-2 h-2 rounded-full transition-all"
                      style={{ backgroundColor: i === activeSlide ? branding.primaryColor : '#E5E7EB' }} />
                  ))}
                </div>
              </div>
              <SlidePreview slide={slides[activeSlide] ?? slides[0]} branding={branding} isActive />
              <div className="flex justify-between mt-2">
                <button onClick={() => setActiveSlide(i => Math.max(0, i - 1))}
                  className="text-[11px] text-gray-400 hover:text-gray-700 disabled:opacity-30"
                  disabled={activeSlide === 0}>← Préc</button>
                <span className="text-[11px] text-gray-400">{activeSlide + 1}/{slides.length}</span>
                <button onClick={() => setActiveSlide(i => Math.min(slides.length - 1, i + 1))}
                  className="text-[11px] text-gray-400 hover:text-gray-700 disabled:opacity-30"
                  disabled={activeSlide === slides.length - 1}>Suiv →</button>
              </div>
            </div>

            {/* Checklist améliorations */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[14px] font-bold text-gray-900">Points à améliorer</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: completionPct >= 80 ? '#D8FFBD' : completionPct >= 50 ? '#FFE8C2' : '#FFB3B3', color: completionPct >= 80 ? '#2D6A00' : completionPct >= 50 ? '#92520A' : '#8F1A1A' }}>
                  {doneCount}/{improvements.length}
                </span>
              </div>
              {/* Barre */}
              <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ backgroundColor: '#F3F4F6' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionPct}%`, backgroundColor: completionPct >= 80 ? '#2D6A00' : completionPct >= 50 ? '#92520A' : '#C4728A' }} />
              </div>
              <div className="space-y-2">
                {improvements.map(item => {
                  const done = item.done || checkedItems.has(item.id);
                  return (
                    <button key={item.id} onClick={() => !item.done && toggleCheck(item.id)}
                      className="w-full flex items-start gap-2.5 text-left p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={item.done}>
                      <div className="mt-0.5 shrink-0">
                        {done
                          ? <CheckCircle2 className="h-4 w-4" style={{ color: '#2D6A00' }} />
                          : <Circle className="h-4 w-4" style={{ color: item.priority === 'high' ? '#C4728A' : item.priority === 'medium' ? '#92520A' : '#9CA3AF' }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[12px] font-medium leading-tight ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {item.label}
                        </p>
                        {!done && (
                          <span className="text-[10px] font-bold"
                            style={{ color: item.priority === 'high' ? '#C4728A' : item.priority === 'medium' ? '#92520A' : '#9CA3AF' }}>
                            {item.priority === 'high' ? 'Prioritaire' : item.priority === 'medium' ? 'Important' : 'Optionnel'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditorPage;
