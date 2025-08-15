import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Download, CheckCircle, ArrowRight, Share2, Edit, Mail, Link2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const FinalisationPage: React.FC = () => {
  const navigate = useNavigate();
  const [generatingDossier, setGeneratingDossier] = useState(false);
  const [dossierGenerated, setDossierGenerated] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareEmailError, setShareEmailError] = useState('');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState({
    accuracy: false,
    sharing: false
  });
  
  // Mock data that would come from your state management or API
  const mockData = {
    entrepreneur: {
      name: 'Marie Dupont',
      email: 'marie.dupont@example.com',
      experience: '3-5 ans',
      industry: 'Healthtech'
    },
    company: {
      name: 'MediScan SAS',
      legalStatus: 'SAS',
      foundationDate: '2022-06-15',
      location: 'Paris, France',
      employees: '5-10',
      website: 'https://mediscan-example.com'
    },
    businessPlan: {
      mission: 'Démocratiser l\'accès aux diagnostics médicaux grâce à l\'intelligence artificielle',
      model: 'Abonnement',
      fundingNeeded: '750 000 €',
      competitors: ['MedAI', 'DiagnosticPlus', 'HealthScan']
    },
    financials: {
      revenue: {
        year1: '120 000 €',
        year2: '350 000 €',
        year3: '780 000 €'
      },
      projections: {
        year1: '950 000 €',
        year3: '3 200 000 €',
        year5: '8 500 000 €'
      },
      burnRate: '45 000 € / mois',
      runway: '10 mois'
    },
    documents: [
      'K-BIS.pdf',
      'Bilan_Financier_2023.xlsx',
      'Prévisions_Financières_2024-2028.xlsx',
      'Statuts_MediScan.pdf',
      'Pacte_Actionnaires.pdf'
    ]
  };
  
  const handleGenerateDossier = () => {
    setGeneratingDossier(true);
    
    // Simulate dossier generation
    setTimeout(() => {
      setGeneratingDossier(false);
      setDossierGenerated(true);
    }, 1000);
  };
  
  const handleShareByEmail = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Email validation
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(shareEmail)) {
      setShareEmailError('Adresse email invalide');
      return;
    }
    
    // Clear error and simulate sending
    setShareEmailError('');
    alert(`Dossier partagé avec ${shareEmail}`);
    setShareEmail('');
  };
  
  const handleCopyLink = () => {
    // In a real app, this would be a unique link to the dossier
    navigator.clipboard.writeText('https://fundai.com/dossier/mediscan-123456');
    setLinkCopied(true);
    
    setTimeout(() => {
      setLinkCopied(false);
    }, 3000);
  };
  
  const handleEditSection = (section: string) => {
    switch (section) {
      case 'entrepreneur':
        navigate('/onboarding/entrepreneur');
        break;
      case 'company':
        navigate('/onboarding/entreprise');
        break;
      case 'businessPlan':
        navigate('/onboarding/business-plan');
        break;
      case 'financials':
        navigate('/onboarding/financials');
        break;
      case 'dueDiligence':
        navigate('/onboarding/due-diligence');
        break;
      default:
        break;
    }
  };
  
  const handleAcceptTermsChange = (term: 'accuracy' | 'sharing') => {
    setAcceptTerms(prev => ({
      ...prev,
      [term]: !prev[term]
    }));
  };
  
  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Finalisation de votre Dossier d'Investissement</h1>
      <p className="text-gray-600 mb-8">
        Vérifiez les informations collectées et générez votre dossier d'investissement professionnel.
      </p>
      
      <div className="space-y-8">
        {/* Récapitulatif des informations */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Récapitulatif des informations</h2>
          
          <div className="space-y-4">
            {/* Entrepreneur */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-primary">Profil Entrepreneur</h3>
                <button 
                  onClick={() => handleEditSection('entrepreneur')}
                  className="text-primary hover:text-opacity-70 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nom</p>
                  <p className="font-medium">{mockData.entrepreneur.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{mockData.entrepreneur.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expérience</p>
                  <p className="font-medium">{mockData.entrepreneur.experience}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Secteur</p>
                  <p className="font-medium">{mockData.entrepreneur.industry}</p>
                </div>
              </div>
            </div>
            
            {/* Entreprise */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-primary">Profil Entreprise</h3>
                <button 
                  onClick={() => handleEditSection('company')}
                  className="text-primary hover:text-opacity-70 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nom</p>
                  <p className="font-medium">{mockData.company.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut juridique</p>
                  <p className="font-medium">{mockData.company.legalStatus}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date de création</p>
                  <p className="font-medium">{new Date(mockData.company.foundationDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Localisation</p>
                  <p className="font-medium">{mockData.company.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Employés</p>
                  <p className="font-medium">{mockData.company.employees}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Site web</p>
                  <p className="font-medium">{mockData.company.website}</p>
                </div>
              </div>
            </div>
            
            {/* Business Plan */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-primary">Business Plan</h3>
                <button 
                  onClick={() => handleEditSection('businessPlan')}
                  className="text-primary hover:text-opacity-70 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Mission</p>
                  <p className="font-medium">{mockData.businessPlan.mission}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Modèle économique</p>
                    <p className="font-medium">{mockData.businessPlan.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Financement recherché</p>
                    <p className="font-medium">{mockData.businessPlan.fundingNeeded}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Concurrents principaux</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {mockData.businessPlan.competitors.map((competitor, index) => (
                      <span key={index} className="bg-secondary-light px-3 py-1 rounded-full text-sm">
                        {competitor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Données Financières */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-primary">Données Financières</h3>
                <button 
                  onClick={() => handleEditSection('financials')}
                  className="text-primary hover:text-opacity-70 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Chiffre d'affaires historique</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Année 1</p>
                      <p className="font-medium">{mockData.financials.revenue.year1}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Année 2</p>
                      <p className="font-medium">{mockData.financials.revenue.year2}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Année 3</p>
                      <p className="font-medium">{mockData.financials.revenue.year3}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Projections financières</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Année 1</p>
                      <p className="font-medium">{mockData.financials.projections.year1}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Année 3</p>
                      <p className="font-medium">{mockData.financials.projections.year3}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Année 5</p>
                      <p className="font-medium">{mockData.financials.projections.year5}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Burn Rate mensuel</p>
                    <p className="font-medium">{mockData.financials.burnRate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Runway</p>
                    <p className="font-medium">{mockData.financials.runway}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Documents Due Diligence */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-primary">Documents Due Diligence</h3>
                <button 
                  onClick={() => handleEditSection('dueDiligence')}
                  className="text-primary hover:text-opacity-70 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {mockData.documents.map((doc, index) => (
                  <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <FileText className="h-4 w-4 text-gray-500 mr-2" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Vérification & Confirmation */}
        <div className="bg-secondary-light bg-opacity-30 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Vérification & Confirmation</h2>
          
          <div className="space-y-4">
            <button 
              className="flex items-start cursor-pointer p-2 hover:bg-secondary-light hover:bg-opacity-50 rounded-lg transition-colors w-full text-left"
              onClick={() => handleAcceptTermsChange('accuracy')}
            >
              <div className="flex items-center mr-3 mt-1">
                <div className={clsx(
                  'w-5 h-5 rounded border flex items-center justify-center',
                  acceptTerms.accuracy
                    ? 'border-secondary-lighter bg-secondary-light' 
                    : 'border-gray-300'
                )}>
                  {acceptTerms.accuracy && (
                    <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <span className="font-medium">Je certifie que les informations fournies sont exactes et à jour.</span>
                <p className="text-sm text-gray-600 mt-1">
                  Toutes les informations présentées dans ce dossier sont véridiques et reflètent fidèlement la situation actuelle de mon entreprise.
                </p>
              </div>
            </button>
            
            <button 
              className="flex items-start cursor-pointer p-2 hover:bg-secondary-light hover:bg-opacity-50 rounded-lg transition-colors w-full text-left"
              onClick={() => handleAcceptTermsChange('sharing')}
            >
              <div className="flex items-center mr-3 mt-1">
                <div className={clsx(
                  'w-5 h-5 rounded border flex items-center justify-center',
                  acceptTerms.sharing
                    ? 'border-secondary-lighter bg-secondary-light' 
                    : 'border-gray-300'
                )}>
                  {acceptTerms.sharing && (
                    <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <span className="font-medium">J'accepte que mon dossier soit généré et partagé avec des investisseurs.</span>
                <p className="text-sm text-gray-600 mt-1">
                  Je comprends que ce dossier pourra être partagé avec des investisseurs potentiels via la plateforme FundAI.
                </p>
              </div>
            </button>
          </div>
          
          <div className="mt-6">
            <button
              onClick={handleGenerateDossier}
              disabled={generatingDossier}
              className={clsx(
                'btn-primary w-full flex items-center justify-center',
                generatingDossier && 'opacity-60 cursor-not-allowed'
              )}
            >
              {generatingDossier ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Génération en cours...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 mr-2" />
                  Valider & Générer le Dossier
                </>
              )}
            </button>
            
            {(!acceptTerms.accuracy || !acceptTerms.sharing) && (
              <p className="text-red-500 text-sm flex items-center mt-2">
                <AlertCircle className="h-4 w-4 mr-1" />
                Veuillez accepter les conditions ci-dessus pour continuer
              </p>
            )}
          </div>
        </div>
        
        {/* Dossier généré */}
        {dossierGenerated && (
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center text-green-600 font-medium mb-6">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Dossier d'investissement généré avec succès !</span>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl mb-6 flex items-center">
              <FileText className="h-10 w-10 text-primary mr-4" />
              <div>
                <h3 className="font-medium">{mockData.company.name} - Dossier d'Investissement.pdf</h3>
                <p className="text-sm text-gray-500">Généré le {new Date().toLocaleDateString('fr-FR')} - 4.2 MB</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <button className="btn-primary w-full flex items-center justify-center">
                <Download className="h-5 w-5 mr-2" />
                Télécharger le PDF
              </button>
              
              <button 
                className="btn-secondary w-full flex items-center justify-center"
                onClick={() => setShowShareOptions(!showShareOptions)}
              >
                <Share2 className="h-5 w-5 mr-2" />
                Partager le dossier
              </button>
              
              {showShareOptions && (
                <div className="bg-gray-50 p-4 rounded-xl space-y-4 mt-2">
                  <h4 className="font-medium">Options de partage</h4>
                  
                  <form onSubmit={handleShareByEmail} className="space-y-2">
                    <label className="form-label">Envoyer par email</label>
                    <div className="flex">
                      <input
                        type="email"
                        placeholder="email@exemple.com"
                        className={clsx('input-field rounded-r-none flex-1', shareEmailError && 'border-red-500')}
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                      />
                      <button 
                        type="submit"
                        className="bg-primary text-white py-3 px-4 rounded-r-xl font-medium transition-all duration-200 hover:bg-opacity-90"
                      >
                        <Mail className="h-5 w-5" />
                      </button>
                    </div>
                    {shareEmailError && <p className="form-error">{shareEmailError}</p>}
                  </form>
                  
                  <div className="space-y-2">
                    <label className="form-label">Lien de partage</label>
                    <div className="flex">
                      <input
                        type="text"
                        readOnly
                        value="https://fundai.com/dossier/mediscan-123456"
                        className="input-field rounded-r-none flex-1 bg-white"
                      />
                      <button 
                        onClick={handleCopyLink}
                        className="bg-primary text-white py-3 px-4 rounded-r-xl font-medium transition-all duration-200 hover:bg-opacity-90"
                      >
                        <Link2 className="h-5 w-5" />
                      </button>
                    </div>
                    {linkCopied && (
                      <p className="text-green-600 text-sm flex items-center mt-1">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Lien copié dans le presse-papier
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              <button 
                onClick={handleGoToDashboard}
                className="btn-primary w-full flex items-center justify-center bg-green-600 hover:bg-green-700"
              >
                Accéder au tableau de bord
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        )}
        
        {/* Prochaines étapes */}
        {dossierGenerated && (
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Prochaines Étapes</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-secondary-light rounded-full w-6 h-6 flex items-center justify-center text-primary font-medium mr-3">1</div>
                <div>
                  <h3 className="font-medium">Revue et Personnalisation</h3>
                  <p className="text-sm text-gray-600">Passez en revue votre dossier et personnalisez-le selon vos besoins spécifiques.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-secondary-light rounded-full w-6 h-6 flex items-center justify-center text-primary font-medium mr-3">2</div>
                <div>
                  <h3 className="font-medium">Préparation au Pitch</h3>
                  <p className="text-sm text-gray-600">Utilisez les éléments clés de votre dossier pour préparer votre pitch aux investisseurs.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-secondary-light rounded-full w-6 h-6 flex items-center justify-center text-primary font-medium mr-3">3</div>
                <div>
                  <h3 className="font-medium">Mise en Relation</h3>
                  <p className="text-sm text-gray-600">Contactez des investisseurs potentiels et partagez votre dossier avec eux.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <Link to="/" className="btn-primary flex items-center justify-center">
                Retour à l'accueil
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinalisationPage;