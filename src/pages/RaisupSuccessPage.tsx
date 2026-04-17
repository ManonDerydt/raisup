import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import type { RaisupFormData } from './RaisupOnboardingForm';

// ─── Score calculation ────────────────────────────────────────────────────────

function computeScore(d: RaisupFormData) {
  let traction = 0, team = 0, pitch = 0, market = 0;

  // Traction (25 pts)
  if (!d.isPreRevenue && d.mrr) {
    traction += d.mrr >= 50000 ? 8 : d.mrr >= 10000 ? 6 : d.mrr >= 1000 ? 4 : 2;
  }
  if (d.momGrowth) traction += d.momGrowth >= 20 ? 8 : d.momGrowth >= 10 ? 5 : d.momGrowth >= 5 ? 3 : 1;
  if (d.activeClients) traction += d.activeClients >= 100 ? 5 : d.activeClients >= 20 ? 3 : 1;
  if (d.runway) traction += d.runway >= 12 ? 4 : d.runway >= 6 ? 2 : 0;

  // Team (25 pts)
  if (d.hasCTO) team += 5;
  if (d.previousStartup === 'oui') team += 5;
  if (d.hadExit === 'oui') team += 7;
  if (d.advisors) team += d.advisors >= 3 ? 4 : 2;
  if (d.sectorExperience === '5+ ans') team += 4;
  else if (d.sectorExperience === '2-5 ans') team += 2;
  else if (d.sectorExperience === '1-2 ans') team += 1;

  // Pitch (25 pts)
  if (d.problem?.length > 50) pitch += 7; else if (d.problem?.length > 20) pitch += 4;
  if (d.solution?.length > 50) pitch += 7; else if (d.solution?.length > 20) pitch += 4;
  if (d.competitiveAdvantage?.length > 30) pitch += 6; else if (d.competitiveAdvantage?.length > 10) pitch += 3;
  if (d.description?.length > 50) pitch += 5; else if (d.description?.length > 20) pitch += 2;

  // Market (25 pts)
  if (d.businessModel) market += 5;
  if (d.sector) market += 5;
  if (d.clientType) market += 5;
  if (d.ambition) market += 5;
  if (d.fundingPreference) market += 5;

  return {
    traction: Math.min(25, traction),
    team: Math.min(25, team),
    pitch: Math.min(25, pitch),
    market: Math.min(25, market),
    total: Math.min(100, traction + team + pitch + market),
  };
}

// ─── Circular gauge ───────────────────────────────────────────────────────────

const CircularGauge: React.FC<{ score: number }> = ({ score }) => {
  const [animated, setAnimated] = useState(0);
  const radius = 60;
  const circ = 2 * Math.PI * radius;
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f97316' : '#ef4444';

  useEffect(() => { const t = setTimeout(() => setAnimated(score), 150); return () => clearTimeout(t); }, [score]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center w-36 h-36">
        <svg className="-rotate-90" width="144" height="144">
          <circle cx="72" cy="72" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
          <circle cx="72" cy="72" r={radius} fill="none" stroke={color} strokeWidth="12"
            strokeDasharray={circ} strokeDashoffset={circ - (animated / 100) * circ}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-black" style={{ color }}>{score}</span>
          <span className="text-xs text-gray-400">/100</span>
        </div>
      </div>
      <p className="text-sm font-semibold mt-1" style={{ color }}>
        {score >= 70 ? 'Dossier solide' : score >= 40 ? 'En bonne voie' : 'À améliorer'}
      </p>
    </div>
  );
};

// ─── Strategy mapping ─────────────────────────────────────────────────────────

const STRATEGY_MAP: Record<string, string> = {
  'Rentabilité et indépendance': 'Stratégie Bootstrap+',
  'Leader marché français': 'Stratégie Levée Mixte',
  'Expansion européenne': 'Stratégie Levée Mixte+',
  'Scale-up et exit': 'Stratégie Scale-up',
  'Licorne': 'Stratégie Hypercroissance',
  'Je ne sais pas encore': 'Analyse personnalisée',
};

function getStrategy(ambition: string): string {
  return STRATEGY_MAP[ambition] ?? 'Analyse personnalisée';
}

// ─── Recap helpers ────────────────────────────────────────────────────────────

const AMBITION_COLORS: Record<string, string> = {
  'Rentabilité et indépendance': 'bg-teal-100 text-teal-800 border border-teal-300',
  'Leader marché français': 'bg-green-100 text-green-800 border border-green-300',
  'Expansion européenne': 'bg-blue-100 text-blue-800 border border-blue-300',
  'Scale-up et exit': 'bg-orange-100 text-orange-800 border border-orange-300',
  'Licorne': 'bg-purple-100 text-purple-800 border border-purple-300',
  'Je ne sais pas encore': 'bg-gray-100 text-gray-700 border border-gray-300',
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="block text-[11px] uppercase tracking-wide text-gray-400 font-semibold mb-0.5">{children}</span>
);

const Value: React.FC<{ v?: string | number | boolean | null }> = ({ v }) => {
  const empty = v === null || v === undefined || v === '' || v === 0;
  if (empty) return <span className="text-[14px] text-gray-400 italic">Non renseigné</span>;
  if (typeof v === 'boolean') return <span className="text-[14px] text-gray-900 font-bold">{v ? 'Oui' : 'Non'}</span>;
  return <span className="text-[14px] text-gray-900 font-bold">{String(v)}</span>;
};

const Divider = () => <hr className="border-[#E5E7EB] my-5" />;

const Block: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-3">{title}</p>
    {children}
  </div>
);

const Grid2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</div>
);

const Field: React.FC<{ label: string; v?: string | number | boolean | null }> = ({ label, v }) => (
  <div>
    <Label>{label}</Label>
    <Value v={v} />
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────

const RaisupSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const savedParam = params.get('saved');
  const isSaved = savedParam === 'true';

  const [formData, setFormData] = useState<RaisupFormData | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('raisupOnboardingData');
      if (raw) setFormData(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const score = formData ? computeScore(formData) : null;

  const ambitionColor = formData?.ambition ? (AMBITION_COLORS[formData.ambition] ?? 'bg-gray-100 text-gray-800 border border-gray-300') : '';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-12 px-4">
      <div className="w-full max-w-xl space-y-6">

        {/* ── Header card ── */}
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Votre profil Raisup est prêt !</h1>
          <p className="text-gray-500 text-sm">Nous avons analysé votre profil et calculé votre score d'investissabilité.</p>
        </div>

        {/* ── Score card ── */}
        {score && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Score Raisup</h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <CircularGauge score={score.total} />
              <div className="flex-1 w-full space-y-3">
                {([
                  { label: 'Pitch', value: score.pitch, color: '#3b82f6' },
                  { label: 'Traction', value: score.traction, color: '#22c55e' },
                  { label: 'Équipe', value: score.team, color: '#a855f7' },
                  { label: 'Marché', value: score.market, color: '#f97316' },
                ] as const).map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-bold" style={{ color }}>{value}/25</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(value / 25) * 100}%`, backgroundColor: color, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Récapitulatif ── */}
        {formData && (
          <div style={{ borderRadius: 16, padding: 24, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
            {/* Title */}
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <h2 className="text-[18px] font-bold text-gray-900">Récapitulatif de votre profil</h2>
            </div>

            {/* Bloc 1 — Ambition */}
            <Block title="Ambition">
              {formData.ambition
                ? <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${ambitionColor}`}>{formData.ambition}</span>
                : <span className="text-[14px] text-gray-400 italic">Non renseigné</span>}
            </Block>

            <Divider />

            {/* Bloc 2 — L'entreprise */}
            <Block title="L'entreprise">
              <Grid2>
                <Field label="Startup" v={formData.startupName} />
                <Field label="Fondateur" v={formData.founderName} />
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Value v={formData.description} />
                </div>
                <Field label="Modèle économique" v={formData.businessModel} />
                <Field label="Secteur" v={formData.sector} />
                <Field label="Type de client" v={formData.clientType} />
              </Grid2>
            </Block>

            <Divider />

            {/* Bloc 3 — Siège social */}
            <Block title="Siège social">
              <Grid2>
                <Field label="Pays" v={formData.country} />
                {formData.country === 'France' && <Field label="Région" v={formData.region} />}
                <Field label="Ville" v={formData.city} />
                <Field label="Forme juridique" v={formData.legalForm} />
                <Field label="Part du fondateur" v={formData.founderShare !== null ? `${formData.founderShare} %` : null} />
              </Grid2>
            </Block>

            <Divider />

            {/* Bloc 4 — Situation actuelle */}
            <Block title="Situation actuelle">
              <Grid2>
                <Field label="MRR" v={formData.mrr === 0 || formData.isPreRevenue ? 'Pre-revenue' : (formData.mrr !== null ? `${formData.mrr.toLocaleString('fr-FR')} €` : null)} />
                <Field label="Croissance MoM" v={formData.momGrowth !== null ? `${formData.momGrowth} %` : null} />
                <Field label="Clients actifs" v={formData.activeClients} />
                <Field label="Runway" v={formData.runway !== null ? `${formData.runway} mois` : null} />
                <Field label="Burn rate" v={formData.burnRate !== null ? `${formData.burnRate.toLocaleString('fr-FR')} €/mois` : null} />
                <Field label="Taille équipe" v={formData.teamSize} />
                <Field label="CTO" v={formData.hasCTO ? 'Oui' : 'Non'} />
              </Grid2>
            </Block>

            <Divider />

            {/* Bloc 5 — Équipe */}
            <Block title="Équipe">
              <Grid2>
                <Field label="Expérience secteur" v={formData.sectorExperience} />
                <Field label="Startup précédente" v={formData.previousStartup} />
                <Field label="Exit" v={formData.hadExit} />
                <Field label="Advisors" v={formData.advisors} />
              </Grid2>
              <div className="mt-3 space-y-3">
                <div>
                  <Label>Problème</Label>
                  <Value v={formData.problem} />
                </div>
                <div>
                  <Label>Solution</Label>
                  <Value v={formData.solution} />
                </div>
                <div>
                  <Label>Avantage concurrentiel</Label>
                  <Value v={formData.competitiveAdvantage} />
                </div>
              </div>
            </Block>

            <Divider />

            {/* Bloc 6 — Stratégie de financement */}
            <Block title="Stratégie de financement">
              <Grid2>
                <Field label="Timeline" v={formData.fundingTimeline} />
                <Field label="Montant recherché" v={formData.fundraisingGoal !== null ? `${formData.fundraisingGoal.toLocaleString('fr-FR')} €` : null} />
                <Field label="Dilution max" v={formData.maxDilution !== null ? `${formData.maxDilution} %` : null} />
                <Field label="Préférence financement" v={formData.fundingPreference} />
                <Field label="Objectif valorisation finale" v={formData.finalGoalValuation !== null ? `${formData.finalGoalValuation.toLocaleString('fr-FR')} €` : null} />
                <div className="col-span-2">
                  <Field label="Stratégie recommandée" v={getStrategy(formData.ambition)} />
                </div>
              </Grid2>
            </Block>

            {/* Status banner */}
            <div className="mt-5" style={{
              borderRadius: 12,
              padding: 14,
              backgroundColor: isSaved ? '#D8FFBD' : '#FFB96D',
              color: isSaved ? '#2D6A00' : '#7C3A00',
            }}>
              <p className="text-sm font-medium">
                {isSaved
                  ? '✓ Ces données ont été sauvegardées dans votre profil Raisup'
                  : '⚠ Données conservées localement — synchronisation en attente'}
              </p>
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        <div className="pb-8">
          <button
            onClick={() => navigate('/dashboard/financial-journey')}
            className="w-full btn-primary flex items-center justify-center gap-2 text-base py-4 rounded-2xl"
          >
            Accéder à mon parcours financier
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default RaisupSuccessPage;
