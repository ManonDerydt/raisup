import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle, FileText, Users, BarChart3, Clock, Menu, X } from 'lucide-react';
import clsx from 'clsx';

const HowItWorksPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check if dark mode is enabled
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  }, []);
  
  // Steps data
  const steps = [
    {
      id: 1,
      title: "Créez votre profil",
      description: "Commencez par renseigner vos informations personnelles et professionnelles. Ces données nous permettent de personnaliser votre expérience et d'adapter nos recommandations à votre profil d'entrepreneur.",
      icon: Users,
      color: "blue"
    },
    {
      id: 2,
      title: "Décrivez votre projet",
      description: "Présentez votre entreprise, votre vision et votre business model. Plus vous fournissez de détails, plus notre IA pourra générer des documents pertinents et adaptés à votre secteur d'activité.",
      icon: FileText,
      color: "green"
    },
    {
      id: 3,
      title: "Analysez vos finances",
      description: "Renseignez vos données financières actuelles et vos projections. Notre plateforme analyse ces informations pour créer des modèles financiers crédibles qui convaincront les investisseurs.",
      icon: BarChart3,
      color: "purple"
    },
    {
      id: 4,
      title: "Générez vos documents",
      description: "Notre IA génère automatiquement tous les documents nécessaires à votre levée de fonds : business plan, pitch deck, prévisions financières, etc. Vous pouvez les personnaliser selon vos besoins.",
      icon: FileText,
      color: "orange"
    },
    {
      id: 5,
      title: "Connectez avec des investisseurs",
      description: "Accédez à notre réseau d'investisseurs qualifiés. Notre algorithme vous met en relation avec ceux qui correspondent le mieux à votre secteur, votre stade de développement et vos besoins de financement.",
      icon: Users,
      color: "indigo"
    },
    {
      id: 6,
      title: "Suivez votre progression",
      description: "Utilisez notre tableau de bord pour suivre l'avancement de votre levée de fonds, gérer vos interactions avec les investisseurs et optimiser votre stratégie en temps réel.",
      icon: Clock,
      color: "teal"
    }
  ];
  
  // Benefits data
  const benefits = [
    {
      title: "Gain de temps considérable",
      description: "Réduisez de 80% le temps nécessaire à la préparation de votre dossier de levée de fonds.",
      icon: Clock
    },
    {
      title: "Documents professionnels",
      description: "Générez des documents de qualité professionnelle qui répondent aux attentes des investisseurs.",
      icon: FileText
    },
    {
      title: "Analyse financière précise",
      description: "Obtenez des projections financières crédibles et des analyses de marché détaillées.",
      icon: BarChart3
    },
    {
      title: "Accès aux investisseurs",
      description: "Connectez directement avec des investisseurs qualifiés et intéressés par votre secteur.",
      icon: Users
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
              "transition-colors",
              darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-primary"
            )}>
              Tarifs
            </Link>
            <Link to="/how-it-works" className={clsx(
              "font-medium",
              darkMode ? "text-purple-400" : "text-primary"
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
                className="text-gray-900 font-medium text-lg hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tarifs
              </Link>
              <Link 
                to="/how-it-works" 
                className="text-primary font-medium text-lg hover:text-opacity-80 transition-colors"
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
            Comment fonctionne Raisup
          </h1>
          <p className={clsx(
            "text-xl max-w-3xl mx-auto mb-12",
            darkMode ? "text-gray-300" : "text-gray-600"
          )}>
            Découvrez comment notre plateforme propulsée par l'IA vous aide à préparer, structurer et optimiser votre levée de fonds en quelques étapes simples.
          </p>
        </section>
        
        {/* Steps section */}
        <section className={clsx(
          "py-16",
          darkMode ? "bg-gray-800" : "bg-gray-50"
        )}>
          <div className="container mx-auto px-4">
            <h2 className={clsx(
              "text-3xl font-bold text-center mb-16",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Un processus simple et efficace
            </h2>
            
            <div className="max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <div 
                  key={step.id} 
                  className={clsx(
                    "flex flex-col md:flex-row items-start mb-16 relative",
                    index !== steps.length - 1 && "pb-16"
                  )}
                >
                  {/* Vertical line connecting steps */}
                  {index !== steps.length - 1 && (
                    <div className={clsx(
                      "absolute left-6 md:left-10 top-16 bottom-0 w-0.5",
                      darkMode ? "bg-gray-700" : "bg-gray-200"
                    )} />
                  )}
                  
                  {/* Step number and icon */}
                  <div className="flex-shrink-0 mr-6 md:mr-10">
                    <div className={clsx(
                      "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg",
                      step.color === "blue" 
                        ? darkMode ? "bg-blue-600" : "bg-blue-500"
                        : step.color === "green"
                          ? darkMode ? "bg-green-600" : "bg-green-500"
                          : step.color === "purple"
                            ? darkMode ? "bg-purple-600" : "bg-purple-500"
                            : step.color === "orange"
                              ? darkMode ? "bg-orange-600" : "bg-orange-500"
                              : step.color === "indigo"
                                ? darkMode ? "bg-indigo-600" : "bg-indigo-500"
                                : darkMode ? "bg-teal-600" : "bg-teal-500"
                    )}>
                      <step.icon className="h-6 w-6" />
                    </div>
                  </div>
                  
                  {/* Step content */}
                  <div className="flex-1 mt-4 md:mt-0">
                    <h3 className={clsx(
                      "text-xl font-semibold mb-3",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Étape {step.id}: {step.title}
                    </h3>
                    <p className={clsx(
                      "text-base",
                      darkMode ? "text-gray-300" : "text-gray-600"
                    )}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Benefits section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className={clsx(
            "text-3xl font-bold text-center mb-16",
            darkMode ? "text-white" : "text-gray-900"
          )}>
            Les avantages de Raisup
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className={clsx(
                  "p-6 rounded-xl text-center",
                  darkMode ? "bg-gray-800" : "bg-white shadow-sm"
                )}
              >
                <div className={clsx(
                  "w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4",
                  darkMode ? "bg-purple-900/30" : "bg-secondary-light"
                )}>
                  <benefit.icon className={clsx(
                    "h-8 w-8",
                    darkMode ? "text-purple-400" : "text-primary"
                  )} />
                </div>
                <h3 className={clsx(
                  "text-lg font-semibold mb-3",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  {benefit.title}
                </h3>
                <p className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-300" : "text-gray-600"
                )}>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Testimonials section */}
        <section className={clsx(
          "py-16",
          darkMode ? "bg-gray-800" : "bg-gray-50"
        )}>
          <div className="container mx-auto px-4">
            <h2 className={clsx(
              "text-3xl font-bold text-center mb-16",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Ce que disent nos utilisateurs
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  quote: "Raisup nous a fait gagner un temps précieux dans la préparation de notre levée de fonds. Les documents générés étaient d'une qualité exceptionnelle.",
                  author: "Sophie Martin",
                  role: "CEO, TechStart SAS",
                  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                },
                {
                  quote: "Grâce à Raisup, nous avons pu lever 2  millions d'euros en seulement 3 mois. La qualité des analyses financières a vraiment fait la différence.",
                  author: "Thomas Dubois",
                  role: "Fondateur, GreenTech",
                  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                },
                {
                  quote: "La mise en relation avec des investisseurs qualifiés a été déterminante pour notre succès. Raisup a vraiment compris nos besoins spécifiques.",
                  author: "Julie Leroy",
                  role: "COO, MedInnovate",
                  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                }
              ].map((testimonial, index) => (
                <div 
                  key={index}
                  className={clsx(
                    "p-6 rounded-xl",
                    darkMode ? "bg-gray-700" : "bg-white shadow-sm"
                  )}
                >
                  <p className={clsx(
                    "text-base italic mb-6",
                    darkMode ? "text-gray-300" : "text-gray-600"
                  )}>
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.author}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className={clsx(
                        "font-medium",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        {testimonial.author}
                      </h4>
                      <p className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
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
              ? "bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-800/30" 
              : "bg-gradient-to-r from-secondary-light to-secondary-lighter/70"
          )}>
            <h2 className={clsx(
              "text-2xl md:text-3xl font-bold mb-4",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Prêt à commencer votre levée de fonds ?
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
                    ? "bg-purple-600 text-white hover:bg-purple-700" 
                    : "bg-primary text-white hover:bg-opacity-90"
                )}
              >
                Commencer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                to="/pricing" 
                className={clsx(
                  "px-6 py-3 rounded-xl font-medium transition-colors",
                  darkMode 
                    ? "bg-gray-700 text-white hover:bg-gray-600" 
                    : "bg-white text-gray-800 hover:bg-gray-100"
                )}
              >
                Voir nos tarifs
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
              © {new Date().getFullYear()} Raisup. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HowItWorksPage;