import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  CheckCircle2, 
  FileText, 
  Upload, 
  Users, 
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  BarChart3
} from 'lucide-react';
import clsx from 'clsx';

const DashboardWelcome: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: File | null}>({
    businessPlan: null,
    pitchDeck: null
  });
  const [darkMode, setDarkMode] = useState(false);
  
  // Check if dark mode is enabled
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  }, []);
  
  // Mock data for suggested investors
  const suggestedInvestors = [
    {
      id: 1,
      name: 'Venture Capital Partners',
      logo: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=64&h=64&q=80',
      focus: 'Healthtech, SaaS',
      stage: 'Seed, Series A',
      match: 92
    },
    {
      id: 2,
      name: 'Innovation Fund',
      logo: 'https://images.unsplash.com/photo-1567446537708-ac4aa75c9c28?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=64&h=64&q=80',
      focus: 'Medtech, Biotech',
      stage: 'Pre-seed, Seed',
      match: 87
    },
    {
      id: 3,
      name: 'Tech Accelerator',
      logo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=64&h=64&q=80',
      focus: 'AI, Healthcare',
      stage: 'Seed',
      match: 81
    }
  ];
  
  // Mock company data
  const companyData = {
    name: 'MediScan SAS',
    industry: 'Healthtech',
    stage: 'Seed',
    fundingGoal: '750 000 €',
    progress: 15, // percentage
    completedSteps: 7,
    totalSteps: 12
  };
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFiles({
        ...uploadedFiles,
        [fileType]: e.target.files[0]
      });
    }
  };
  
  // Handle next step
  const handleNextStep = () => {
    setLoading(true);
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        // Redirect to main dashboard
        navigate('/dashboard');
      }
    }, 800);
  };
  
  // Handle investor connection
  const handleConnectInvestor = (investorId: number) => {
    // In a real app, this would send a connection request
    console.log(`Connection request sent to investor ${investorId}`);
  };
  
  // Animation for welcome message
  useEffect(() => {
    const timer = setTimeout(() => {
      const welcomeMessage = document.getElementById('welcome-message');
      if (welcomeMessage) {
        welcomeMessage.classList.remove('opacity-0');
        welcomeMessage.classList.add('opacity-100');
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className={clsx(
      "min-h-screen",
      darkMode ? "bg-gray-900" : "bg-gray-50"
    )}>
      {/* Welcome banner */}
      <div className={clsx(
        "bg-gradient-to-r py-12 px-4 sm:px-6 lg:px-8",
        darkMode 
          ? "from-purple-900 to-purple-800" 
          : "from-secondary-light to-secondary-lighter"
      )}>
        <div className="max-w-4xl mx-auto">
          <div id="welcome-message" className="opacity-0 transition-opacity duration-1000 ease-in-out">
            <div className="flex items-center justify-center mb-6">
              <div className={clsx(
                "rounded-full p-3 shadow-md",
                darkMode ? "bg-gray-800" : "bg-white"
              )}>
                <Sparkles className={clsx(
                  "h-8 w-8",
                  darkMode ? "text-purple-400" : "text-primary"
                )} />
              </div>
            </div>
            <h1 className={clsx(
              "text-3xl font-bold text-center mb-4",
              darkMode ? "text-white" : "text-primary"
            )}>
              Félicitations, votre compte est prêt !
            </h1>
            <p className={clsx(
              "text-center text-lg max-w-2xl mx-auto",
              darkMode ? "text-gray-200" : "text-gray-800"
            )}>
              Nous allons vous guider pour maximiser vos chances de succès dans votre levée de fonds.
            </p>
          </div>
        </div>
      </div>
      
      {/* Onboarding steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className={clsx(
              "text-lg font-medium",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Votre guide de démarrage
            </h2>
            <span className={clsx(
              "text-sm",
              darkMode ? "text-gray-400" : "text-gray-500"
            )}>
              Étape {currentStep} sur 3
            </span>
          </div>
          <div className={clsx(
            "h-2 rounded-full overflow-hidden",
            darkMode ? "bg-gray-700" : "bg-gray-200"
          )}>
            <div 
              className={clsx(
                "h-full transition-all duration-500 ease-out",
                darkMode ? "bg-purple-600" : "bg-primary"
              )}
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Step 1: Dashboard Overview */}
        {currentStep === 1 && (
          <div className={clsx(
            "rounded-xl shadow-sm p-6 mb-6",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <div className="flex items-center mb-4">
              <div className={clsx(
                "rounded-full p-2 mr-3",
                darkMode ? "bg-purple-900" : "bg-secondary-light"
              )}>
                <LayoutDashboard className={clsx(
                  "h-5 w-5",
                  darkMode ? "text-purple-400" : "text-primary"
                )} />
              </div>
              <h3 className={clsx(
                "text-xl font-semibold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Présentation du Tableau de Bord
              </h3>
            </div>
            
            <p className={clsx(
              "mb-6",
              darkMode ? "text-gray-300" : "text-gray-600"
            )}>
              Votre tableau de bord est votre centre de contrôle pour suivre et gérer votre levée de fonds. 
              Voici les éléments clés que vous y trouverez.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className={clsx(
                "border rounded-lg p-4",
                darkMode ? "border-gray-700" : "border-gray-200"
              )}>
                <h4 className={clsx(
                  "font-medium mb-2",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Suivi de votre levée
                </h4>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={clsx(
                      darkMode ? "text-gray-400" : "text-gray-600"
                    )}>
                      Objectif: {companyData.fundingGoal}
                    </span>
                    <span className={clsx(
                      "font-medium",
                      darkMode ? "text-purple-400" : "text-primary"
                    )}>
                      {companyData.progress}%
                    </span>
                  </div>
                  <div className={clsx(
                    "h-2 rounded-full overflow-hidden",
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  )}>
                    <div 
                      className={clsx(
                        "h-full",
                        darkMode ? "bg-purple-600" : "bg-primary"
                      )}
                      style={{ width: `${companyData.progress}%` }}
                    />
                  </div>
                </div>
                <p className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Suivez en temps réel l'avancement de votre levée de fonds et les interactions avec les investisseurs.
                </p>
              </div>
              
              <div className={clsx(
                "border rounded-lg p-4",
                darkMode ? "border-gray-700" : "border-gray-200"
              )}>
                <h4 className={clsx(
                  "font-medium mb-2",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Checklist de préparation
                </h4>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={clsx(
                      darkMode ? "text-gray-400" : "text-gray-600"
                    )}>
                      Étapes complétées
                    </span>
                    <span className={clsx(
                      "font-medium",
                      darkMode ? "text-purple-400" : "text-primary"
                    )}>
                      {companyData.completedSteps}/{companyData.totalSteps}
                    </span>
                  </div>
                  <div className={clsx(
                    "h-2 rounded-full overflow-hidden",
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  )}>
                    <div 
                      className={clsx(
                        "h-full",
                        darkMode ? "bg-purple-600" : "bg-primary"
                      )}
                      style={{ width: `${(companyData.completedSteps / companyData.totalSteps) * 100}%` }}
                    />
                  </div>
                </div>
                <p className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Une liste d'actions à réaliser pour optimiser votre dossier et augmenter vos chances de succès.
                </p>
              </div>
            </div>
            
            <div className={clsx(
              "rounded-lg p-4 mb-6",
              darkMode ? "bg-gray-700/50" : "bg-gray-50"
            )}>
              <h4 className={clsx(
                "font-medium mb-2",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Fonctionnalités principales
              </h4>
              <ul className="space-y-3">
                {[
                  'Suivi des interactions avec les investisseurs',
                  'Gestion de vos documents (pitch deck, business plan, etc.)',
                  'Statistiques de votre progression'
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className={clsx(
                      "h-5 w-5 mr-2 flex-shrink-0 mt-0.5",
                      darkMode ? "text-green-400" : "text-green-500"
                    )} />
                    <span className={clsx(
                      darkMode ? "text-gray-300" : "text-gray-600"
                    )}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <button
              onClick={handleNextStep}
              disabled={loading}
              className={clsx(
                "w-full flex items-center justify-center py-3 px-6 rounded-xl font-medium transition-all duration-200",
                darkMode 
                  ? "bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50" 
                  : "bg-primary text-white hover:bg-opacity-90 focus:ring-2 focus:ring-primary focus:ring-opacity-50",
                loading && "opacity-70 cursor-not-allowed"
              )}
            >
              {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  Continuer
                  <ChevronRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        )}
        
        {/* Step 2: Initial Setup */}
        {currentStep === 2 && (
          <div className={clsx(
            "rounded-xl shadow-sm p-6 mb-6",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <div className="flex items-center mb-4">
              <div className={clsx(
                "rounded-full p-2 mr-3",
                darkMode ? "bg-purple-900" : "bg-secondary-light"
              )}>
                <FileText className={clsx(
                  "h-5 w-5",
                  darkMode ? "text-purple-400" : "text-primary"
                )} />
              </div>
              <h3 className={clsx(
                "text-xl font-semibold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Premiers réglages
              </h3>
            </div>
            
            <p className={clsx(
              "mb-6",
              darkMode ? "text-gray-300" : "text-gray-600"
            )}>
              Pour commencer, vérifions que vos informations clés sont correctes et ajoutons vos premiers documents.
            </p>
            
            <div className="mb-6">
              <h4 className={clsx(
                "font-medium mb-3",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Vérification des informations
              </h4>
              <div className={clsx(
                "rounded-lg p-4 mb-4",
                darkMode ? "bg-gray-700/50" : "bg-gray-50"
              )}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className={clsx(
                      "text-sm",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      Nom de l'entreprise
                    </p>
                    <p className={clsx(
                      "font-medium",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      {companyData.name}
                    </p>
                  </div>
                  <div>
                    <p className={clsx(
                      "text-sm",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      Secteur
                    </p>
                    <p className={clsx(
                      "font-medium",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      {companyData.industry}
                    </p>
                  </div>
                  <div>
                    <p className={clsx(
                      "text-sm",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      Stade
                    </p>
                    <p className={clsx(
                      "font-medium",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      {companyData.stage}
                    </p>
                  </div>
                  <div>
                    <p className={clsx(
                      "text-sm",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      Objectif de levée
                    </p>
                    <p className={clsx(
                      "font-medium",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      {companyData.fundingGoal}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-right">
                  <button className={clsx(
                    "text-sm font-medium hover:underline",
                    darkMode ? "text-purple-400" : "text-primary"
                  )}>
                    Modifier ces informations
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h4 className={clsx(
                "font-medium mb-3",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Ajout de documents essentiels
              </h4>
              <p className={clsx(
                "text-sm mb-4",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}>
                Ces documents seront partagés avec les investisseurs potentiels. Assurez-vous qu'ils sont à jour et présentent votre projet sous son meilleur jour.
              </p>
              
              <div className="space-y-4">
                <div className={clsx(
                  "border-2 border-dashed rounded-xl p-4 transition-colors",
                  uploadedFiles.businessPlan 
                    ? darkMode 
                      ? "border-green-500/30 bg-green-500/10" 
                      : "border-green-200 bg-green-50" 
                    : darkMode 
                      ? "border-gray-700 hover:border-purple-500/50" 
                      : "border-gray-200 hover:border-secondary-lighter"
                )}>
                  <label className="flex flex-col items-center cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.xlsx"
                      onChange={(e) => handleFileUpload(e, 'businessPlan')}
                    />
                    
                    {uploadedFiles.businessPlan ? (
                      <div className={clsx(
                        "flex items-center",
                        darkMode ? "text-green-400" : "text-green-600"
                      )}>
                        <FileText className="h-5 w-5 mr-2" />
                        <span className="font-medium">{uploadedFiles.businessPlan.name}</span>
                        <span className={clsx(
                          "ml-2 text-sm",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          ({(uploadedFiles.businessPlan.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    ) : (
                      <div className={clsx(
                        "flex flex-col items-center",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        <Upload className="h-8 w-8 mb-2" />
                        <span className="font-medium">Business Plan</span>
                        <span className="text-sm mt-1">Cliquez pour uploader (PDF, DOCX, XLSX)</span>
                      </div>
                    )}
                  </label>
                </div>
                
                <div className={clsx(
                  "border-2 border-dashed rounded-xl p-4 transition-colors",
                  uploadedFiles.pitchDeck 
                    ? darkMode 
                      ? "border-green-500/30 bg-green-500/10" 
                      : "border-green-200 bg-green-50" 
                    : darkMode 
                      ? "border-gray-700 hover:border-purple-500/50" 
                      : "border-gray-200 hover:border-secondary-lighter"
                )}>
                  <label className="flex flex-col items-center cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.pptx"
                      onChange={(e) => handleFileUpload(e, 'pitchDeck')}
                    />
                    
                    {uploadedFiles.pitchDeck ? (
                      <div className={clsx(
                        "flex items-center",
                        darkMode ? "text-green-400" : "text-green-600"
                      )}>
                        <FileText className="h-5 w-5 mr-2" />
                        <span className="font-medium">{uploadedFiles.pitchDeck.name}</span>
                        <span className={clsx(
                          "ml-2 text-sm",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          ({(uploadedFiles.pitchDeck.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    ) : (
                      <div className={clsx(
                        "flex flex-col items-center",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        <Upload className="h-8 w-8 mb-2" />
                        <span className="font-medium">Pitch Deck</span>
                        <span className="text-sm mt-1">Cliquez pour uploader (PDF, PPTX)</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleNextStep}
              disabled={loading}
              className={clsx(
                "w-full flex items-center justify-center py-3 px-6 rounded-xl font-medium transition-all duration-200",
                darkMode 
                  ? "bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50" 
                  : "bg-primary text-white hover:bg-opacity-90 focus:ring-2 focus:ring-primary focus:ring-opacity-50",
                loading && "opacity-70 cursor-not-allowed"
              )}
            >
              {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  Continuer
                  <ChevronRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        )}
        
        {/* Step 3: Connect with Investors */}
        {currentStep === 3 && (
          <div className={clsx(
            "rounded-xl shadow-sm p-6 mb-6",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <div className="flex items-center mb-4">
              <div className={clsx(
                "rounded-full p-2 mr-3",
                darkMode ? "bg-purple-900" : "bg-secondary-light"
              )}>
                <Users className={clsx(
                  "h-5 w-5",
                  darkMode ? "text-purple-400" : "text-primary"
                )} />
              </div>
              <h3 className={clsx(
                "text-xl font-semibold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Connecter avec des investisseurs
              </h3>
            </div>
            
            <p className={clsx(
              "mb-6",
              darkMode ? "text-gray-300" : "text-gray-600"
            )}>
              Voici une sélection d'investisseurs qui correspondent à votre profil et à votre secteur d'activité. Vous pouvez les contacter directement depuis la plateforme.
            </p>
            
            <div className="space-y-4 mb-8">
              {suggestedInvestors.map((investor) => (
                <div 
                  key={investor.id}
                  className={clsx(
                    "p-4 rounded-lg",
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  )}
                >
                  <div className="flex items-center mb-3">
                    <img 
                      src={investor.logo} 
                      alt={investor.name} 
                      className="h-12 w-12 rounded-full object-cover mr-3"
                    />
                    <div>
                      <h4 className={clsx(
                        "font-medium",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        {investor.name}
                      </h4>
                      <div className="flex flex-col sm:flex-row sm:items-center mt-1">
                        <p className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          {investor.focus}
                        </p>
                        <span className={clsx(
                          "hidden sm:inline mx-2",
                          darkMode ? "text-gray-500" : "text-gray-400"
                        )}>•</span>
                        <p className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          {investor.stage}
                        </p>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <div className={clsx(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        darkMode ? "bg-[#D3EFDD]text-purple-300" : "bg-secondary-light text-primary"
                      )}>
                        Match {investor.match}%
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleConnectInvestor(investor.id)}
                    className={clsx(
                      "w-full py-2 text-sm font-medium rounded-lg flex items-center justify-center",
                      darkMode 
                        ? "bg-purple-600 text-white hover:bg-purple-700" 
                        : "bg-primary text-white hover:bg-opacity-90"
                    )}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Envoyer une introduction
                  </button>
                </div>
              ))}
            </div>
            
            <div className={clsx(
              "rounded-lg p-4 mb-6 flex items-start",
              darkMode ? "bg-purple-900/20 border border-purple-800/30" : "bg-secondary-light bg-opacity-30"
            )}>
              <div className={clsx(
                "p-2 rounded-full mr-3 flex-shrink-0",
                darkMode ? "bg-purple-900/50" : "bg-white"
              )}>
                <BarChart3 className={clsx(
                  "h-5 w-5",
                  darkMode ? "text-purple-300" : "text-primary"
                )} />
              </div>
              <div>
                <h4 className={clsx(
                  "font-medium",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Optimisez votre profil
                </h4>
                <p className={clsx(
                  "text-sm mt-1",
                  darkMode ? "text-gray-300" : "text-gray-600"
                )}>
                  Plus votre profil est complet, plus vous avez de chances d'attirer l'attention des investisseurs. Complétez toutes les sections pour maximiser votre visibilité.
                </p>
              </div>
            </div>
            
            <button
              onClick={handleNextStep}
              disabled={loading}
              className={clsx(
                "w-full flex items-center justify-center py-3 px-6 rounded-xl font-medium transition-all duration-200",
                darkMode 
                  ? "bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50" 
                  : "bg-primary text-white hover:bg-opacity-90 focus:ring-2 focus:ring-primary focus:ring-opacity-50",
                loading && "opacity-70 cursor-not-allowed"
              )}
            >
              {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  Accéder au tableau de bord
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardWelcome;