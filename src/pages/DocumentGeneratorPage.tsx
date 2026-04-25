import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Upload,
  Sparkles,
  Download,
  CheckCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Users,
  Target,
  Lightbulb,
  Palette,
  Type,
  Eye,
  RefreshCw,
  Presentation,
  Zap,
} from 'lucide-react';
import clsx from 'clsx';
import { jsPDF } from 'jspdf';
import { generatePitchDeck } from '../services/generateDeck';
import { generateBusinessPlan } from '../services/generateBusinessPlan';
import { generateExecutiveSummary } from '../services/generateExecutiveSummary';
import { useUserProfile } from '../hooks/useUserProfile';

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function isColorDark(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}

const FONT_FAMILIES: Record<string, string> = {
  inter:    'Inter, system-ui, sans-serif',
  georgia:  'Georgia, "Times New Roman", serif',
  poppins:  '"Trebuchet MS", system-ui, sans-serif',
  playfair: 'Georgia, "Palatino Linotype", serif',
  roboto:   'Arial, Helvetica, sans-serif',
};

function mapSectorToDocGen(s: string): string {
  const l = s.toLowerCase();
  if (l.includes('saas') || l.includes('logiciel')) return 'SaaS';
  if (l.includes('fintech') || l.includes('finance') || l.includes('insurtech')) return 'FinTech';
  if (l.includes('health') || l.includes('santé') || l.includes('médical')) return 'HealthTech';
  if (l.includes('green') || l.includes('clean') || l.includes('énergie')) return 'GreenTech';
  if (l.includes('ia') || l.includes('intelligence artificielle') || l.includes('data')) return 'Intelligence Artificielle';
  if (l.includes('medtech')) return 'MedTech';
  if (l.includes('biotech')) return 'BioTech';
  if (l.includes('edtech') || l.includes('hrtech')) return 'EdTech';
  if (l.includes('marketplace') || l.includes('e-commerce')) return 'Marketplace';
  if (l.includes('proptech')) return 'PropTech';
  if (l.includes('agritech')) return 'AgriTech';
  if (l.includes('cyber')) return 'Cybersécurité';
  if (l.includes('deeptech') || l.includes('deep tech')) return 'Deeptech';
  return s;
}

function mapStageToDocGen(s: string): string {
  const l = (s || '').toLowerCase();
  if (l === 'pre-seed' || l.includes('pre') || l.includes('pré') || l.includes('amorç') || l.includes('idéat')) return 'pre-seed';
  if (l === 'seed' || l.includes('seed') || l.includes('mvp')) return 'seed';
  if (l === 'series-a' || l === 'serie-a' || l.includes('série') || l.includes('series')) return 'series-a';
  return '';
}

function fmtMoney(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M€`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K€`;
  return `${n}€`;
}

// ─── Deck slide preview ───────────────────────────────────────────────────────

const SLIDE_TYPES = ['Couverture', 'Problème', 'Solution', 'Équipe', 'Traction'] as const;
type SlideType = typeof SLIDE_TYPES[number];

interface DeckSlidePreviewProps {
  branding: BrandingInfo;
  info: StartupInfo;
}

const DeckSlidePreview: React.FC<DeckSlidePreviewProps> = ({ branding, info }) => {
  const [slideIdx, setSlideIdx] = useState(0);
  const fontFamily = FONT_FAMILIES[branding.font] ?? FONT_FAMILIES.inter;
  const onPrimary = isColorDark(branding.primaryColor) ? '#FFFFFF' : '#111111';
  const onSecondary = isColorDark(branding.secondaryColor) ? '#FFFFFF' : '#111111';
  const slideType = SLIDE_TYPES[slideIdx] as SlideType;

  const prev = () => setSlideIdx(i => (i - 1 + SLIDE_TYPES.length) % SLIDE_TYPES.length);
  const next = () => setSlideIdx(i => (i + 1) % SLIDE_TYPES.length);

  const startupName = info.name || 'Ma Startup';
  const sector = info.sector || 'Technologie';

  return (
    <div className="flex flex-col gap-3">
      {/* Slide frame — 16:9 */}
      <div
        className="relative w-full overflow-hidden shadow-xl"
        style={{ aspectRatio: '16/9', borderRadius: 12, fontFamily, backgroundColor: '#fff' }}
      >
        {/* ── Cover slide ── */}
        {slideType === 'Couverture' && (
          <div className="absolute inset-0 flex flex-col">
            {/* Header band */}
            <div className="h-[30%] flex items-center px-[6%] shrink-0"
              style={{ backgroundColor: branding.primaryColor }}>
              {branding.logo
                ? <img src={branding.logo} alt="logo" className="h-[55%] w-auto object-contain" />
                : <span className="text-[2.2cqi] font-black" style={{ color: onPrimary }}>{startupName}</span>}
            </div>
            {/* Content */}
            <div className="flex-1 flex flex-col justify-center px-[6%] py-[4%]">
              <p className="text-[2.8cqi] font-black leading-tight text-gray-900 mb-[2%]">{startupName}</p>
              <p className="text-[1.6cqi] text-gray-500 mb-[3%]">{sector}</p>
              {info.fundingAmount && (
                <span className="self-start text-[1.3cqi] font-bold px-[2.5%] py-[1%] rounded-full"
                  style={{ backgroundColor: branding.secondaryColor, color: onSecondary }}>
                  Levée : {info.fundingAmount.includes('€') ? info.fundingAmount : `${info.fundingAmount}€`}
                </span>
              )}
            </div>
            {/* Footer */}
            <div className="h-[6%] shrink-0" style={{ backgroundColor: branding.secondaryColor }} />
          </div>
        )}

        {/* ── Problème slide ── */}
        {slideType === 'Problème' && (
          <div className="absolute inset-0 flex flex-col">
            <div className="h-[18%] flex items-center px-[6%] shrink-0"
              style={{ backgroundColor: branding.primaryColor }}>
              <span className="text-[1.8cqi] font-bold" style={{ color: onPrimary }}>Le Problème</span>
            </div>
            <div className="flex-1 px-[6%] py-[4%] flex flex-col justify-center gap-[2%]">
              <p className="text-[1.4cqi] text-gray-700 leading-relaxed line-clamp-4">
                {info.problem || '95% des entreprises perdent du temps sur des processus manuels qui pourraient être automatisés — coûtant en moyenne 25% de productivité.'}
              </p>
              <div className="flex gap-[2%] mt-[2%]">
                {['Coûteux', 'Lent', 'Obsolète'].map(tag => (
                  <span key={tag} className="text-[1.1cqi] font-semibold px-[2%] py-[0.8%] rounded-full"
                    style={{ backgroundColor: branding.primaryColor + '18', color: branding.primaryColor }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="h-[5%] shrink-0" style={{ backgroundColor: branding.secondaryColor }} />
          </div>
        )}

        {/* ── Solution slide ── */}
        {slideType === 'Solution' && (
          <div className="absolute inset-0 flex flex-col">
            <div className="h-[18%] flex items-center px-[6%] shrink-0"
              style={{ backgroundColor: branding.primaryColor }}>
              <span className="text-[1.8cqi] font-bold" style={{ color: onPrimary }}>Notre Solution</span>
            </div>
            <div className="flex-1 px-[6%] py-[4%] flex gap-[4%]">
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-[1.4cqi] font-bold text-gray-900 mb-[2%]">{startupName}</p>
                <p className="text-[1.2cqi] text-gray-600 leading-relaxed line-clamp-5">
                  {info.solution || 'Une plateforme intelligente qui automatise les workflows critiques et libère les équipes pour se concentrer sur la création de valeur.'}
                </p>
              </div>
              <div className="w-[30%] flex items-center justify-center">
                <div className="w-full aspect-square rounded-xl flex items-center justify-center text-[3cqi]"
                  style={{ backgroundColor: branding.secondaryColor }}>
                  💡
                </div>
              </div>
            </div>
            <div className="h-[5%] shrink-0" style={{ backgroundColor: branding.secondaryColor }} />
          </div>
        )}

        {/* ── Équipe slide ── */}
        {slideType === 'Équipe' && (
          <div className="absolute inset-0 flex flex-col">
            <div className="h-[18%] flex items-center px-[6%] shrink-0"
              style={{ backgroundColor: branding.primaryColor }}>
              <span className="text-[1.8cqi] font-bold" style={{ color: onPrimary }}>L'Équipe</span>
            </div>
            <div className="flex-1 px-[6%] py-[4%] flex gap-[3%] items-center">
              {[
                { role: 'CEO', color: branding.primaryColor },
                { role: 'CTO', color: branding.secondaryColor },
                { role: 'CMO', color: branding.primaryColor + '80' },
              ].map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-[3%]">
                  <div className="w-[28%] aspect-square rounded-full flex items-center justify-center text-[1.8cqi] font-black"
                    style={{ backgroundColor: m.color, color: isColorDark(m.color.slice(0, 7)) ? '#fff' : '#111' }}>
                    {m.role[0]}
                  </div>
                  <p className="text-[1.1cqi] font-bold text-gray-900">{m.role}</p>
                  <p className="text-[0.9cqi] text-gray-400 text-center">Expert secteur</p>
                </div>
              ))}
            </div>
            <div className="h-[5%] shrink-0" style={{ backgroundColor: branding.secondaryColor }} />
          </div>
        )}

        {/* ── Traction slide ── */}
        {slideType === 'Traction' && (
          <div className="absolute inset-0 flex flex-col">
            <div className="h-[18%] flex items-center px-[6%] shrink-0"
              style={{ backgroundColor: branding.primaryColor }}>
              <span className="text-[1.8cqi] font-bold" style={{ color: onPrimary }}>Traction</span>
            </div>
            <div className="flex-1 px-[6%] py-[4%] grid grid-cols-3 gap-[3%] content-center">
              {[
                { label: 'MRR', value: info.revenue ? `${info.revenue}€` : '—' },
                { label: 'Clients', value: info.employees ? `${info.employees}` : '—' },
                { label: 'Levée', value: info.fundingAmount ? `${info.fundingAmount}€` : '—' },
              ].map(kpi => (
                <div key={kpi.label} className="rounded-xl p-[3%] flex flex-col gap-[2%]"
                  style={{ backgroundColor: branding.secondaryColor + '40', border: `1px solid ${branding.secondaryColor}` }}>
                  <p className="text-[0.9cqi] font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</p>
                  <p className="text-[2.2cqi] font-black" style={{ color: branding.primaryColor }}>{kpi.value}</p>
                </div>
              ))}
            </div>
            <div className="h-[5%] shrink-0" style={{ backgroundColor: branding.secondaryColor }} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prev}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" />Préc
        </button>

        <div className="flex items-center gap-1.5">
          {SLIDE_TYPES.map((_, i) => (
            <button key={i} onClick={() => setSlideIdx(i)}
              className="w-2 h-2 rounded-full transition-all"
              style={{ backgroundColor: i === slideIdx ? branding.primaryColor : '#D1D5DB' }} />
          ))}
        </div>

        <button onClick={next}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          Suiv<ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Slide label */}
      <p className="text-[11px] font-semibold text-center text-gray-400 uppercase tracking-widest">
        Slide {slideIdx + 1}/{SLIDE_TYPES.length} — {slideType}
      </p>
    </div>
  );
};

type Step = 'info' | 'customization' | 'selection' | 'generating' | 'results';

interface StartupInfo {
  name: string;
  sector: string;
  stage: string;
  fundingAmount: string;
  description: string;
  revenue: string;
  employees: string;
  problem: string;
  solution: string;
  targetMarket: string;
}

interface BrandingInfo {
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  font: string;
}

interface DocItem {
  id: string;
  name: string;
  description: string;
  pages: number;
  icon: React.ElementType;
  selected: boolean;
}

const SECTORS = [
  'FinTech', 'HealthTech', 'EdTech', 'GreenTech', 'SaaS', 'E-commerce',
  'Deeptech', 'BioTech', 'Marketplace', 'MedTech', 'PropTech', 'InsurTech',
  'AgriTech', 'Cybersécurité', 'Intelligence Artificielle', 'Autre'
];

const STAGES = [
  { value: 'pre-seed', label: 'Pre-seed' },
  { value: 'seed', label: 'Seed' },
  { value: 'series-a', label: 'Série A' }
];

const FONTS = [
  { value: 'inter', label: 'Inter', sub: 'Moderne' },
  { value: 'georgia', label: 'Georgia', sub: 'Classique' },
  { value: 'poppins', label: 'Poppins', sub: 'Dynamique' },
  { value: 'playfair', label: 'Playfair', sub: 'Élégant' },
  { value: 'roboto', label: 'Roboto', sub: 'Neutre' }
];

const PRIMARY_PRESETS = ['#1d1d1b', '#2563EB', '#7C3AED', '#DC2626', '#059669'];
const SECONDARY_PRESETS = ['#d8ffbd', '#DBEAFE', '#EDE9FE', '#FEE2E2', '#D1FAE5'];

const INITIAL_DOCS: DocItem[] = [
  {
    id: 'pitch_deck',
    name: 'Pitch Deck',
    description: 'Présentation visuelle de 12-15 slides pour convaincre les investisseurs',
    pages: 14,
    icon: Presentation,
    selected: true
  },
  {
    id: 'business_plan',
    name: 'Business Plan',
    description: 'Document complet de 25-30 pages avec projections financières détaillées',
    pages: 28,
    icon: BookOpen,
    selected: false
  },
  {
    id: 'executive_summary',
    name: 'Executive Summary',
    description: 'Résumé exécutif de 2-3 pages pour une première prise de contact',
    pages: 3,
    icon: FileText,
    selected: false
  }
];

const STEPS = [
  { id: 'info', label: 'Informations', number: 1 },
  { id: 'customization', label: 'Personnalisation', number: 2 },
  { id: 'selection', label: 'Documents', number: 3 },
  { id: 'results', label: 'Résultats', number: 4 }
];

const DocumentGeneratorPage: React.FC = () => {
  const { profile } = useUserProfile();
  const [darkMode, setDarkMode] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatingDocId, setGeneratingDocId] = useState<string | null>(null);
  const [generatedDocs, setGeneratedDocs] = useState<Set<string>>(new Set());
  const [prefilled, setPrefilled] = useState(false);
  const [existingDeckPdf, setExistingDeckPdf] = useState<{ base64: string; name: string } | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [info, setInfo] = useState<StartupInfo>({
    name: '', sector: '', stage: '', fundingAmount: '',
    description: '', revenue: '', employees: '',
    problem: '', solution: '', targetMarket: ''
  });

  const [branding, setBranding] = useState<BrandingInfo>({
    logo: null,
    primaryColor: '#1d1d1b',
    secondaryColor: '#d8ffbd',
    font: 'inter'
  });

  const [docs, setDocs] = useState<DocItem[]>(INITIAL_DOCS);
  const [generationError, setGenerationError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generatedContentRef = useRef<Record<string, any>>({});

  // Pre-fill from user profile
  useEffect(() => {
    if (!profile.startupName && !profile.sector) return;
    const mrr = profile.mrr ?? 0;
    setInfo({
      name: profile.startupName || '',
      sector: mapSectorToDocGen(profile.sector || ''),
      stage: mapStageToDocGen(profile.stage || ''),
      fundingAmount: profile.fundraisingGoal ? fmtMoney(profile.fundraisingGoal) : '',
      description: profile.description || '',
      revenue: mrr > 0 ? fmtMoney(mrr) : '',
      employees: profile.teamSize ? String(profile.teamSize) : '',
      problem: profile.problem || '',
      solution: profile.solution || '',
      targetMarket: profile.clientType || '',
    });
    setPrefilled(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.startupName, profile.sector]);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBranding(p => ({ ...p, logo: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      // dataUrl = "data:application/pdf;base64,<data>" → extract base64 part
      const base64 = dataUrl.split(',')[1];
      setExistingDeckPdf({ base64, name: file.name });
    };
    reader.readAsDataURL(file);
  };

  const toggleDoc = (id: string) =>
    setDocs(prev => prev.map(d => d.id === id ? { ...d, selected: !d.selected } : d));

  const isInfoValid = () =>
    !!(info.name && info.sector && info.stage && info.fundingAmount && info.description);

  const selectedDocs = docs.filter(d => d.selected);

  const startupPayload = {
    name: info.name,
    sector: info.sector,
    stage: info.stage,
    funding_amount: info.fundingAmount,
    description: info.description,
    revenue: info.revenue,
    employees: info.employees ? parseInt(info.employees) : 0,
    problem: info.problem,
    solution: info.solution,
    target_market: info.targetMarket,
  };

  const runGeneration = async () => {
    setCurrentStep('generating');
    setGeneratedDocs(new Set());
    setGenerationError(null);
    generatedContentRef.current = {};

    const serviceMap: Record<string, () => Promise<{ documentId: string; content: unknown }>> = {
      pitch_deck: () => generatePitchDeck(startupPayload, undefined, existingDeckPdf?.base64),
      business_plan: () => generateBusinessPlan(startupPayload),
      executive_summary: () => generateExecutiveSummary(startupPayload),
    };

    for (const doc of docs.filter(d => d.selected)) {
      setGeneratingDocId(doc.id);
      setGenerationProgress(0);

      // Animate progress while waiting for API
      const interval = setInterval(() => {
        setGenerationProgress(prev => (prev < 85 ? prev + 5 : prev));
      }, 400);

      try {
        const result = await serviceMap[doc.id]();
        generatedContentRef.current[doc.id] = result.content;
        clearInterval(interval);
        setGenerationProgress(100);
        await new Promise(r => setTimeout(r, 300));
        setGeneratedDocs(prev => new Set([...prev, doc.id]));
      } catch (err) {
        clearInterval(interval);
        setGenerationError(err instanceof Error ? err.message : 'Erreur inconnue');
        setCurrentStep('selection');
        setGeneratingDocId(null);
        return;
      }
    }

    setGeneratingDocId(null);
    setCurrentStep('results');
  };

  const handleDownload = (docId: string, docName: string) => {
    const content = generatedContentRef.current[docId];
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Apply branding
    const [r1, g1, b1] = hexToRgb(branding.primaryColor);
    const [r2, g2, b2] = hexToRgb(branding.secondaryColor);

    // Header band
    doc.setFillColor(r1, g1, b1);
    doc.rect(0, 0, 210, 18, 'F');
    doc.setFillColor(r2, g2, b2);
    doc.rect(0, 18, 210, 4, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(docName, 10, 12);

    doc.setTextColor(r1, g1, b1);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    let y = 30;
    const pageH = 280;
    const addPage = () => { doc.addPage(); y = 20; };

    if (content) {
      const lines = JSON.stringify(content, null, 2).split('\n');
      lines.forEach(line => {
        if (y > pageH) addPage();
        doc.text(line.substring(0, 90), 10, y);
        y += 5;
      });
    } else {
      doc.text(`${docName} — ${info.name}`, 10, y);
    }

    doc.save(`${docName.replace(/ /g, '_')}_${info.name}.pdf`);
  };

  const stepIndex = STEPS.findIndex(s => s.id === currentStep);

  // ─── Shared style helpers ───────────────────────────────────────────────────
  const card = clsx(
    'rounded-xl border p-6',
    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  );
  const inputCls = clsx(
    'w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-primary',
    darkMode
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  );
  const label = clsx('block text-sm font-medium mb-1.5', darkMode ? 'text-gray-300' : 'text-gray-700');
  const btnBack = clsx(
    'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors',
    darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
  );

  return (
    <div className={clsx('min-h-screen px-4 sm:px-6 lg:px-8 py-8', darkMode ? 'bg-gray-900' : 'bg-gray-50')}>
      <div className={clsx('mx-auto transition-all duration-300', currentStep === 'customization' ? 'max-w-6xl' : 'max-w-5xl')}>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className={clsx('text-2xl font-bold', darkMode ? 'text-white' : 'text-gray-900')}>
              Générateur de Documents IA
            </h1>
            <p className={clsx('text-sm mt-1', darkMode ? 'text-gray-400' : 'text-gray-500')}>
              Créez votre Pitch Deck, Business Plan et Executive Summary en quelques minutes
            </p>
          </div>
          {prefilled && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold"
              style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>
              <Zap className="h-3.5 w-3.5" />
              Pré-rempli depuis votre profil
            </div>
          )}
        </div>

        {/* Step bar */}
        {currentStep !== 'generating' && (
          <div className="flex items-center mb-8">
            {STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-2">
                  <div className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                    stepIndex > idx ? 'bg-[#d8ffbd] text-primary'
                      : stepIndex === idx ? 'bg-primary text-white'
                        : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-400'
                  )}>
                    {stepIndex > idx ? <CheckCircle className="h-4 w-4" /> : step.number}
                  </div>
                  <span className={clsx(
                    'text-sm font-medium hidden sm:block',
                    stepIndex === idx
                      ? darkMode ? 'text-white' : 'text-gray-900'
                      : darkMode ? 'text-gray-500' : 'text-gray-400'
                  )}>
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={clsx(
                    'flex-1 h-0.5 mx-3',
                    stepIndex > idx ? 'bg-[#d8ffbd]' : darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* ── STEP 1 : Informations ── */}
        {currentStep === 'info' && (
          <div className={card}>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <h2 className={clsx('text-lg font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
                Informations sur votre startup
              </h2>
              {prefilled && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>
                  ✓ Données importées depuis votre profil — vérifiez et complétez si besoin
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nom */}
              <div>
                <label className={label}>Nom de la startup *</label>
                <input type="text" value={info.name} placeholder="ex : MediScan SAS"
                  onChange={e => setInfo(p => ({ ...p, name: e.target.value }))}
                  className={inputCls} />
              </div>

              {/* Secteur */}
              <div>
                <label className={label}>Secteur *</label>
                <select value={info.sector}
                  onChange={e => setInfo(p => ({ ...p, sector: e.target.value }))}
                  className={inputCls}>
                  <option value="">Sélectionner un secteur</option>
                  {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Stade */}
              <div>
                <label className={label}>Stade de développement *</label>
                <div className="flex gap-2">
                  {STAGES.map(s => (
                    <button key={s.value}
                      onClick={() => setInfo(p => ({ ...p, stage: s.value }))}
                      className={clsx(
                        'flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors',
                        info.stage === s.value
                          ? 'bg-primary text-white border-primary'
                          : darkMode ? 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      )}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Montant */}
              <div>
                <label className={label}>Montant recherché *</label>
                <div className="relative">
                  <span className={clsx('absolute left-3 top-1/2 -translate-y-1/2 text-sm', darkMode ? 'text-gray-400' : 'text-gray-500')}>€</span>
                  <input type="text" value={info.fundingAmount} placeholder="ex : 500 000"
                    onChange={e => setInfo(p => ({ ...p, fundingAmount: e.target.value }))}
                    className={clsx(inputCls, 'pl-7')} />
                </div>
              </div>

              {/* Revenus */}
              <div>
                <label className={label}>Revenus actuels (ARR/MRR)</label>
                <div className="relative">
                  <span className={clsx('absolute left-3 top-1/2 -translate-y-1/2 text-sm', darkMode ? 'text-gray-400' : 'text-gray-500')}>€</span>
                  <input type="text" value={info.revenue} placeholder="ex : 50 000"
                    onChange={e => setInfo(p => ({ ...p, revenue: e.target.value }))}
                    className={clsx(inputCls, 'pl-7')} />
                </div>
              </div>

              {/* Employés */}
              <div>
                <label className={label}>Nombre d'employés</label>
                <input type="number" min="1" value={info.employees} placeholder="ex : 5"
                  onChange={e => setInfo(p => ({ ...p, employees: e.target.value }))}
                  className={inputCls} />
              </div>
            </div>

            {/* Description */}
            <div className="mt-5">
              <label className={label}>Description du projet (3 lignes) *</label>
              <textarea rows={3} value={info.description}
                placeholder="Décrivez votre projet : ce que vous faites, pour qui, et pourquoi c'est unique..."
                onChange={e => setInfo(p => ({ ...p, description: e.target.value }))}
                className={clsx(inputCls, 'resize-none')} />
            </div>

            {/* Problème / Solution / Marché */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
              {[
                { field: 'problem' as const, icon: Target, label: 'Problème résolu', placeholder: 'Quel problème concret résolvez-vous ?' },
                { field: 'solution' as const, icon: Lightbulb, label: 'Solution proposée', placeholder: 'Quelle est votre approche unique ?' },
                { field: 'targetMarket' as const, icon: Users, label: 'Marché cible', placeholder: 'Qui sont vos clients cibles ?' }
              ].map(({ field, icon: Icon, label: lbl, placeholder }) => (
                <div key={field}>
                  <label className={clsx(label, 'flex items-center gap-1.5')}>
                    <Icon className="h-4 w-4" />{lbl}
                  </label>
                  <textarea rows={3} value={info[field]} placeholder={placeholder}
                    onChange={e => setInfo(p => ({ ...p, [field]: e.target.value }))}
                    className={clsx(inputCls, 'resize-none')} />
                </div>
              ))}
            </div>

            {/* Upload deck existant */}
            <div className="mt-6">
              <label className={clsx(label, 'flex items-center gap-2')}>
                <Upload className="h-4 w-4" />
                Deck existant à améliorer
                <span className={clsx('text-xs font-normal ml-1', darkMode ? 'text-gray-500' : 'text-gray-400')}>(optionnel — PDF)</span>
              </label>
              <div
                onClick={() => pdfInputRef.current?.click()}
                className={clsx(
                  'border-2 border-dashed rounded-xl p-5 cursor-pointer transition-colors flex items-center gap-4',
                  existingDeckPdf
                    ? darkMode ? 'border-green-600 bg-green-900/20' : 'border-green-400 bg-green-50'
                    : darkMode ? 'border-gray-600 hover:border-gray-500 bg-gray-700/40' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                )}>
                {existingDeckPdf ? (
                  <>
                    <div className={clsx('p-2.5 rounded-lg shrink-0', darkMode ? 'bg-green-800' : 'bg-green-100')}>
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={clsx('text-sm font-semibold truncate', darkMode ? 'text-green-400' : 'text-green-700')}>{existingDeckPdf.name}</p>
                      <p className={clsx('text-xs mt-0.5', darkMode ? 'text-green-600' : 'text-green-500')}>Claude va analyser ce deck et s'en inspirer</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setExistingDeckPdf(null); }}
                      className={clsx('text-xs px-2 py-1 rounded shrink-0', darkMode ? 'text-gray-400 hover:bg-gray-600' : 'text-gray-400 hover:bg-gray-200')}>
                      ✕ Retirer
                    </button>
                  </>
                ) : (
                  <>
                    <div className={clsx('p-2.5 rounded-lg shrink-0', darkMode ? 'bg-gray-600' : 'bg-gray-200')}>
                      <Upload className={clsx('h-5 w-5', darkMode ? 'text-gray-300' : 'text-gray-500')} />
                    </div>
                    <div>
                      <p className={clsx('text-sm font-medium', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                        Déposez votre deck PDF actuel
                      </p>
                      <p className={clsx('text-xs mt-0.5', darkMode ? 'text-gray-500' : 'text-gray-400')}>
                        Claude lit le contenu, la structure et le style — et génère un deck plus fort en s'en inspirant
                      </p>
                    </div>
                  </>
                )}
                <input ref={pdfInputRef} type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setCurrentStep('customization')}
                disabled={!isInfoValid()}
                className={clsx(
                  'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isInfoValid()
                    ? 'bg-primary text-white hover:bg-gray-800'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}>
                Suivant <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 : Personnalisation ── */}
        {currentStep === 'customization' && (
          <div className="flex gap-6 items-start">

            {/* ── Left: form ── */}
            <div className={clsx(card, 'flex-1 min-w-0')}>
              <h2 className={clsx('text-lg font-semibold mb-6', darkMode ? 'text-white' : 'text-gray-900')}>
                Personnalisation de vos documents
              </h2>

              <div className="space-y-7">
                {/* Logo */}
                <div>
                  <label className={clsx(label)}>Logo de votre startup</label>
                  <div
                    onClick={() => logoInputRef.current?.click()}
                    className={clsx(
                      'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
                      darkMode ? 'border-gray-600 hover:border-gray-500 bg-gray-700/40'
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                    )}>
                    {branding.logo ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={branding.logo} alt="Logo" className="h-14 w-auto object-contain" />
                        <span className={clsx('text-xs', darkMode ? 'text-gray-400' : 'text-gray-500')}>Cliquez pour changer</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className={clsx('p-3 rounded-full', darkMode ? 'bg-gray-600' : 'bg-gray-200')}>
                          <Upload className={clsx('h-6 w-6', darkMode ? 'text-gray-300' : 'text-gray-500')} />
                        </div>
                        <div>
                          <p className={clsx('text-sm font-medium', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                            Glissez votre logo ici ou cliquez pour parcourir
                          </p>
                          <p className={clsx('text-xs mt-1', darkMode ? 'text-gray-500' : 'text-gray-400')}>
                            PNG, SVG, JPG (max. 2 MB)
                          </p>
                        </div>
                      </div>
                    )}
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </div>
                </div>

                {/* Couleurs */}
                <div>
                  <label className={clsx(label, 'flex items-center gap-2')}><Palette className="h-4 w-4" />Couleurs de la marque</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                      { key: 'primaryColor' as const, title: 'Couleur primaire', presets: PRIMARY_PRESETS, inputId: 'color-primary' },
                      { key: 'secondaryColor' as const, title: 'Couleur secondaire', presets: SECONDARY_PRESETS, inputId: 'color-secondary' }
                    ].map(({ key, title, presets, inputId }) => (
                      <div key={key}>
                        <p className={clsx('text-xs font-medium mb-2', darkMode ? 'text-gray-400' : 'text-gray-500')}>{title}</p>
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="h-10 w-10 rounded-lg border-2 border-gray-200 cursor-pointer shadow-sm flex-shrink-0"
                            style={{ backgroundColor: branding[key] }}
                            onClick={() => document.getElementById(inputId)?.click()} />
                          <input id={inputId} type="color" value={branding[key]}
                            onChange={e => setBranding(p => ({ ...p, [key]: e.target.value }))}
                            className="h-9 w-20 rounded border cursor-pointer" />
                          <span className={clsx('text-xs font-mono', darkMode ? 'text-gray-400' : 'text-gray-500')}>{branding[key]}</span>
                        </div>
                        <div className="flex gap-2">
                          {presets.map(c => (
                            <button key={c} onClick={() => setBranding(p => ({ ...p, [key]: c }))}
                              style={{ backgroundColor: c }}
                              className={clsx(
                                'h-6 w-6 rounded-full border-2 transition-transform hover:scale-110',
                                branding[key] === c ? 'border-gray-500 scale-110' : 'border-gray-200'
                              )} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Police */}
                <div>
                  <label className={clsx(label, 'flex items-center gap-2')}><Type className="h-4 w-4" />Police de caractères</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {FONTS.map(f => (
                      <button key={f.value} onClick={() => setBranding(p => ({ ...p, font: f.value }))}
                        className={clsx(
                          'p-3 rounded-lg border-2 text-left transition-colors',
                          branding.font === f.value
                            ? 'border-primary bg-[#d8ffbd] text-primary'
                            : darkMode ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        )}>
                        <p className="text-sm font-semibold">{f.label}</p>
                        <p className={clsx('text-xs mt-0.5', branding.font === f.value ? 'text-primary/70' : darkMode ? 'text-gray-500' : 'text-gray-400')}>{f.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button onClick={() => setCurrentStep('info')} className={btnBack}>
                  <ArrowLeft className="h-4 w-4" />Retour
                </button>
                <button onClick={() => setCurrentStep('selection')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-gray-800 transition-colors">
                  Suivant <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── Right: live preview ── */}
            <div className="w-80 shrink-0 sticky top-6 self-start">
              <div className={clsx('rounded-xl border p-5', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-4 w-4" style={{ color: '#C4728A' }} />
                  <p className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>Aperçu en direct</p>
                </div>
                <DeckSlidePreview branding={branding} info={info} />
                <p className={clsx('text-[10px] mt-3 text-center leading-relaxed', darkMode ? 'text-gray-500' : 'text-gray-400')}>
                  L'aperçu se met à jour en temps réel à chaque changement de couleur, police ou logo.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ── STEP 3 : Sélection des documents ── */}
        {currentStep === 'selection' && (
          <div className={card}>
            {generationError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                Erreur lors de la génération : {generationError}
              </div>
            )}
            <h2 className={clsx('text-lg font-semibold mb-1', darkMode ? 'text-white' : 'text-gray-900')}>
              Choisissez vos documents
            </h2>
            <p className={clsx('text-sm mb-6', darkMode ? 'text-gray-400' : 'text-gray-500')}>
              Sélectionnez les documents à générer pour <span className="font-medium">{info.name || 'votre startup'}</span>
            </p>

            <div className="space-y-3">
              {docs.map(doc => {
                const Icon = doc.icon;
                return (
                  <button key={doc.id} onClick={() => toggleDoc(doc.id)}
                    className={clsx(
                      'w-full p-4 rounded-xl border-2 text-left transition-all',
                      doc.selected
                        ? 'border-primary bg-[#d8ffbd]/20'
                        : darkMode ? 'border-gray-600 bg-gray-700/40 hover:border-gray-500'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                    )}>
                    <div className="flex items-start gap-4">
                      <div className={clsx(
                        'p-2.5 rounded-lg flex-shrink-0',
                        doc.selected ? 'bg-primary text-white'
                          : darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-500'
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
                            {doc.name}
                          </h3>
                          <div className={clsx(
                            'h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-2',
                            doc.selected ? 'border-primary bg-primary' : darkMode ? 'border-gray-500' : 'border-gray-300'
                          )}>
                            {doc.selected && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                          </div>
                        </div>
                        <p className={clsx('text-xs mt-1', darkMode ? 'text-gray-400' : 'text-gray-500')}>{doc.description}</p>
                        <div className="flex gap-3 mt-2">
                          <span className={clsx('text-xs px-2 py-0.5 rounded-full', darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-500')}>
                            ~{doc.pages} pages
                          </span>
                          <span className={clsx('text-xs px-2 py-0.5 rounded-full', darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-500')}>
                            ~2 min
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedDocs.length === 0 && (
              <p className="text-xs text-red-500 mt-3">Sélectionnez au moins un document.</p>
            )}

            {selectedDocs.length > 0 && (
              <div className={clsx('mt-4 p-4 rounded-xl', darkMode ? 'bg-gray-700' : 'bg-[#d8ffbd]/30')}>
                <p className={clsx('text-xs font-semibold mb-2', darkMode ? 'text-gray-300' : 'text-gray-700')}>Récapitulatif</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDocs.map(d => (
                    <span key={d.id} className={clsx('text-xs px-2.5 py-1 rounded-full font-medium', darkMode ? 'bg-gray-600 text-gray-200' : 'bg-primary/10 text-primary')}>
                      {d.name}
                    </span>
                  ))}
                </div>
                <p className={clsx('text-xs mt-2', darkMode ? 'text-gray-500' : 'text-gray-500')}>
                  Durée estimée : ~{selectedDocs.length * 2} minutes
                </p>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button onClick={() => setCurrentStep('customization')} className={btnBack}>
                <ArrowLeft className="h-4 w-4" />Retour
              </button>
              <button
                onClick={runGeneration}
                disabled={selectedDocs.length === 0}
                className={clsx(
                  'flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                  selectedDocs.length > 0
                    ? 'bg-primary text-white hover:bg-gray-800'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}>
                <Sparkles className="h-4 w-4" />Générer avec l'IA
              </button>
            </div>
          </div>
        )}

        {/* ── Génération en cours ── */}
        {currentStep === 'generating' && (
          <div className={clsx(card, 'text-center py-10')}>
            <div className="flex flex-col items-center gap-6">
              <div className={clsx('p-5 rounded-full', darkMode ? 'bg-purple-900/30' : 'bg-[#d8ffbd]/50')}>
                <Sparkles className={clsx('h-12 w-12 animate-pulse', darkMode ? 'text-purple-400' : 'text-primary')} />
              </div>
              <div>
                <h2 className={clsx('text-xl font-bold mb-2', darkMode ? 'text-white' : 'text-gray-900')}>
                  Génération en cours...
                </h2>
                <p className={clsx('text-sm', darkMode ? 'text-gray-400' : 'text-gray-500')}>
                  L'IA analyse vos informations et crée vos documents personnalisés
                </p>
              </div>

              <div className="w-full max-w-md space-y-3">
                {docs.filter(d => d.selected).map(doc => {
                  const isCurrentDoc = doc.id === generatingDocId;
                  const isDone = generatedDocs.has(doc.id);
                  const Icon = doc.icon;
                  return (
                    <div key={doc.id} className={clsx('p-4 rounded-xl border', darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200')}>
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={clsx('h-4 w-4', darkMode ? 'text-gray-400' : 'text-gray-500')} />
                        <span className={clsx('text-sm font-medium', darkMode ? 'text-gray-300' : 'text-gray-700')}>{doc.name}</span>
                        <div className="ml-auto">
                          {isDone
                            ? <CheckCircle className="h-4 w-4 text-green-500" />
                            : isCurrentDoc
                              ? <Loader2 className="h-4 w-4 text-primary animate-spin" />
                              : <div className={clsx('h-4 w-4 rounded-full border-2', darkMode ? 'border-gray-600' : 'border-gray-300')} />
                          }
                        </div>
                      </div>
                      {(isCurrentDoc || isDone) && (
                        <div className={clsx('h-1.5 w-full rounded-full', darkMode ? 'bg-gray-600' : 'bg-gray-200')}>
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-200"
                            style={{ width: `${isDone ? 100 : generationProgress}%` }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className={clsx('text-xs', darkMode ? 'text-gray-500' : 'text-gray-400')}>
                Ne fermez pas cette page pendant la génération
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 4 : Résultats ── */}
        {currentStep === 'results' && (
          <div>
            <div className={clsx(card, 'mb-5')}>
              {/* Succès header */}
              <div className={clsx('flex items-center gap-4 pb-5 mb-5 border-b', darkMode ? 'border-gray-700' : 'border-gray-100')}>
                <div className="p-3 rounded-full bg-[#d8ffbd]">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className={clsx('text-lg font-bold', darkMode ? 'text-white' : 'text-gray-900')}>
                    Documents générés avec succès !
                  </h2>
                  <p className={clsx('text-sm', darkMode ? 'text-gray-400' : 'text-gray-500')}>
                    {selectedDocs.length} document{selectedDocs.length > 1 ? 's' : ''} prêt{selectedDocs.length > 1 ? 's' : ''} pour {info.name}
                  </p>
                </div>
                <button
                  onClick={() => { setCurrentStep('info'); setGeneratedDocs(new Set()); setGenerationProgress(0); }}
                  className={clsx('ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-colors',
                    darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50')}>
                  <RefreshCw className="h-4 w-4" />Nouveau
                </button>
              </div>

              {/* Document cards */}
              <div className="space-y-4">
                {docs.filter(d => d.selected).map(doc => {
                  const Icon = doc.icon;
                  const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                  return (
                    <div key={doc.id} className={clsx('p-5 rounded-xl border', darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200')}>
                      <div className="flex items-start gap-4">
                        {/* Miniature */}
                        <div className="w-14 h-18 rounded-lg shadow flex-shrink-0 flex flex-col overflow-hidden bg-white"
                          style={{ borderTop: `4px solid ${branding.primaryColor}` }}>
                          <div className="p-1.5 flex flex-col gap-1">
                            {branding.logo
                              ? <img src={branding.logo} alt="logo" className="h-2.5 w-full object-contain" />
                              : <div className="h-2.5 w-full rounded" style={{ backgroundColor: branding.secondaryColor }} />
                            }
                            <div className="h-1 w-3/4 rounded" style={{ backgroundColor: branding.primaryColor, opacity: 0.7 }} />
                            <div className="h-0.5 w-full rounded" style={{ backgroundColor: branding.secondaryColor }} />
                            <div className="h-0.5 w-5/6 rounded" style={{ backgroundColor: branding.secondaryColor }} />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={clsx('h-4 w-4', darkMode ? 'text-gray-400' : 'text-gray-500')} />
                            <h3 className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>{doc.name}</h3>
                            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#d8ffbd] text-primary font-medium">Prêt</span>
                          </div>
                          <p className={clsx('text-xs mb-3', darkMode ? 'text-gray-400' : 'text-gray-500')}>
                            {doc.pages} pages · Généré le {dateStr} · Pour {info.name}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => handleDownload(doc.id, doc.name)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-gray-800 transition-colors">
                              <Download className="h-3.5 w-3.5" />Télécharger
                            </button>
                            <button className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                              darkMode ? 'border-gray-500 text-gray-300 hover:bg-gray-600' : 'border-gray-300 text-gray-600 hover:bg-gray-100')}>
                              <Eye className="h-3.5 w-3.5" />Aperçu
                            </button>
                            <button
                              onClick={() => { setGeneratedDocs(new Set()); runGeneration(); }}
                              className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                                darkMode ? 'border-gray-500 text-gray-300 hover:bg-gray-600' : 'border-gray-300 text-gray-600 hover:bg-gray-100')}>
                              <RefreshCw className="h-3.5 w-3.5" />Régénérer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Conseils */}
            <div className={clsx('rounded-xl border p-5', darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-[#d8ffbd]/20 border-[#d8ffbd]')}>
              <h3 className={clsx('text-sm font-semibold mb-3 flex items-center gap-2', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                <Sparkles className="h-4 w-4 text-primary" />Conseils pour maximiser l'impact
              </h3>
              <ul className="space-y-2">
                {[
                  'Partagez votre Pitch Deck directement depuis Fundherz pour tracker les vues investisseurs',
                  'Connectez votre Business Plan à votre espace Levée de fonds pour un suivi automatique',
                  'L\'Executive Summary est idéal pour une première prise de contact par email'
                ].map((tip, i) => (
                  <li key={i} className={clsx('flex items-start gap-2 text-xs', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />{tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DocumentGeneratorPage;
