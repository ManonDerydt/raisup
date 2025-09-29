import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Check, CheckCircle, X, Menu } from 'lucide-react';
import clsx from 'clsx';

const PricingPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string>('Pro');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check if dark mode is enabled
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  }, []);
  
  // Pricing plans data
  const plans = [
    {
      name: 'Starter',
      description: 'Pour les entrepreneurs en phase de démarrage',
      monthlyPrice: 49,
      annualPrice: 490, // 10 months price (2 months free)
      features: [
        'Génération de documents de base',
        'Business plan automatisé',
        'Pitch deck personnalisable',
        'Modèles financiers simples',
        'Support par email'
      ],
      popular: false
    },
    {
      name: 'Pro',
      description: 'Pour les startups en phase de croissance',
      monthlyPrice: 99,
      annualPrice: 990, // 10 months price (2 months free)
      features: [
        'Tout ce qui est inclus dans Starter',
        'Génération illimitée de documents',
        'Analyses de marché avancées',
        'Modèles financiers détaillés',
        'Suivi de levée de fonds',
        'Support prioritaire'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      description: 'Pour les entreprises en phase de scaling',
      monthlyPrice: 249,
      annualPrice: 2490, // 10 months price (2 months free)
      features: [
        'Tout ce qui est inclus dans Pro',
        'Mise en relation avec des investisseurs',
        'Assistance IA personnalisée',
        'Analyses concurrentielles',
        'Accompagnement dédié',
        'Accès API'
      ],
      popular: false
    }
  ];
  
  return (
    <div className={clsx(
      "min-h-screen",
      darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
    )}>
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Sparkles className={clsx(
              "h-6 w-6",
              darkMode ? "text-purple-400" : "text-secondary-lighter"
            )} />
            <span className={clsx(
              "font-semibold text-xl",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Raisup
            </span>
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className={clsx(
              "transition-colors",
              darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-primary"
            )}>
              Accueil
            </Link>
            <Link to="/pricing" className={clsx(
              "font-medium",
              darkMode ? "text-purple-400" : "text-primary"
            )}>
              Tarifs
            </Link>
            <Link to="/how-it-works" className={clsx(
              "transition-colors",
              darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-primary"
            )}>
              Comment ça marche
            </Link>
            <Link to="/login" className={clsx(
              "transition-colors",
              darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-primary"
            )}>
              Connexion
            </Link>
          </nav>
          <button 
            className="md:hidden text-gray-700 hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-secondary-lighter" />
                <span className="font-semibold text-xl">Raisup</span>
              </div>
              <button 
                className="text-gray-700 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col space-y-6">
              <Link 
                to="/" 
                className="text-gray-900 font-medium text-lg hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link 
                to="/pricing" 
                className="text-primary font-medium text-lg hover:text-opacity-80 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tarifs
              </Link>
              <Link 
                to="/how-it-works" 
                className="text-gray-900 font-medium text-lg hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Comment ça marche
              </Link>
              <Link 
                to="/login" 
                className="text-gray-900 font-medium text-lg hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Connexion
              </Link>
            </nav>
          </div>
        </div>
      )}

      <main>
        {/* Hero section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h1 className={clsx(
            "text-4xl md:text-5xl font-bold mb-6",
            darkMode ? "text-white" : "text-gray-900"
          )}>
            Des tarifs simples et transparents
          </h1>
          <p className={clsx(
            "text-xl max-w-3xl mx-auto mb-12",
            darkMode ? "text-gray-300" : "text-gray-600"
          )}>
            Choisissez le plan qui correspond à vos besoins et commencez à optimiser votre levée de fonds dès aujourd'hui.
          </p>
          
          {/* Billing toggle */}
          <div className="flex items-center justify-center mb-12">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={clsx(
                "px-4 py-2 text-sm font-medium rounded-l-lg transition-colors",
                billingCycle === 'monthly'
                  ? darkMode 
                    ? "bg-secondary-lighter text-primary" 
                    : "bg-secondary-lighter text-primary"
                  : darkMode 
                    ? "bg-gray-700 text-gray-300" 
                    : "bg-gray-100 text-gray-700"
              )}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={clsx(
                "px-4 py-2 text-sm font-medium rounded-r-lg transition-colors relative",
                billingCycle === 'annual'
                  ? darkMode 
                    ? "bg-secondary-lighter text-primary" 
                    : "bg-secondary-lighter text-primary"
                  : darkMode 
                    ? "bg-gray-700 text-gray-300" 
                    : "bg-gray-100 text-gray-700"
              )}
            >
              Annuel
              <span className={clsx(
                "absolute -top-2 -right-2 px-2 py-0.5 text-xs font-medium rounded-full",
                darkMode ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800"
              )}>
                -20%
              </span>
            </button>
          </div>
          
          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.name}
                onClick={() => setSelectedPlan(plan.name)}
                className={clsx(
                  "rounded-xl overflow-hidden transition-all cursor-pointer",
                  selectedPlan === plan.name
                    ? darkMode 
                      ? "ring-1 ring-secondary-lighter bg-gray-800 transform scale-105" 
                      : "ring-1 ring-secondary-lighter shadow-lg bg-white transform scale-105"
                    : plan.popular 
                      ? darkMode 
                        ? "ring-1 ring-secondary-lighter bg-gray-800" 
                        : "ring-1 ring-secondary-lighter shadow-lg bg-white"
                      : darkMode 
                        ? "bg-gray-800 hover:ring-1 hover:ring-secondary-lighter/50" 
                        : "bg-white shadow-sm hover:ring-1 hover:ring-secondary-lighter/50"
                )}
              >
                {plan.popular && (
                  <div className={clsx(
                    "py-1 text-center text-sm font-medium",
                    darkMode ? "bg-secondary-lighter text-primary" : "bg-secondary-lighter text-primary"
                  )}
                  >
                    Le plus populaire
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className={clsx(
                    "text-xl font-bold mb-2",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    {plan.name}
                  </h3>
                  <p className={clsx(
                    "text-sm mb-6 h-12",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    {plan.description}
                  </p>
                  
                  <div className="mb-6">
                    <div className="flex items-end">
                      <span className={clsx(
                        "text-3xl font-bold",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        {billingCycle === 'monthly' 
                          ? `${plan.monthlyPrice}€` 
                          : `${plan.annualPrice}€`}
                      </span>
                      <span className={clsx(
                        "text-sm ml-2 mb-1",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        {billingCycle === 'monthly' ? '/mois' : '/an'}
                      </span>
                    </div>
                    {billingCycle === 'annual' && (
                      <p className={clsx(
                        "text-sm mt-1",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        Soit {Math.round(plan.annualPrice / 12)}€/mois
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <p className={clsx(
                      "text-sm font-medium",
                      darkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      Inclus :
                    </p>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <Check className={clsx(
                          "h-5 w-5 mr-2 flex-shrink-0",
                          darkMode ? "text-green-400" : "text-green-500"
                        )} />
                        <span className={clsx(
                          "text-sm",
                          darkMode ? "text-gray-300" : "text-gray-600"
                        )}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* CTA button after selecting a plan */}
          <div className="mt-12">
            <Link 
              to="/login" 
              className={clsx(
                "px-6 py-3 rounded-xl font-medium transition-colors inline-flex items-center",
                darkMode 
                  ? "bg-secondary-lighter text-primary hover:bg-opacity-90" 
                  : "bg-secondary-lighter text-primary hover:bg-opacity-90"
              )}
            >
              Commencer avec le plan {selectedPlan}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
        
        {/* FAQ section */}
        <section className={clsx(
          "py-16",
          darkMode ? "bg-gray-800" : "bg-gray-50"
        )}>
          <div className="container mx-auto px-4">
            <h2 className={clsx(
              "text-3xl font-bold text-center mb-12",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Questions fréquentes
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  question: "Puis-je changer de plan à tout moment ?",
                  answer: "Oui, vous pouvez passer à un plan supérieur à tout moment. Le changement prendra effet immédiatement et nous ajusterons votre facturation au prorata. Pour passer à un plan inférieur, le changement prendra effet à la fin de votre période de facturation en cours."
                },
                {
                  question: "Y a-t-il un essai gratuit ?",
                  answer: "Oui, nous proposons un essai gratuit de 14 jours pour tous nos plans. Aucune carte de crédit n'est requise pour commencer votre essai."
                },
                {
                  question: "Comment fonctionne la facturation annuelle ?",
                  answer: "Avec la facturation annuelle, vous payez pour 10 mois et obtenez 2 mois gratuits, soit une économie de 20% par rapport à la facturation mensuelle. Le montant est prélevé en une seule fois au début de votre période d'abonnement."
                },
                {
                  question: "Puis-je annuler mon abonnement à tout moment ?",
                  answer: "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. Si vous annulez un abonnement annuel, nous vous rembourserons au prorata pour les mois non utilisés."
                },
                {
                  question: "Quels moyens de paiement acceptez-vous ?",
                  answer: "Nous acceptons les cartes de crédit (Visa, Mastercard, American Express), les virements bancaires et PayPal."
                }
              ].map((faq, index) => (
                <div 
                  key={index}
                  className={clsx(
                    "p-6 rounded-xl",
                    darkMode ? "bg-gray-700" : "bg-white shadow-sm"
                  )}
                >
                  <h3 className={clsx(
                    "text-lg font-medium mb-2",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    {faq.question}
                  </h3>
                  <p className={clsx(
                    "text-sm",
                    darkMode ? "text-gray-300" : "text-gray-600"
                  )}>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className={clsx(
            "max-w-4xl mx-auto p-8 rounded-2xl",
            darkMode 
              ? "bg-gradient-to-r from-secondary-light to-secondary-lighter border border-secondary-lighter/30" 
              : "bg-gradient-to-r from-secondary-light to-secondary-lighter/70"
          )}>
            <h2 className={clsx(
              "text-2xl md:text-3xl font-bold mb-4",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Prêt à transformer votre levée de fonds ?
            </h2>
            <p className={clsx(
              "text-lg mb-8 max-w-2xl mx-auto",
              darkMode ? "text-gray-300" : "text-gray-700"
            )}>
              Rejoignez des centaines d'entrepreneurs qui ont déjà optimisé leur processus de levée de fonds avec Raisup.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/login" 
                className={clsx(
                  "px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center",
                  darkMode 
                    ? "bg-secondary-lighter text-primary hover:bg-opacity-90" 
                    : "bg-secondary-lighter text-primary hover:bg-opacity-90"
                )}
              >
                Commencer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                to="/how-it-works" 
                className={clsx(
                  "px-6 py-3 rounded-xl font-medium transition-colors",
                  darkMode 
                    ? "bg-gray-700 text-white hover:bg-gray-600" 
                    : "bg-white text-gray-800 hover:bg-gray-100"
                )}
              >
                Comment ça marche
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <footer className={clsx(
        "py-12 border-t",
        darkMode ? "border-gray-800" : "border-gray-200"
      )}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <Sparkles className={clsx(
                "h-5 w-5 mr-2",
                darkMode ? "text-purple-400" : "text-secondary-lighter"
              )} />
              <span className={clsx(
                "font-semibold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Raisup
              </span>
            </div>
            
            <div className="flex space-x-8">
              <a 
                href="#" 
                className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                )}
              >
                Conditions d'utilisation
              </a>
              <a 
                href="#" 
                className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                )}
              >
                Politique de confidentialité
              </a>
              <a 
                href="#" 
                className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                )}
              >
                Contact
              </a>
            </div>
            
            <div className={clsx(
              "text-sm mt-6 md:mt-0",
              darkMode ? "text-gray-400" : "text-gray-500"
            )}>
              © {new Date().getFullYear()} . Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;