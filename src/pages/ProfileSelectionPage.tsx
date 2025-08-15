import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Building2, Rocket, ArrowRight, Users, Target } from 'lucide-react';
import clsx from 'clsx';

const ProfileSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState<'B2B' | 'B2C' | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Check if dark mode is enabled
  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  }, []);

  const handleContinue = () => {
    if (selectedProfile === 'B2B') {
      navigate('/register/b2b');
    } else if (selectedProfile === 'B2C') {
      navigate('/onboarding/entrepreneur');
    }
  };

  return (
    <div className={clsx(
      "min-h-screen flex flex-col",
      darkMode ? "bg-gray-900" : "bg-gray-50"
    )}>
      <header className="container mx-auto px-4 py-6">
        <Link to="/" className="flex items-center space-x-2">
          <Sparkles className={clsx(
            "h-6 w-6",
            darkMode ? "text-purple-400" : "text-secondary-lighter"
          )} />
          <span className={clsx(
            "font-semibold text-xl",
            darkMode ? "text-white" : "text-gray-900"
          )}>
            FundAI
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className={clsx(
          "w-full max-w-4xl rounded-xl shadow-sm p-8",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="text-center mb-12">
            <h1 className={clsx(
              "text-3xl font-bold mb-4",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Quel est votre profil ?
            </h1>
            <p className={clsx(
              "text-lg",
              darkMode ? "text-gray-300" : "text-gray-600"
            )}>
              Choisissez le type de compte qui correspond le mieux à votre situation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* B2B Profile */}
            <div
              onClick={() => setSelectedProfile('B2B')}
              className={clsx(
                "p-8 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg",
                selectedProfile === 'B2B'
                  ? darkMode
                    ? "border-purple-500 bg-purple-900/20"
                    : "border-primary bg-secondary-light"
                  : darkMode
                    ? "border-gray-600 hover:border-gray-500"
                    : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex flex-col items-center text-center">
                <div className={clsx(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                  selectedProfile === 'B2B'
                    ? darkMode
                      ? "bg-purple-600"
                      : "bg-primary"
                    : darkMode
                      ? "bg-gray-700"
                      : "bg-gray-100"
                )}>
                  <Building2 className={clsx(
                    "h-8 w-8",
                    selectedProfile === 'B2B'
                      ? "text-white"
                      : darkMode
                        ? "text-gray-400"
                        : "text-gray-600"
                  )} />
                </div>
                
                <h3 className={clsx(
                  "text-xl font-semibold mb-3",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Structure d'accompagnement
                </h3>
                
                <p className={clsx(
                  "text-sm mb-4",
                  darkMode ? "text-gray-300" : "text-gray-600"
                )}>
                  Incubateurs, accélérateurs, pépinières, consultants en levée de fonds
                </p>
                
                <div className="space-y-2 text-left w-full">
                  <div className="flex items-center">
                    <Users className={clsx(
                      "h-4 w-4 mr-2",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )} />
                    <span className={clsx(
                      "text-sm",
                      darkMode ? "text-gray-300" : "text-gray-600"
                    )}>
                      Gestion de portefeuille de startups
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Target className={clsx(
                      "h-4 w-4 mr-2",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )} />
                    <span className={clsx(
                      "text-sm",
                      darkMode ? "text-gray-300" : "text-gray-600"
                    )}>
                      Outils d'accompagnement avancés
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Building2 className={clsx(
                      "h-4 w-4 mr-2",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )} />
                    <span className={clsx(
                      "text-sm",
                      darkMode ? "text-gray-300" : "text-gray-600"
                    )}>
                      Interface dédiée aux professionnels
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* B2C Profile */}
            <div
              onClick={() => setSelectedProfile('B2C')}
              className={clsx(
                "p-8 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg",
                selectedProfile === 'B2C'
                  ? darkMode
                    ? "border-purple-500 bg-purple-900/20"
                    : "border-primary bg-secondary-light"
                  : darkMode
                    ? "border-gray-600 hover:border-gray-500"
                    : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex flex-col items-center text-center">
                <div className={clsx(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                  selectedProfile === 'B2C'
                    ? darkMode
                      ? "bg-purple-600"
                      : "bg-primary"
                    : darkMode
                      ? "bg-gray-700"
                      : "bg-gray-100"
                )}>
                  <Rocket className={clsx(
                    "h-8 w-8",
                    selectedProfile === 'B2C'
                      ? "text-white"
                      : darkMode
                        ? "text-gray-400"
                        : "text-gray-600"
                  )} />
                </div>
                
                <h3 className={clsx(
                  "text-xl font-semibold mb-3",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Startup / Entreprise
                </h3>
                
                <p className={clsx(
                  "text-sm mb-4",
                  darkMode ? "text-gray-300" : "text-gray-600"
                )}>
                  Entrepreneurs, fondateurs de startups, porteurs de projet
                </p>
                
                <div className="space-y-2 text-left w-full">
                  <div className="flex items-center">
                    <Rocket className={clsx(
                      "h-4 w-4 mr-2",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )} />
                    <span className={clsx(
                      "text-sm",
                      darkMode ? "text-gray-300" : "text-gray-600"
                    )}>
                      Création de dossier de levée de fonds
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Target className={clsx(
                      "h-4 w-4 mr-2",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )} />
                    <span className={clsx(
                      "text-sm",
                      darkMode ? "text-gray-300" : "text-gray-600"
                    )}>
                      Mise en relation avec investisseurs
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className={clsx(
                      "h-4 w-4 mr-2",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )} />
                    <span className={clsx(
                      "text-sm",
                      darkMode ? "text-gray-300" : "text-gray-600"
                    )}>
                      Accompagnement personnalisé
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={!selectedProfile}
              className={clsx(
                "px-8 py-3 rounded-xl font-medium flex items-center justify-center mx-auto transition-all duration-200",
                selectedProfile
                  ? darkMode
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-primary text-white hover:bg-opacity-90"
                  : darkMode
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              Continuer
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            
            <p className={clsx(
              "text-sm mt-4",
              darkMode ? "text-gray-400" : "text-gray-500"
            )}>
              Vous avez déjà un compte ?{' '}
              <Link
                to="/login"
                className={clsx(
                  "font-medium hover:underline",
                  darkMode ? "text-purple-400" : "text-primary"
                )}
              >
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