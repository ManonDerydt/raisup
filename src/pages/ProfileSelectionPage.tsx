import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rocket, Building2 } from 'lucide-react';
import { mockFundherzAccount } from '../data/mockAgencyData';

const ProfileSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<'founder' | 'agency' | null>(null);

  const handleDemo = () => {
    localStorage.setItem('raisup_agency_profile', JSON.stringify(mockFundherzAccount.agency));
    localStorage.setItem('raisup_agency_dossiers', JSON.stringify(mockFundherzAccount.dossiers));
    localStorage.setItem('raisup_user_type', 'agency');
    navigate('/dashboard/b2b');
  };

  const cards = [
    {
      id: 'founder' as const,
      Icon: Rocket,
      title: 'Je suis fondateur',
      description: 'Je cherche à lever des fonds pour ma startup',
      tags: ['Analyse', 'Matching', 'Documents', 'Stratégie'],
      cta: 'Commencer mon analyse →',
      href: '/register/startup',
    },
    {
      id: 'agency' as const,
      Icon: Building2,
      title: 'Je suis partenaire',
      description: "J'accompagne des startups dans leur levée de fonds",
      tags: ['Agence', 'Incubateur', 'Accélérateur', 'Conseil'],
      badge: 'Plan Agency — 299€/mois',
      cta: 'Créer mon espace partenaire →',
      href: '/onboarding/agency',
    },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F8F8' }}>
      {/* Header */}
      <header className="px-8 py-6">
        <Link to="/" className="inline-flex">
          <img src="/raisup_logo.png" alt="Raisup" className="h-12 w-auto" />
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-[32px] font-bold mb-3" style={{ color: '#0A0A0A' }}>
              Quel est votre profil ?
            </h1>
            <p className="text-[15px]" style={{ color: '#6B7280' }}>
              Choisissez le type de compte qui correspond à votre situation
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {cards.map(({ id, Icon, title, description, tags, badge, cta, href }) => {
              const isSelected = selected === id;
              return (
                <button
                  key={id}
                  onClick={() => setSelected(id)}
                  className="text-left transition-all duration-150"
                  style={{
                    backgroundColor: isSelected ? '#F8F8F8' : '#FFFFFF',
                    border: isSelected ? '2px solid #0A0A0A' : '1.5px solid #E5E7EB',
                    borderRadius: 20,
                    padding: 32,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = '#0A0A0A';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB';
                  }}
                >
                  {/* Icon */}
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className="flex items-center justify-center rounded-2xl"
                      style={{ width: 56, height: 56, backgroundColor: '#FFD6E5' }}
                    >
                      <Icon style={{ width: 26, height: 26, color: '#C4728A' }} />
                    </div>
                    {badge && (
                      <span
                        className="text-[11px] font-semibold px-3 py-1 rounded-full"
                        style={{ backgroundColor: '#FFD6E5', color: '#C4728A' }}
                      >
                        {badge}
                      </span>
                    )}
                    {isSelected && !badge && (
                      <div
                        className="flex items-center justify-center rounded-full"
                        style={{ width: 24, height: 24, backgroundColor: '#0A0A0A' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Text */}
                  <h3 className="font-bold mb-2" style={{ fontSize: 20, color: '#0A0A0A' }}>
                    {title}
                  </h3>
                  <p className="mb-4 text-[14px]" style={{ color: '#6B7280' }}>
                    {description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[12px] font-medium px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: '#F3F4F6', color: '#374151' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div
                    className="w-full flex items-center justify-center font-semibold text-[14px] transition-opacity hover:opacity-90"
                    style={{
                      backgroundColor: '#0A0A0A',
                      color: '#FFFFFF',
                      borderRadius: 50,
                      padding: '12px 20px',
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      navigate(href);
                    }}
                  >
                    {cta}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Demo link */}
          <div className="text-center space-y-3">
            <button
              onClick={handleDemo}
              className="text-[13px] transition-colors hover:text-gray-900"
              style={{ color: '#9CA3AF' }}
            >
              Voir la démo partenaire →
            </button>
            <p className="text-[13px]" style={{ color: '#9CA3AF' }}>
              Déjà un compte ?{' '}
              <Link to="/login" className="font-medium hover:underline" style={{ color: '#0A0A0A' }}>
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileSelectionPage;
