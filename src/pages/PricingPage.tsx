import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Check, X, Menu, Lock,
  Zap, TrendingUp, Building2,
} from 'lucide-react';
import clsx from 'clsx';

const plans = [
  {
    name: 'SOLO / SEED',
    badge: 'Early Stage',
    tagline: 'La clarté.',
    taglineDetail: "Score de levée, analyse de risques et deck structuré par l'IA — en quelques minutes.",
    description: "Pour l'entrepreneur qui veut son audit complet tout de suite.",
    monthlyPrice: 89,
    annualPrice: 890,
    monthlyLabel: '89 €',
    features: [
      'Score de levée de fonds IA',
      'Analyse de risques complète',
      'Générateur de Pitch Deck structuré',
      'Accès Base VCs / Business Angels',
      'Support Standard — réponse sous 48h',
    ],
    popular: false,
    Icon: Zap,
    accent: '#8B5CF6',
    cardBg: '#FAFAFA',
    badgeBg: '#EDE9FE',
    badgeText: '#6D28D9',
    stripeUrl: 'https://buy.stripe.com/test_bJe8wOfXe2zm5vReE66Na00',
  },
  {
    name: 'FOUNDER PRO',
    badge: 'Roadshow',
    tagline: 'La précision.',
    taglineDetail: "Matching investisseurs, simulateur de valorisation et export premium « Investor-Ready ».",
    description: "Pour ceux qui sont en plein roadshow — rencontres investisseurs.",
    monthlyPrice: 189,
    annualPrice: 1890,
    monthlyLabel: '189 €',
    features: [
      'Tout ce qui est inclus dans SOLO / SEED',
      'Matching Investisseurs IA — top 5 fonds ciblés',
      'Simulateur de Valorisation pré-pitch',
      'Export PDF Premium « Investor-Ready »',
      'Audit Deep-Dive — détection des red flags',
      'Support Prioritaire — réponse sous 24h',
    ],
    popular: true,
    Icon: TrendingUp,
    accent: '#C4728A',
    cardBg: '#FFFFFF',
    badgeBg: '#FFE4ED',
    badgeText: '#9D2B5A',
    stripeUrl: 'https://buy.stripe.com/test_3cIaEWcL25Ly6zV3Zs6Na02',
  },
  {
    name: 'INCUBATEUR',
    badge: 'Partenaire B2B',
    tagline: 'Le pilotage.',
    taglineDetail: "Dashboard centralisé pour suivre la santé financière de toutes vos startups en un coup d'oeil.",
    description: "Pour les structures qui accompagnent des dizaines de startups.",
    monthlyPrice: 399,
    annualPrice: 3990,
    monthlyLabel: 'À partir de 399 €',
    features: [
      'Tout ce qui est inclus dans FOUNDER PRO',
      'Dashboard multi-startups centralisé',
      "Jusqu'à 10 espaces de travail",
      "Jusqu'à 5 utilisateurs par compte",
      'Données de marché sectorielles en temps réel',
      'Accès API',
    ],
    popular: false,
    Icon: Building2,
    accent: '#0EA5E9',
    cardBg: '#F8FBFF',
    badgeBg: '#E0F2FE',
    badgeText: '#0369A1',
    stripeUrl: 'https://buy.stripe.com/test_4gM00ifXe8XK4rNcvY6Na01',
  },
];

const faqs = [
  {
    question: "Puis-je changer de plan à tout moment ?",
    answer: "Oui. Passage à un plan supérieur : effet immédiat, facturation au prorata. Passage à un plan inférieur : effet à la fin de la période en cours.",
  },
  {
    question: "Y a-t-il un essai gratuit ?",
    answer: "Oui, 14 jours d'essai gratuit sur tous les plans. Aucune carte bancaire requise.",
  },
  {
    question: "Comment fonctionne la facturation annuelle ?",
    answer: "Vous payez 10 mois et obtenez 2 mois offerts. Le montant est prélevé en une seule fois.",
  },
  {
    question: "Puis-je annuler à tout moment ?",
    answer: "Oui, depuis votre tableau de bord. Remboursement au prorata pour les mois non utilisés sur un abonnement annuel.",
  },
  {
    question: "Quels moyens de paiement acceptez-vous ?",
    answer: "Carte bancaire (Visa, Mastercard, Amex), virement bancaire et PayPal.",
  },
];

const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string>('FOUNDER PRO');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const fromDashboard = searchParams.get('from') === 'welcome';
  const fromType = searchParams.get('type');

  const selected = plans.find((p) => p.name === selectedPlan) ?? plans[1];

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-30 container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[#F4B8CC]" />
            <span className="font-bold text-xl text-white">Fundherz</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Accueil', to: '/' },
              { label: 'Comment ça marche', to: '/how-it-works' },
              { label: 'Connexion', to: '/login' },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="text-sm text-gray-300 hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
            <Link
              to="/pricing"
              className="text-sm font-semibold text-[#F4B8CC] border border-[#F4B8CC]/30 px-4 py-1.5 rounded-full hover:bg-[#F4B8CC]/10 transition-colors"
            >
              Tarifs
            </Link>
          </nav>
          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* ── Mobile menu ─────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col px-6 py-6">
          <div className="flex justify-between items-center mb-10">
            <span className="font-bold text-xl text-white">Fundherz</span>
            <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col gap-6">
            {[
              { label: 'Accueil', to: '/' },
              { label: 'Tarifs', to: '/pricing' },
              { label: 'Comment ça marche', to: '/how-it-works' },
              { label: 'Connexion', to: '/login' },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="text-lg font-medium text-white" onClick={() => setMobileMenuOpen(false)}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* ── Contextual banner ───────────────────────────────────────────── */}
      {fromDashboard && (
        <div className="w-full pt-20 pb-0 relative z-20" style={{ backgroundColor: '#FFD6E5' }}>
          <div className="container mx-auto max-w-3xl px-4 py-4 flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F4B8CC' }}>
              <Lock className="h-4 w-4" style={{ color: '#9D2B5A' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: '#7A1A3A' }}>
                {fromType === 'parcours'
                  ? 'Votre parcours financier complet est disponible avec un abonnement Fundherz.'
                  : 'Les opportunités de financement personnalisées sont disponibles avec un abonnement Fundherz.'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#9D2B5A' }}>
                Choisissez votre offre ci-dessous pour débloquer l'accès immédiatement.
              </p>
            </div>
            <Link to="/dashboard/welcome" className="flex-shrink-0 text-xs font-semibold underline underline-offset-2" style={{ color: '#7A1A3A' }}>
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      )}

      {/* ── Hero dark ───────────────────────────────────────────────────── */}
      <section
        className="relative pt-40 pb-48 text-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0A0A0A 0%, #160814 55%, #0A0A0A 100%)' }}
      >
        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: '5%', left: '5%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,114,138,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '0%', right: '5%', width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="relative z-10 container mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-sm text-gray-300" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
            <Sparkles className="h-3.5 w-3.5 text-[#F4B8CC]" />
            Tarifs Fundherz 2026
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white mb-5 leading-[1.1] tracking-tight">
            Investissez dans<br />
            <span style={{ background: 'linear-gradient(135deg, #F4B8CC 0%, #C4728A 45%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              votre levée de fonds
            </span>
          </h1>

          <p className="text-gray-400 text-lg max-w-md mx-auto mb-10">
            Moins cher qu'une heure avec un consultant financier.
            <br />
            100&times; plus rapide.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={clsx(
                'px-5 py-2 rounded-full text-sm font-semibold transition-all',
                billingCycle === 'monthly' ? 'bg-white text-gray-900 shadow' : 'text-gray-400 hover:text-white',
              )}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={clsx(
                'px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2',
                billingCycle === 'annual' ? 'bg-white text-gray-900 shadow' : 'text-gray-400 hover:text-white',
              )}
            >
              Annuel
              <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold leading-none">
                2 mois offerts
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Pricing cards ───────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 relative z-20 -mt-28 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
          {plans.map((plan) => {
            const { Icon } = plan;
            const isSelected = selectedPlan === plan.name;
            const isPopular = plan.popular;
            const displayPrice = billingCycle === 'monthly'
              ? plan.monthlyLabel
              : `${plan.annualPrice.toLocaleString('fr-FR')} €`;
            const perLabel = billingCycle === 'monthly' ? '/mois' : '/an';
            const monthlyEquiv = billingCycle === 'annual'
              ? `≈ ${Math.round(plan.annualPrice / 12)} €/mois`
              : null;

            return (
              <div
                key={plan.name}
                onClick={() => setSelectedPlan(plan.name)}
                className="cursor-pointer"
                style={{ transform: isPopular ? 'translateY(-16px)' : undefined }}
              >
                <div
                  className="rounded-2xl overflow-hidden transition-all duration-200"
                  style={{
                    background: isPopular ? '#FFFFFF' : plan.cardBg,
                    boxShadow: isSelected
                      ? `0 0 0 2.5px ${plan.accent}, 0 20px 60px rgba(0,0,0,0.14)`
                      : isPopular
                      ? `0 0 0 2px ${plan.accent}40, 0 24px 70px rgba(0,0,0,0.18)`
                      : '0 1px 4px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Popular banner */}
                  {isPopular && (
                    <div
                      className="py-2 text-center text-xs font-bold tracking-widest uppercase"
                      style={{ background: plan.accent, color: '#fff', letterSpacing: '0.12em' }}
                    >
                      ⭐ Le plus populaire
                    </div>
                  )}

                  <div className="p-7">
                    {/* Icon + badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${plan.accent}18` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: plan.accent }} />
                      </div>
                      <span
                        className="text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ background: plan.badgeBg, color: plan.badgeText }}
                      >
                        {plan.badge}
                      </span>
                    </div>

                    {/* Plan name */}
                    <h3 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-5">{plan.description}</p>

                    {/* "Ce qu'il achète" tagline */}
                    <div
                      className="rounded-xl px-4 py-3 mb-6"
                      style={{ background: `${plan.accent}0D`, borderLeft: `3px solid ${plan.accent}` }}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: plan.accent }}>
                        Ce qu'il achète
                      </p>
                      <p className="text-sm font-semibold text-gray-800 italic leading-snug">
                        {plan.tagline}{' '}
                        <span className="font-normal not-italic text-gray-600">{plan.taglineDetail}</span>
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-gray-900 leading-none">
                          {displayPrice}
                        </span>
                        <span className="text-base text-gray-400 mb-0.5">{perLabel}</span>
                      </div>
                      {monthlyEquiv && (
                        <p className="text-xs text-gray-400 mt-1.5">{monthlyEquiv}</p>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-2.5 mb-7">
                      {plan.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: `${plan.accent}20` }}
                          >
                            <Check className="h-2.5 w-2.5" style={{ color: plan.accent }} />
                          </div>
                          <span className="text-sm text-gray-600 leading-snug">{f}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <a
                      href={plan.stripeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
                      style={{
                        background: isPopular
                          ? `linear-gradient(135deg, ${plan.accent} 0%, #9D2B5A 100%)`
                          : '#0A0A0A',
                        color: '#fff',
                      }}
                    >
                      Choisir ce plan
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust line */}
        <p className="text-center text-sm text-gray-400 mt-10">
          Sans engagement · Annulation à tout moment · Paiement sécurisé
        </p>
      </section>

      {/* ── Social proof strip ──────────────────────────────────────────── */}
      <section className="bg-gray-50 border-y border-gray-100 py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-center">
            {[
              { value: '+300', label: 'fondateurs accompagnés' },
              { value: '< 1h', label: 'pour obtenir votre score complet' },
              { value: '4.9 / 5', label: 'satisfaction moyenne' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-black text-gray-900 mb-1">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-12">
            Questions fréquentes
          </h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                <p className="font-semibold text-gray-900 mb-1.5">{faq.question}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #160814 100%)' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Prêt à convaincre vos investisseurs ?
          </h2>
          <p className="text-gray-400 mb-10 max-w-lg mx-auto">
            Rejoignez les fondateurs qui préparent leur closing avec Fundherz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #C4728A 0%, #8B5CF6 100%)' }}
            >
              Commencer maintenant
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/how-it-works"
              className="px-8 py-3.5 rounded-xl font-bold text-sm text-gray-300 border border-white/10 hover:border-white/20 transition-colors flex items-center justify-center"
            >
              Comment ça marche
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="py-10 border-t border-gray-100 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#C4728A]" />
              <span className="font-bold text-gray-900">Fundherz</span>
            </div>
            <div className="flex gap-8">
              {["Conditions d'utilisation", 'Politique de confidentialité', 'Contact'].map((l) => (
                <a key={l} href="#" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
                  {l}
                </a>
              ))}
            </div>
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Fundherz. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
