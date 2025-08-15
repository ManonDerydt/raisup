import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { 
  DollarSign, 
  Building, 
  FileText, 
  ExternalLink, 
  Download, 
  Mail, 
  Phone, 
  Globe, 
  Check, 
  Info,
  Users,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import clsx from 'clsx';

const FundraisingPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('non-dilutive');
  
  // Check if dark mode is enabled
  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  }, []);
  
  // Mock data for non-dilutive funding sources
  const nonDilutiveSources = [
    {
      id: 1,
      name: 'Bpifrance - Aide à l\'Innovation',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&h=64&q=80',
      type: 'Subvention',
      amount: '50 000 € - 200 000 €',
      description: 'Financement des projets innovants à fort potentiel de croissance.',
      eligibility: 'Startups et PME innovantes de moins de 5 ans',
      deadline: '31 décembre 2025',
      match: 92,
      forms: [
        { name: 'Formulaire de demande', url: '#', type: 'pdf' },
        { name: 'Business plan', url: '#', type: 'docx' },
        { name: 'Prévisions financières', url: '#', type: 'xlsx' }
      ],
      website: 'https://www.bpifrance.fr'
    },
    {
      id: 2,
      name: 'France 2030 - Santé Numérique',
      logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&h=64&q=80',
      type: 'Subvention',
      amount: '100 000 € - 500 000 €',
      description: 'Programme de soutien aux innovations dans le domaine de la santé numérique.',
      eligibility: 'Startups et PME dans le secteur de la santé',
      deadline: '15 septembre 2025',
      match: 87,
      forms: [
        { name: 'Dossier de candidature', url: '#', type: 'pdf' },
        { name: 'Présentation du projet', url: '#', type: 'pptx' }
      ],
      website: 'https://www.france2030.gouv.fr'
    },
    {
      id: 3,
      name: 'Région Île-de-France - PM\'up',
      logo: 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&h=64&q=80',
      type: 'Subvention',
      amount: 'Jusqu\'à 250 000 €',
      description: 'Aide au développement des PME franciliennes à fort potentiel.',
      eligibility: 'PME basées en Île-de-France',
      deadline: '30 juin 2025',
      match: 78,
      forms: [
        { name: 'Formulaire PM\'up', url: '#', type: 'pdf' },
        { name: 'Annexes financières', url: '#', type: 'xlsx' }
      ],
      website: 'https://www.iledefrance.fr'
    },
    {
      id: 4,
      name: 'Prêt Innovation - Bpifrance',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&h=64&q=80',
      type: 'Prêt',
      amount: '50 000 € - 5 000 000 €',
      description: 'Prêt à taux avantageux pour financer les projets innovants.',
      eligibility: 'PME et ETI de plus de 3 ans',
      deadline: 'Continu',
      match: 85,
      forms: [
        { name: 'Dossier de demande de prêt', url: '#', type: 'pdf' },
        { name: 'Plan de financement', url: '#', type: 'xlsx' }
      ],
      website: 'https://www.bpifrance.fr'
    },
    {
      id: 5,
      name: 'Horizon Europe - EIC Accelerator',
      logo: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&h=64&q=80',
      type: 'Subvention + Equity',
      amount: 'Jusqu\'à 2 500 000 €',
      description: 'Programme européen de financement pour les innovations de rupture.',
      eligibility: 'Startups et PME innovantes',
      deadline: '15 octobre 2025',
      match: 72,
      forms: [
        { name: 'Application form', url: '#', type: 'pdf' },
        { name: 'Financial annexes', url: '#', type: 'xlsx' },
        { name: 'Technical proposal', url: '#', type: 'docx' }
      ],
      website: 'https://eic.ec.europa.eu'
    }
  ];
  
  // Mock data for dilutive funding sources
  const dilutiveSources = [
    {
      id: 1,
      name: 'Elaia Partners',
      logo: 'https://images.unsplash.com/photo-1491336477066-31156b5e4f35?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&h=64&q=80',
      type: 'Venture Capital',
      stage: 'Seed, Series A',
      amount: '1M€ - 10M€',
      focus: 'Deeptech, Healthtech, SaaS',
      description: 'Fonds d\'investissement spécialisé dans les startups technologiques à fort potentiel.',
      portfolio: 'Criteo, Shift Technology, Teads',
      match: 94,
      contact: {
        email: 'contact@elaia.com',
        phone: '+33 1 XX XX XX XX',
        website: 'https://www.elaia.com'
      }
    },
    {
      id: 2,
      name: 'Kima Ventures',
      logo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&h=64&q=80',
      type: 'Seed Fund',
      stage: 'Pre-seed, Seed',
      amount: '150K€ - 2M€',
      focus: 'Tech, Digital Health, SaaS',
      description: 'Fonds d\'amorçage très actif investissant dans des startups en phase initiale.',
      portfolio: 'Zenly, Payfit, Sorare',
      match: 89,
      contact: {
        email: 'apply@kimaventures.com',
        phone: '+33 1 XX XX XX XX',
        website: 'https://www.kimaventures.com'
      }
    },
    {
      id: 3,
      name: 'Partech Ventures',
      logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&h=64&q=80',
      type: 'Venture Capital',
      stage: 'Seed, Series A, Series B',
      amount: '1M€ - 30M€',
      focus: 'Healthtech, Fintech, Enterprise Software',
      description: 'Fonds d\'investissement international avec une forte présence en Europe.',
      portfolio: 'Alan, Doctolib, Made.com',
      match: 86,
      contact: {
        email: 'info@partechpartners.com',
        phone: '+33 1 XX XX XX XX',
        website: 'https://www.partechpartners.com'
      }
    },
    {
      id: 4,
      name: 'Business Angels Santé',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&h=64&q=80',
      type: 'Angel Investors',
      stage: 'Pre-seed, Seed',
      amount: '100K€ - 1M€',
      focus: 'Healthtech, Medtech, Biotech',
      description: 'Réseau de business angels spécialisés dans le secteur de la santé.',
      portfolio: 'Diverses startups santé en France',
      match: 91,
      contact: {
        email: 'contact@businessangels-sante.com',
        phone: '+33 1 XX XX XX XX',
        website: 'https://www.businessangels-sante.com'
      }
    },
    {
      id: 5,
      name: 'Bpifrance Innovation Capital',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&h=64&q=80',
      type: 'Public Investment Fund',
      stage: 'Series A, Series B',
      amount: '2M€ - 20M€',
      focus: 'Deeptech, Healthtech, Greentech',
      description: 'Fonds d\'investissement public français soutenant l\'innovation.',
      portfolio: 'Nombreuses entreprises innovantes françaises',
      match: 83,
      contact: {
        email: 'contact@bpifrance.fr',
        phone: '+33 1 XX XX XX XX',
        website: 'https://www.bpifrance.fr'
      }
    }
  ];
  
  // Function to render document type icon
  const renderDocumentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'docx':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'xlsx':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'pptx':
        return <FileText className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  
  return (
    <div className={clsx(
      "py-8 px-4 sm:px-6 lg:px-8",
      darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
    )}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className={clsx(
              "text-2xl font-bold",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Levée de fonds
            </h1>
            <p className={clsx(
              "mt-1",
              darkMode ? "text-gray-400" : "text-gray-500"
            )}>
              Explorez les options de financement adaptées à votre projet
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <button className={clsx(
              "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              darkMode 
                ? "bg-purple-600 text-white hover:bg-purple-700" 
                : "bg-primary text-white hover:bg-opacity-90"
            )}>
              <Sparkles className="h-4 w-4 mr-2" />
              Recommandations IA
            </button>
          </div>
        </div>
        
        <div className={clsx(
          "rounded-xl shadow-sm overflow-hidden mb-8",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="p-6">
            <div className="flex items-start mb-6">
              <div className={clsx(
                "p-2 rounded-full mr-3 flex-shrink-0",
                darkMode ? "bg-purple-900/30" : "bg-secondary-light"
              )}>
                <TrendingUp className={clsx(
                  "h-5 w-5",
                  darkMode ? "text-purple-400" : "text-primary"
                )} />
              </div>
              <div>
                <h2 className={clsx(
                  "text-lg font-semibold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Votre stratégie de financement
                </h2>
                <p className={clsx(
                  "mt-1",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Basé sur votre profil, nous recommandons un mix de financement dilutif et non dilutif pour optimiser votre structure de capital.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className={clsx(
                "p-4 rounded-lg",
                darkMode ? "bg-gray-700" : "bg-gray-50"
              )}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className={clsx(
                    "text-sm font-medium",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Objectif de levée
                  </h3>
                  <span className={clsx(
                    "text-sm font-semibold",
                    darkMode ? "text-purple-400" : "text-primary"
                  )}>
                    3 000 000 €
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={clsx(
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Série A - Q3 2024
                  </span>
                </div>
              </div>
              
              <div className={clsx(
                "p-4 rounded-lg",
                darkMode ? "bg-gray-700" : "bg-gray-50"
              )}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className={clsx(
                    "text-sm font-medium",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Mix recommandé
                  </h3>
                </div>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 h-4 rounded-full overflow-hidden">
                    <div className="flex h-full">
                      <div 
                        className="bg-purple-500 dark:bg-purple-600" 
                        style={{width: '80%'}}
                        title="Dilutif (equity): 80%"
                      />
                      <div 
                        className="bg-blue-500 dark:bg-blue-600" 
                        style={{width: '10%'}}
                        title="Non dilutif (dette): 10%"
                      />
                      <div 
                        className="bg-green-500 dark:bg-green-600" 
                        style={{width: '10%'}}
                        title="Non dilutif (subventions): 10%"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span className={clsx(
                    darkMode ? "text-purple-400" : "text-purple-600"
                  )}>
                    Dilutif: 80%
                  </span>
                  <span className={clsx(
                    darkMode ? "text-green-400" : "text-green-600"
                  )}>
                    Non dilutif: 20%
                  </span>
                </div>
              </div>
              
              <div className={clsx(
                "p-4 rounded-lg",
                darkMode ? "bg-gray-700" : "bg-gray-50"
              )}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className={clsx(
                    "text-sm font-medium",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Structure d'actionnariat
                  </h3>
                </div>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 h-4 rounded-full overflow-hidden">
                    <div className="flex h-full">
                      <div 
                        className="bg-blue-500 dark:bg-blue-600" 
                        style={{width: '65%'}}
                        title="Fondateurs: 65%"
                      />
                      <div 
                        className="bg-green-500 dark:bg-green-600" 
                        style={{width: '12%'}}
                        title="Investisseurs Seed: 12%"
                      />
                      <div 
                        className="bg-purple-500 dark:bg-purple-600" 
                        style={{width: '20%'}}
                        title="Investisseurs Série A: 20%"
                      />
                      <div 
                        className="bg-yellow-500 dark:bg-yellow-600" 
                        style={{width: '3%'}}
                        title="Employés: 3%"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span className={clsx(
                    darkMode ? "text-blue-400" : "text-blue-600"
                  )}>
                    Fondateurs: 65%
                  </span>
                  <span className={clsx(
                    darkMode ? "text-purple-400" : "text-purple-600"
                  )}>
                    Investisseurs: 32%
                  </span>
                </div>
              </div>
            </div>
            
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className={clsx(
                "grid w-full grid-cols-2 mb-6",
                darkMode ? "bg-gray-700" : "bg-gray-100"
              )}>
                <TabsTrigger 
                  value="non-dilutive" 
                  className={clsx(
                    "flex items-center justify-center py-3",
                    darkMode ? "data-[state=active]:bg-gray-800 data-[state=active]:text-purple-400" : "data-[state=active]:bg-white data-[state=active]:text-primary"
                  )}
                >
                  <Building className="h-4 w-4 mr-2" />
                  Financement Non Dilutif
                </TabsTrigger>
                <TabsTrigger 
                  value="dilutive" 
                  className={clsx(
                    "flex items-center justify-center py-3",
                    darkMode ? "data-[state=active]:bg-gray-800 data-[state=active]:text-purple-400" : "data-[state=active]:bg-white data-[state=active]:text-primary"
                  )}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Financement Dilutif
                </TabsTrigger>
              </TabsList>
              
              {/* Non-Dilutive Funding Tab */}
              <TabsContent value="non-dilutive">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className={clsx(
                      "text-lg font-medium",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Financements non dilutifs recommandés
                    </h3>
                    <div className={clsx(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      darkMode ? "bg-purple-900/30 text-purple-300" : "bg-secondary-light text-primary"
                    )}>
                      Objectif: 600 000 € (20%)
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {nonDilutiveSources.map((source) => (
                      <div 
                        key={source.id}
                        className={clsx(
                          "p-4 rounded-xl border transition-colors",
                          darkMode ? "bg-gray-700 border-gray-600 hover:border-purple-500/50" : "bg-white border-gray-200 hover:border-primary/30"
                        )}
                      >
                        <div className="flex flex-col md:flex-row md:items-start">
                          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden">
                              <img 
                                src={source.logo} 
                                alt={source.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                              <div>
                                <h4 className={clsx(
                                  "text-lg font-medium",
                                  darkMode ? "text-white" : "text-gray-900"
                                )}>
                                  {source.name}
                                </h4>
                                <div className="flex items-center mt-1">
                                  <span className={clsx(
                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2",
                                    source.type === 'Subvention'
                                      ? darkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-800"
                                      : source.type === 'Prêt'
                                        ? darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-800"
                                        : darkMode ? "bg-purple-900/30 text-purple-300" : "bg-purple-100 text-purple-800"
                                  )}>
                                    {source.type}
                                  </span>
                                  <span className={clsx(
                                    "text-sm",
                                    darkMode ? "text-gray-400" : "text-gray-500"
                                  )}>
                                    {source.amount}
                                  </span>
                                </div>
                              </div>
                              
                              <div className={clsx(
                                "mt-2 md:mt-0 px-3 py-1 rounded-full text-xs font-medium",
                                darkMode ? "bg-purple-900/30 text-purple-300" : "bg-secondary-light text-primary"
                              )}>
                                Match {source.match}%
                              </div>
                            </div>
                            
                            <p className={clsx(
                              "mt-2 text-sm",
                              darkMode ? "text-gray-300" : "text-gray-600"
                            )}>
                              {source.description}
                            </p>
                            
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className={clsx(
                                  "text-xs font-medium mb-2",
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                )}>
                                  Éligibilité
                                </h5>
                                <p className={clsx(
                                  "text-xs",
                                  darkMode ? "text-gray-400" : "text-gray-500"
                                )}>
                                  {source.eligibility}
                                </p>
                                <p className={clsx(
                                  "text-xs mt-1",
                                  darkMode ? "text-gray-400" : "text-gray-500"
                                )}>
                                  <span className="font-medium">Date limite:</span> {source.deadline}
                                </p>
                              </div>
                              
                              <div>
                                <h5 className={clsx(
                                  "text-xs font-medium mb-2",
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                )}>
                                  Documents requis
                                </h5>
                                <div className="space-y-1">
                                  {source.forms.map((form, index) => (
                                    <div key={index} className="flex items-center">
                                      {renderDocumentIcon(form.type)}
                                      <a 
                                        href={form.url}
                                        className={clsx(
                                          "text-xs ml-2 hover:underline",
                                          darkMode ? "text-purple-400" : "text-primary"
                                        )}
                                      >
                                        {form.name}
                                      </a>
                                      <Download className={clsx(
                                        "h-3 w-3 ml-1",
                                        darkMode ? "text-gray-400" : "text-gray-500"
                                      )} />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <a 
                                href={source.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={clsx(
                                  "inline-flex items-center text-sm hover:underline",
                                  darkMode ? "text-purple-400" : "text-primary"
                                )}
                              >
                                Visiter le site
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                              
                              <div className="mt-2 sm:mt-0 flex space-x-2">
                                <button className={clsx(
                                  "inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                                  darkMode 
                                    ? "bg-gray-600 text-white hover:bg-gray-500" 
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                )}>
                                  Générer les documents
                                </button>
                                <button className={clsx(
                                  "inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                                  darkMode 
                                    ? "bg-purple-600 text-white hover:bg-purple-700" 
                                    : "bg-primary text-white hover:bg-opacity-90"
                                )}>
                                  Ajouter à ma sélection
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              {/* Dilutive Funding Tab */}
              <TabsContent value="dilutive">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className={clsx(
                      "text-lg font-medium",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Investisseurs recommandés
                    </h3>
                    <div className={clsx(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      darkMode ? "bg-purple-900/30 text-purple-300" : "bg-secondary-light text-primary"
                    )}>
                      Objectif: 2 400 000 € (80%)
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {dilutiveSources.map((investor) => (
                      <div 
                        key={investor.id}
                        className={clsx(
                          "p-4 rounded-xl border transition-colors",
                          darkMode ? "bg-gray-700 border-gray-600 hover:border-purple-500/50" : "bg-white border-gray-200 hover:border-primary/30"
                        )}
                      >
                        <div className="flex flex-col md:flex-row md:items-start">
                          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden">
                              <img 
                                src={investor.logo} 
                                alt={investor.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                              <div>
                                <h4 className={clsx(
                                  "text-lg font-medium",
                                  darkMode ? "text-white" : "text-gray-900"
                                )}>
                                  {investor.name}
                                </h4>
                                <div className="flex items-center mt-1">
                                  <span className={clsx(
                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2",
                                    investor.type === 'Venture Capital'
                                      ? darkMode ? "bg-purple-900/30 text-purple-300" : "bg-purple-100 text-purple-800"
                                      : investor.type === 'Angel Investors'
                                        ? darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-800"
                                        : darkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-800"
                                  )}>
                                    {investor.type}
                                  </span>
                                  <span className={clsx(
                                    "text-sm",
                                    darkMode ? "text-gray-400" : "text-gray-500"
                                  )}>
                                    {investor.stage}
                                  </span>
                                </div>
                              </div>
                              
                              <div className={clsx(
                                "mt-2 md:mt-0 px-3 py-1 rounded-full text-xs font-medium",
                                darkMode ? "bg-purple-900/30 text-purple-300" : "bg-secondary-light text-primary"
                              )}>
                                Match {investor.match}%
                              </div>
                            </div>
                            
                            <p className={clsx(
                              "mt-2 text-sm",
                              darkMode ? "text-gray-300" : "text-gray-600"
                            )}>
                              {investor.description}
                            </p>
                            
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className={clsx(
                                  "text-xs font-medium mb-2",
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                )}>
                                  Informations clés
                                </h5>
                                <p className={clsx(
                                  "text-xs",
                                  darkMode ? "text-gray-400" : "text-gray-500"
                                )}>
                                  <span className="font-medium">Focus:</span> {investor.focus}
                                </p>
                                <p className={clsx(
                                  "text-xs mt-1",
                                  darkMode ? "text-gray-400" : "text-gray-500"
                                )}>
                                  <span className="font-medium">Ticket:</span> {investor.amount}
                                </p>
                                <p className={clsx(
                                  "text-xs mt-1",
                                  darkMode ? "text-gray-400" : "text-gray-500"
                                )}>
                                  <span className="font-medium">Portfolio:</span> {investor.portfolio}
                                </p>
                              </div>
                              
                              <div>
                                <h5 className={clsx(
                                  "text-xs font-medium mb-2",
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                )}>
                                  Contact
                                </h5>
                                <div className="space-y-1">
                                  <div className="flex items-center">
                                    <Mail className={clsx(
                                      "h-3 w-3 mr-2",
                                      darkMode ? "text-gray-400" : "text-gray-500"
                                    )} />
                                    <a 
                                      href={`mailto:${investor.contact.email}`}
                                      className={clsx(
                                        "text-xs hover:underline",
                                        darkMode ? "text-purple-400" : "text-primary"
                                      )}
                                    >
                                      {investor.contact.email}
                                    </a>
                                  </div>
                                  <div className="flex items-center">
                                    <Phone className={clsx(
                                      "h-3 w-3 mr-2",
                                      darkMode ? "text-gray-400" : "text-gray-500"
                                    )} />
                                    <span className={clsx(
                                      "text-xs",
                                      darkMode ? "text-gray-300" : "text-gray-700"
                                    )}>
                                      {investor.contact.phone}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <Globe className={clsx(
                                      "h-3 w-3 mr-2",
                                      darkMode ? "text-gray-400" : "text-gray-500"
                                    )} />
                                    <a 
                                      href={investor.contact.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={clsx(
                                        "text-xs hover:underline",
                                        darkMode ? "text-purple-400" : "text-primary"
                                      )}
                                    >
                                      {investor.contact.website.replace('https://', '')}
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <a 
                                href={investor.contact.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={clsx(
                                  "inline-flex items-center text-sm hover:underline",
                                  darkMode ? "text-purple-400" : "text-primary"
                                )}
                              >
                                Visiter le site
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                              
                              <div className="mt-2 sm:mt-0 flex space-x-2">
                                <button className={clsx(
                                  "inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                                  darkMode 
                                    ? "bg-gray-600 text-white hover:bg-gray-500" 
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                )}>
                                  Préparer un pitch
                                </button>
                                <button className={clsx(
                                  "inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                                  darkMode 
                                    ? "bg-purple-600 text-white hover:bg-purple-700" 
                                    : "bg-primary text-white hover:bg-opacity-90"
                                )}>
                                  Ajouter à ma sélection
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div className={clsx(
          "rounded-xl shadow-sm overflow-hidden",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="p-6">
            <div className="flex items-start">
              <div className={clsx(
                "p-2 rounded-full mr-3 flex-shrink-0",
                darkMode ? "bg-amber-900/30" : "bg-amber-100"
              )}>
                <Info className={clsx(
                  "h-5 w-5",
                  darkMode ? "text-amber-400" : "text-amber-600"
                )} />
              </div>
              <div>
                <h2 className={clsx(
                  "text-lg font-semibold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Comprendre les types de financement
                </h2>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className={clsx(
                      "text-md font-medium mb-2",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Financement dilutif (equity)
                    </h3>
                    <p className={clsx(
                      "text-sm",
                      darkMode ? "text-gray-300" : "text-gray-600"
                    )}>
                      Vous cédez une partie du capital de votre entreprise en échange de fonds, ce qui dilue la part des actionnaires existants. Ce type de financement est adapté pour les projets à fort potentiel de croissance nécessitant des investissements importants.
                    </p>
                    <div className="mt-2">
                      <h4 className={clsx(
                        "text-sm font-medium mb-1",
                        darkMode ? "text-gray-300" : "text-gray-700"
                      )}>
                        Avantages:
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li className={clsx(
                          "text-sm",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Pas de remboursement à effectuer
                        </li>
                        <li className={clsx(
                          "text-sm",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Accès à l'expertise et au réseau des investisseurs
                        </li>
                        <li className={clsx(
                          "text-sm",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Montants généralement plus élevés
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className={clsx(
                      "text-md font-medium mb-2",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Financement non dilutif
                    </h3>
                    <p className={clsx(
                      "text-sm",
                      darkMode ? "text-gray-300" : "text-gray-600"
                    )}>
                      Vous obtenez des fonds sans céder de parts de votre entreprise. Cela inclut les subventions, les prêts, les avances remboursables et les crédits d'impôt. Ce type de financement permet de préserver le contrôle des fondateurs.
                    </p>
                    <div className="mt-2">
                      <h4 className={clsx(
                        "text-sm font-medium mb-1",
                        darkMode ? "text-gray-300" : "text-gray-700"
                      )}>
                        Avantages:
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li className={clsx(
                          "text-sm",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Conservation de l'actionnariat
                        </li>
                        <li className={clsx(
                          "text-sm",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Taux d'intérêt souvent avantageux (prêts)
                        </li>
                        <li className={clsx(
                          "text-sm",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Pas de remboursement pour certaines subventions
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className={clsx(
                    "text-sm font-medium",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Notre recommandation: Une approche mixte
                  </p>
                  <p className={clsx(
                    "text-sm mt-1",
                    darkMode ? "text-gray-300" : "text-gray-600"
                  )}>
                    Pour optimiser votre structure de capital et maximiser vos chances de succès, nous recommandons de combiner financement dilutif et non dilutif. Cette approche vous permet de lever des montants importants tout en préservant une part significative du capital pour les fondateurs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundraisingPage;