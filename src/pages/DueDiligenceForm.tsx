import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Check, FileText, ArrowRight, Upload, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import clsx from 'clsx';

type DocumentStatus = {
  id: string;
  name: string;
  description: string;
  submitted: boolean;
  file: File | null;
  canGenerateWithAI: boolean;
  generating: boolean;
};

type CompanyInfoStatus = {
  id: string;
  name: string;
  status: 'complete' | 'incomplete';
};

type FormData = {
  additionalComments: string;
};

const DueDiligenceForm: React.FC = () => {
  const navigate = useNavigate();
  const [autoSaveStatus, setAutoSaveStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  // Document statuses
  const [documents, setDocuments] = useState<DocumentStatus[]>([
    {
      id: 'business-plan',
      name: 'Business Plan',
      description: 'Document détaillant votre stratégie et modèle économique',
      submitted: false,
      file: null,
      canGenerateWithAI: true,
      generating: false
    },
    {
      id: 'pitch-deck',
      name: 'Pitch Deck',
      description: 'Présentation concise de votre projet pour les investisseurs',
      submitted: false,
      file: null,
      canGenerateWithAI: true,
      generating: false
    },
    {
      id: 'financial-docs',
      name: 'Documents financiers',
      description: 'Bilan, projections financières, etc.',
      submitted: false,
      file: null,
      canGenerateWithAI: true,
      generating: false
    },
    {
      id: 'cap-table',
      name: 'Cap Table',
      description: 'Structure de l\'actionnariat de votre entreprise',
      submitted: false,
      file: null,
      canGenerateWithAI: false,
      generating: false
    },
    {
      id: 'key-contracts',
      name: 'Contrats clés',
      description: 'Contrats avec clients, fournisseurs, partenaires, etc.',
      submitted: false,
      file: null,
      canGenerateWithAI: false,
      generating: false
    }
  ]);
  
  // Company information status
  const [companyInfo, setCompanyInfo] = useState<CompanyInfoStatus[]>([
    {
      id: 'company-name',
      name: 'Nom de l\'entreprise',
      status: 'complete'
    },
    {
      id: 'legal-form',
      name: 'Forme juridique',
      status: 'complete'
    },
    {
      id: 'creation-date',
      name: 'Date de création',
      status: 'complete'
    },
    {
      id: 'company-address',
      name: 'Adresse du siège social',
      status: 'incomplete'
    },
    {
      id: 'registration-number',
      name: 'Numéro d\'immatriculation',
      status: 'incomplete'
    }
  ]);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      additionalComments: '',
    }
  });
  
  // Calculate progress
  useEffect(() => {
    const submittedDocs = documents.filter(doc => doc.submitted).length;
    const totalDocs = documents.length;
    
    const completeInfo = companyInfo.filter(info => info.status === 'complete').length;
    const totalInfo = companyInfo.length;
    
    const docsWeight = 0.7; // 70% of progress
    const infoWeight = 0.3; // 30% of progress
    
    const docsProgress = (submittedDocs / totalDocs) * docsWeight;
    const infoProgress = (completeInfo / totalInfo) * infoWeight;
    
    const totalProgress = Math.round((docsProgress + infoProgress) * 100);
    setProgress(totalProgress);
  }, [documents, companyInfo]);
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      setDocuments(prev => prev.map(doc => 
        doc.id === docId ? { ...doc, file, submitted: true } : doc
      ));
      
      // Show auto-save status
      setAutoSaveStatus('Document sauvegardé');
      setTimeout(() => {
        setAutoSaveStatus(null);
      }, 2000);
    }
  };
  
  // Handle AI generation
  const handleGenerateWithAI = (docId: string) => {
    // Set the document as generating
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, generating: true } : doc
    ));
    
    // Simulate AI generation (in a real app, this would call an API)
    setTimeout(() => {
      // Create a mock file object
      const mockFile = new File([""], `${docId}-generated.pdf`, { type: "application/pdf" });
      
      // Update the document status
      setDocuments(prev => prev.map(doc => 
        doc.id === docId ? { 
          ...doc, 
          file: mockFile, 
          submitted: true, 
          generating: false 
        } : doc
      ));
      
      // Show auto-save status
      setAutoSaveStatus('Document généré avec succès');
      setTimeout(() => {
        setAutoSaveStatus(null);
      }, 2000);
    }, 2000);
  };
  
  const onSubmit = (data: FormData) => {
    console.log(data);
    // In a real app, you would save this data to your state management or API
    navigate('/onboarding/finalisation');
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Due Diligence</h1>
      <p className="text-gray-600 mb-8">
        Vérifiez votre dossier avant de le soumettre aux investisseurs. Les documents peuvent être générés avec l'IA, 
        mais leur soumission est optionnelle. Vous pourrez compléter votre dossier ultérieurement depuis votre tableau de bord.
      </p>
      
      {autoSaveStatus && (
        <div className="fixed top-4 right-4 bg-secondary-light text-primary px-4 py-2 rounded-xl text-sm font-medium transition-opacity duration-300">
          {autoSaveStatus}
        </div>
      )}
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Progression de votre dossier</h2>
          <span className={clsx(
            "text-sm font-medium",
            progress === 100 ? "text-green-600" : "text-primary"
          )}>
            {progress}% complété
          </span>
        </div>
        
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={clsx(
              "h-full transition-all duration-500 ease-out",
              progress === 100 ? "bg-green-500" : "bg-secondary-lighter"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {progress < 100 && (
          <div className="mt-2 text-sm text-amber-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>Certains éléments sont manquants ou incomplets (optionnel)</span>
          </div>
        )}
        
        {progress === 100 && (
          <div className="mt-2 text-sm text-green-600 flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            <span>Votre dossier est complet et prêt à être soumis</span>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-10">
          {/* Documents à vérifier */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Documents à vérifier (optionnels)</h2>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div 
                  key={doc.id} 
                  className={clsx(
                    "p-4 rounded-xl border-2 transition-colors",
                    doc.submitted 
                      ? "border-green-200 bg-green-50" 
                      : "border-gray-200 hover:border-secondary-lighter"
                  )}
                >
                  <div className="flex items-start">
                    <div className={clsx(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4",
                      doc.submitted ? "bg-green-100" : "bg-gray-100"
                    )}>
                      <FileText className={clsx(
                        "h-5 w-5",
                        doc.submitted ? "text-green-600" : "text-gray-400"
                      )} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{doc.name}</h3>
                        <span className={clsx(
                          "text-xs px-2 py-1 rounded-full",
                          doc.submitted 
                            ? "bg-green-100 text-green-600" 
                            : "bg-amber-100 text-amber-600"
                        )}>
                          {doc.submitted ? 'Soumis' : 'Optionnel'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                      
                      {doc.file && (
                        <div className="mt-2 text-sm text-gray-600 flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          <span>{doc.file.name}</span>
                          <span className="ml-2 text-xs text-gray-500">
                            ({(doc.file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-3">
                    {doc.canGenerateWithAI && (
                      <button
                        type="button"
                        onClick={() => handleGenerateWithAI(doc.id)}
                        disabled={doc.generating}
                        className={clsx(
                          "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                          doc.generating
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-secondary-light text-primary hover:bg-opacity-80"
                        )}
                      >
                        {doc.generating ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                            Génération...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Générer via IA
                          </>
                        )}
                      </button>
                    )}
                    
                    <label className={clsx(
                      "flex items-center cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      doc.submitted 
                        ? "bg-green-100 text-green-600 hover:bg-green-200" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.xlsx,.pptx"
                        onChange={(e) => handleFileUpload(e, doc.id)}
                      />
                      <Upload className="h-4 w-4 mr-2" />
                      {doc.submitted ? 'Remplacer' : 'Télécharger'}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Informations de l'entreprise */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Informations de l'entreprise</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companyInfo.map((info) => (
                  <div key={info.id} className="flex items-center">
                    <div className={clsx(
                      "w-5 h-5 rounded-full flex items-center justify-center mr-3",
                      info.status === 'complete' ? "bg-green-500" : "bg-amber-500"
                    )}>
                      {info.status === 'complete' ? (
                        <Check className="h-3 w-3 text-white" />
                      ) : (
                        <span className="text-white text-xs">!</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{info.name}</p>
                      <p className="text-xs text-gray-500">
                        {info.status === 'complete' ? 'Information complète' : 'À compléter (optionnel)'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/onboarding/entreprise')}
                  className="text-primary hover:text-opacity-80 text-sm font-medium flex items-center"
                >
                  Modifier les informations
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Commentaires additionnels */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Commentaires additionnels</h2>
            <textarea
              rows={4}
              className="input-field resize-none"
              placeholder="Ajoutez des informations complémentaires pour les investisseurs..."
              {...register('additionalComments')}
            />
          </div>
          
          <div className="pt-6 border-t border-gray-100 flex justify-between">
            <button 
              type="button"
              onClick={() => navigate('/onboarding/financials')}
              className="btn-secondary"
            >
              Retour
            </button>
            
            <button 
              type="submit" 
              className="btn-primary flex items-center"
            >
              Soumettre le dossier
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            <p>Vous pourrez compléter ou générer les documents manquants depuis votre tableau de bord après la soumission.</p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DueDiligenceForm;