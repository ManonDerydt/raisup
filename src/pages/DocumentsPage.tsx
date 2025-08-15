import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Upload, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Palette, 
  Image, 
  Type, 
  Loader, 
  RefreshCw,
  PlusCircle,
  Trash2,
  Edit3
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import clsx from 'clsx';
import {Link} from "react-router-dom";

type DocumentType = 'pitch-deck' | 'business-plan' | 'financial-report';
type DocumentStatus = 'not-started' | 'generating' | 'completed' | 'failed';
type ColorScheme = {
  primary: string;
  secondary: string;
  accent: string;
};

interface DocumentInfo {
  type: DocumentType;
  name: string;
  description: string;
  status: DocumentStatus;
  lastUpdated?: Date;
  downloadUrl?: string;
  previewUrl?: string;
  pageCount?: number;
}

interface BrandingInfo {
  logo: File | null;
  logoPreview: string | null;
  colors: ColorScheme;
  fonts: {
    heading: string;
    body: string;
  };
  customElements: Array<{
    id: string;
    type: 'image' | 'text';
    content: string;
    description: string;
  }>;
}

const DocumentsPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('documents');
  const [documents, setDocuments] = useState<DocumentInfo[]>([
    {
      type: 'pitch-deck',
      name: 'Pitch Deck',
      description: 'Présentation concise de votre projet pour les investisseurs',
      status: 'not-started'
    },
    {
      type: 'business-plan',
      name: 'Business Plan',
      description: 'Document détaillé de votre stratégie et modèle économique',
      status: 'not-started'
    },
    {
      type: 'financial-report',
      name: 'Rapport Financier',
      description: 'Analyse financière et projections pour les investisseurs',
      status: 'not-started'
    }
  ]);
  
  const [branding, setBranding] = useState<BrandingInfo>({
    logo: null,
    logoPreview: null,
    colors: {
      primary: '#1d1d1b',
      secondary: '#EFE9FF',
      accent: '#d3d3ff'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    customElements: []
  });
  
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [showGenerationForm, setShowGenerationForm] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  // Available fonts
  const availableFonts = [
    { name: 'Inter', value: 'Inter' },
    { name: 'Roboto', value: 'Roboto' },
    { name: 'Montserrat', value: 'Montserrat' },
    { name: 'Playfair Display', value: 'Playfair Display' },
    { name: 'Open Sans', value: 'Open Sans' },
    { name: 'Lato', value: 'Lato' },
    { name: 'Poppins', value: 'Poppins' }
  ];
  
  // Check if dark mode is enabled
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  }, []);
  
  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setBranding({
            ...branding,
            logo: file,
            logoPreview: event.target.result as string
          });
        }
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Handle color change
  const handleColorChange = (colorType: keyof ColorScheme, value: string) => {
    setBranding({
      ...branding,
      colors: {
        ...branding.colors,
        [colorType]: value
      }
    });
  };
  
  // Handle font change
  const handleFontChange = (fontType: 'heading' | 'body', value: string) => {
    setBranding({
      ...branding,
      fonts: {
        ...branding.fonts,
        [fontType]: value
      }
    });
  };
  
  // Add custom element
  const addCustomElement = (type: 'image' | 'text') => {
    const newElement = {
      id: `element-${Date.now()}`,
      type,
      content: '',
      description: type === 'image' ? 'Image personnalisée' : 'Texte personnalisé'
    };
    
    setBranding({
      ...branding,
      customElements: [...branding.customElements, newElement]
    });
  };
  
  // Remove custom element
  const removeCustomElement = (id: string) => {
    setBranding({
      ...branding,
      customElements: branding.customElements.filter(element => element.id !== id)
    });
  };
  
  // Update custom element
  const updateCustomElement = (id: string, field: 'content' | 'description', value: string) => {
    setBranding({
      ...branding,
      customElements: branding.customElements.map(element => 
        element.id === id ? { ...element, [field]: value } : element
      )
    });
  };
  
  // Start document generation
  const startDocumentGeneration = (type: DocumentType) => {
    setSelectedDocument(type);
    setShowGenerationForm(true);
    
    // Pre-fill the generation prompt based on document type
    let prompt = '';
    switch (type) {
      case 'pitch-deck':
        prompt = 'Créer un pitch deck pour ma startup de technologie médicale qui développe des solutions de diagnostic assistées par IA.';
        break;
      case 'business-plan':
        prompt = 'Générer un business plan détaillé pour ma startup de technologie médicale avec une analyse de marché et des projections financières.';
        break;
      case 'financial-report':
        prompt = 'Préparer un rapport financier pour ma startup de technologie médicale incluant des projections sur 5 ans et une analyse de rentabilité.';
        break;
    }
    
    setGenerationPrompt(prompt);
  };
  
  // Generate document
  const generateDocument = () => {
    if (!selectedDocument) return;
    
    // Update document status
    setDocuments(docs => docs.map(doc => 
      doc.type === selectedDocument 
        ? { ...doc, status: 'generating' as DocumentStatus } 
        : doc
    ));
    
    setShowGenerationForm(false);
    
    // Simulate document generation progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 100) {
        progress = 100;
        clearInterval(interval);
        
        // Update document status to completed
        setTimeout(() => {
          setDocuments(docs => docs.map(doc => 
            doc.type === selectedDocument 
              ? { 
                  ...doc, 
                  status: 'completed' as DocumentStatus,
                  lastUpdated: new Date(),
                  downloadUrl: '#',
                  previewUrl: '#',
                  pageCount: doc.type === 'pitch-deck' ? 12 : doc.type === 'business-plan' ? 25 : 15
                } 
              : doc
          ));
          setGenerationProgress(0);
        }, 500);
      }
      setGenerationProgress(progress);
    }, 800);
  };
  
  // Get document status icon
  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'not-started':
        return <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500" />;
      case 'generating':
        return <Loader className="h-5 w-5 text-amber-500 dark:text-amber-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />;
    }
  };
  
  // Get document status text
  const getStatusText = (status: DocumentStatus) => {
    switch (status) {
      case 'not-started':
        return 'Non généré';
      case 'generating':
        return 'Génération en cours...';
      case 'completed':
        return 'Généré';
      case 'failed':
        return 'Échec de la génération';
    }
  };
  
  // Format date
  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
              Documents
            </h1>
            <p className={clsx(
              "mt-1",
              darkMode ? "text-gray-400" : "text-gray-500"
            )}>
              Générez et gérez vos documents pour la levée de fonds
            </p>
          </div>
        </div>
        
        <div className={clsx(
          "rounded-xl shadow-sm overflow-hidden",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className={clsx(
                "grid w-full grid-cols-2 mb-8",
                darkMode ? "bg-gray-700" : "bg-gray-100"
              )}>
                <TabsTrigger 
                  value="documents" 
                  className={clsx(
                    "flex items-center justify-center py-3",
                    darkMode ? "data-[state=active]:bg-gray-800 data-[state=active]:text-purple-400" : "data-[state=active]:bg-white data-[state=active]:text-primary"
                  )}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Documents
                </TabsTrigger>
                <TabsTrigger 
                  value="branding" 
                  className={clsx(
                    "flex items-center justify-center py-3",
                    darkMode ? "data-[state=active]:bg-gray-800 data-[state=active]:text-purple-400" : "data-[state=active]:bg-white data-[state=active]:text-primary"
                  )}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Charte Graphique
                </TabsTrigger>
              </TabsList>
              
              {/* Documents Tab */}
              <TabsContent value="documents">
                <div className="space-y-6">
                  {/* Document Generation Form */}
                  {showGenerationForm && selectedDocument && (
                    <div className={clsx(
                      "p-6 rounded-xl mb-6 border-2 border-dashed",
                      darkMode 
                        ? "bg-gray-700/50 border-gray-600" 
                        : "bg-gray-50 border-gray-200"
                    )}>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className={clsx(
                          "text-lg font-medium flex items-center",
                          darkMode ? "text-white" : "text-gray-900"
                        )}>
                          <Sparkles className={clsx(
                            "h-5 w-5 mr-2",
                            darkMode ? "text-purple-400" : "text-primary"
                          )} />
                          Générer {documents.find(d => d.type === selectedDocument)?.name}
                        </h3>
                        {/* Save Branding */}
                        <button
                          onClick={() => setShowGenerationForm(false)}
                          className={clsx(
                            "text-sm",
                            darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
                          )}
                        >
                          Annuler
                        </button>
                      </div>
                      
                      <div className="mb-4">
                        <label className={clsx(
                          "block text-sm font-medium mb-2",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          Instructions pour l'IA
                        </label>
                        <textarea
                          value={generationPrompt}
                          onChange={(e) => setGenerationPrompt(e.target.value)}
                          rows={4}
                          className={clsx(
                            "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200 resize-none",
                            darkMode 
                              ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500/30 focus:border-purple-500" 
                              : "bg-white border-gray-200 text-gray-900 focus:ring-primary/20 focus:border-primary"
                          )}
                          placeholder="Décrivez votre projet, votre marché cible, vos objectifs..."
                        />
                        <p className={clsx(
                          "text-xs mt-2",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Plus vos instructions sont détaillées, meilleur sera le résultat. Incluez des informations sur votre produit, marché, modèle économique, etc.
                        </p>
                      </div>
                      
                      <div className={clsx(
                        "p-4 rounded-lg mb-4",
                        darkMode ? "bg-purple-900/20 border border-purple-800/30" : "bg-secondary-light/30"
                      )}>
                        <h4 className={clsx(
                          "text-sm font-medium mb-2 flex items-center",
                          darkMode ? "text-purple-300" : "text-primary"
                        )}>
                          <Info className="h-4 w-4 mr-2" />
                          Personnalisation
                        </h4>
                        <p className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          Le document généré utilisera automatiquement votre charte graphique (logo, couleurs, polices) si vous l'avez configurée dans l'onglet "Charte Graphique".
                        </p>
                      </div>
                      
                      <div className="flex justify-end">
                        <Link to="/dashboard/documents/generate_deck">
                          <button
                              onClick={generateDocument}
                              disabled={!generationPrompt.trim()}
                              className={clsx(
                                  "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                  !generationPrompt.trim()
                                      ? darkMode
                                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : darkMode
                                          ? "bg-purple-600 text-white hover:bg-purple-700"
                                          : "bg-primary text-white hover:bg-opacity-90"
                              )}
                          >
                            <Sparkles className="h-4 w-4 mr-2"/>
                            Générer avec l'IA
                          </button>
                        </Link>

                      </div>
                    </div>
                  )}

                  {/* Document Generation Progress */}
                  {generationProgress > 0 && generationProgress < 100 && (
                      <div className={clsx(
                          "p-6 rounded-xl mb-6",
                          darkMode ? "bg-gray-700" : "bg-gray-50"
                      )}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={clsx(
                              "text-sm font-medium flex items-center",
                              darkMode ? "text-white" : "text-gray-900"
                          )}>
                            <Sparkles className={clsx(
                                "h-4 w-4 mr-2",
                                darkMode ? "text-purple-400" : "text-primary"
                            )}/>
                            Génération en cours...
                        </h3>
                        <span className={clsx(
                          "text-sm font-medium",
                          darkMode ? "text-purple-400" : "text-primary"
                        )}>
                          {Math.round(generationProgress)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div 
                          className={clsx(
                            "h-full transition-all duration-300",
                            darkMode ? "bg-purple-600" : "bg-primary"
                          )}
                          style={{ width: `${generationProgress}%` }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Veuillez patienter pendant que nous générons votre document...
                      </div>
                    </div>
                  )}
                  
                  {/* Documents List */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {documents.map((doc) => (
                      <div 
                        key={doc.type}
                        className={clsx(
                          "border rounded-xl overflow-hidden transition-all duration-200",
                          darkMode 
                            ? "border-gray-700 hover:border-purple-800/50" 
                            : "border-gray-200 hover:border-primary/30",
                          doc.status === 'completed' && (
                            darkMode 
                              ? "bg-green-900/10 border-green-800/30" 
                              : "bg-green-50 border-green-200/50"
                          )
                        )}
                      >
                        <div className={clsx(
                          "p-4 border-b",
                          darkMode ? "border-gray-700" : "border-gray-200"
                        )}>
                          <div className="flex justify-between items-start">
                            <h3 className={clsx(
                              "font-medium",
                              darkMode ? "text-white" : "text-gray-900"
                            )}>
                              {doc.name}
                            </h3>
                            <div className="flex items-center">
                              {getStatusIcon(doc.status)}
                              <span className={clsx(
                                "text-xs ml-2",
                                doc.status === 'not-started' 
                                  ? darkMode ? "text-gray-400" : "text-gray-500"
                                  : doc.status === 'generating'
                                    ? darkMode ? "text-amber-400" : "text-amber-500"
                                    : doc.status === 'completed'
                                      ? darkMode ? "text-green-400" : "text-green-500"
                                      : darkMode ? "text-red-400" : "text-red-500"
                              )}>
                                {getStatusText(doc.status)}
                              </span>
                            </div>
                          </div>
                          <p className={clsx(
                            "text-sm mt-1",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            {doc.description}
                          </p>
                          {doc.lastUpdated && (
                            <p className={clsx(
                              "text-xs mt-2",
                              darkMode ? "text-gray-500" : "text-gray-400"
                            )}>
                              Dernière mise à jour: {formatDate(doc.lastUpdated)}
                            </p>
                          )}
                        </div>
                        
                        <div className="p-4">
                          {doc.status === 'completed' ? (
                            <div className="space-y-3">
                              <div className={clsx(
                                "p-3 rounded-lg",
                                darkMode ? "bg-gray-700" : "bg-gray-50"
                              )}>
                                <div className="flex justify-between items-center text-sm">
                                  <span className={clsx(
                                    darkMode ? "text-gray-300" : "text-gray-700"
                                  )}>
                                    {doc.pageCount} pages
                                  </span>
                                  <a 
                                    href={doc.previewUrl} 
                                    className={clsx(
                                      "font-medium",
                                      darkMode ? "text-purple-400 hover:text-purple-300" : "text-primary hover:text-opacity-80"
                                    )}
                                  >
                                    Aperçu
                                  </a>
                                </div>
                              </div>
                              
                              <div className="flex space-x-2">
                                <a 
                                  href={doc.downloadUrl}
                                  className={clsx(
                                    "flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                    darkMode 
                                      ? "bg-purple-600 text-white hover:bg-purple-700" 
                                      : "bg-primary text-white hover:bg-opacity-90"
                                  )}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Télécharger
                                </a>
                                <button
                                  onClick={() => startDocumentGeneration(doc.type)}
                                  className={clsx(
                                    "flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                    darkMode 
                                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  )}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ) : doc.status === 'generating' ? (
                            <div className="flex items-center justify-center py-2">
                              <Loader className="h-5 w-5 text-amber-500 dark:text-amber-400 animate-spin mr-2" />
                              <span className={clsx(
                                "text-sm",
                                darkMode ? "text-gray-300" : "text-gray-700"
                              )}>
                                Génération en cours...
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => startDocumentGeneration(doc.type)}
                              className={clsx(
                                "w-full flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                darkMode 
                                  ? "bg-purple-600 text-white hover:bg-purple-700" 
                                  : "bg-primary text-white hover:bg-opacity-90"
                              )}
                            >
                              <Sparkles className="h-4 w-4 mr-2" />
                              Générer avec l'IA
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Tips */}
                  <div className={clsx(
                    "mt-8 p-4 rounded-lg",
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  )}>
                    <h3 className={clsx(
                      "text-sm font-medium mb-2",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Conseils pour des documents efficaces
                    </h3>
                    <ul className={clsx(
                      "text-xs space-y-1 list-disc pl-4",
                      darkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      <li>Personnalisez votre charte graphique pour une identité visuelle cohérente</li>
                      <li>Fournissez des instructions détaillées à l'IA pour des résultats plus pertinents</li>
                      <li>Vérifiez et modifiez les documents générés avant de les partager</li>
                      <li>Mettez régulièrement à jour vos documents avec les dernières données</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              {/* Branding Tab */}
              <TabsContent value="branding">
                <div className="space-y-8">
                  {/* Logo Upload */}
                  <div>
                    <h3 className={clsx(
                      "text-sm font-semibold mb-4 flex items-center",
                      darkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      <Image className="h-4 w-4 mr-2" />
                      Logo
                    </h3>
                    
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className={clsx(
                        "w-40 h-40 rounded-xl flex items-center justify-center border-2 border-dashed",
                        branding.logoPreview 
                          ? darkMode ? "border-purple-800/30" : "border-primary/20" 
                          : darkMode ? "border-gray-700" : "border-gray-200"
                      )}>
                        {branding.logoPreview ? (
                          <img 
                            src={branding.logoPreview} 
                            alt="Logo" 
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="text-center">
                            <Upload className={clsx(
                              "h-8 w-8 mx-auto mb-2",
                              darkMode ? "text-gray-500" : "text-gray-300"
                            )} />
                            <span className={clsx(
                              "text-xs",
                              darkMode ? "text-gray-500" : "text-gray-400"
                            )}>
                              Aucun logo
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <p className={clsx(
                          "text-sm mb-3",
                          darkMode ? "text-gray-400" : "text-gray-600"
                        )}>
                          Téléchargez votre logo pour qu'il apparaisse sur tous vos documents générés. Pour de meilleurs résultats, utilisez une image de haute qualité au format PNG avec un fond transparent.
                        </p>
                        
                        <label className={clsx(
                          "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                          darkMode 
                            ? "bg-purple-600 text-white hover:bg-purple-700" 
                            : "bg-primary text-white hover:bg-opacity-90"
                        )}>
                          <Upload className="h-4 w-4 mr-2" />
                          {branding.logo ? 'Changer le logo' : 'Télécharger un logo'}
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleLogoUpload}
                          />
                        </label>
                        
                        {branding.logo && (
                          <button
                            onClick={() => setBranding({ ...branding, logo: null, logoPreview: null })}
                            className={clsx(
                              "ml-2 inline-flex items-center px-3 py-2 rounded-lg text-sm transition-colors",
                              darkMode 
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Color Scheme */}
                  <div>
                    <h3 className={clsx(
                      "text-sm font-semibold mb-4 flex items-center",
                      darkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      <Palette className="h-4 w-4 mr-2" />
                      Couleurs
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className={clsx(
                          "block text-sm mb-2",
                          darkMode ? "text-gray-400" : "text-gray-600"
                        )}>
                          Couleur principale
                        </label>
                        <div className="flex items-center">
                          <div 
                            className="w-10 h-10 rounded-lg mr-3 border dark:border-gray-700"
                            style={{ backgroundColor: branding.colors.primary }}
                          />
                          <input
                            type="color"
                            value={branding.colors.primary}
                            onChange={(e) => handleColorChange('primary', e.target.value)}
                            className="sr-only"
                            id="primary-color"
                          />
                          <label 
                            htmlFor="primary-color"
                            className={clsx(
                              "flex-1 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                              darkMode 
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                          >
                            {branding.colors.primary}
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label className={clsx(
                          "block text-sm mb-2",
                          darkMode ? "text-gray-400" : "text-gray-600"
                        )}>
                          Couleur secondaire
                        </label>
                        <div className="flex items-center">
                          <div 
                            className="w-10 h-10 rounded-lg mr-3 border dark:border-gray-700"
                            style={{ backgroundColor: branding.colors.secondary }}
                          />
                          <input
                            type="color"
                            value={branding.colors.secondary}
                            onChange={(e) => handleColorChange('secondary', e.target.value)}
                            className="sr-only"
                            id="secondary-color"
                          />
                          <label 
                            htmlFor="secondary-color"
                            className={clsx(
                              "flex-1 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                              darkMode 
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                          >
                            {branding.colors.secondary}
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label className={clsx(
                          "block text-sm mb-2",
                          darkMode ? "text-gray-400" : "text-gray-600"
                        )}>
                          Couleur d'accent
                        </label>
                        <div className="flex items-center">
                          <div 
                            className="w-10 h-10 rounded-lg mr-3 border dark:border-gray-700"
                            style={{ backgroundColor: branding.colors.accent }}
                          />
                          <input
                            type="color"
                            value={branding.colors.accent}
                            onChange={(e) => handleColorChange('accent', e.target.value)}
                            className="sr-only"
                            id="accent-color"
                          />
                          <label 
                            htmlFor="accent-color"
                            className={clsx(
                              "flex-1 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                              darkMode 
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                          >
                            {branding.colors.accent}
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-400" : "text-gray-600"
                      )}>
                        Ces couleurs seront utilisées dans tous vos documents générés pour maintenir une identité visuelle cohérente.
                      </p>
                    </div>
                  </div>
                  
                  {/* Typography */}
                  <div>
                    <h3 className={clsx(
                      "text-sm font-semibold mb-4 flex items-center",
                      darkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      <Type className="h-4 w-4 mr-2" />
                      Typographie
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={clsx(
                          "block text-sm mb-2",
                          darkMode ? "text-gray-400" : "text-gray-600"
                        )}>
                          Police des titres
                        </label>
                        <select
                          value={branding.fonts.heading}
                          onChange={(e) => handleFontChange('heading', e.target.value)}
                          className={clsx(
                            "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200",
                            darkMode 
                              ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500/30 focus:border-purple-500" 
                              : "bg-white border-gray-200 text-gray-900 focus:ring-primary/20 focus:border-primary"
                          )}
                        >
                          {availableFonts.map(font => (
                            <option key={font.value} value={font.value}>{font.name}</option>
                          ))}
                        </select>
                        <div className="mt-2">
                          <div 
                            className={clsx(
                              "p-3 rounded-lg text-center",
                              darkMode ? "bg-gray-700" : "bg-gray-50"
                            )}
                            style={{ fontFamily: branding.fonts.heading }}
                          >
                            <span className={clsx(
                              "text-lg font-semibold",
                              darkMode ? "text-white" : "text-gray-900"
                            )}>
                              Exemple de titre
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className={clsx(
                          "block text-sm mb-2",
                          darkMode ? "text-gray-400" : "text-gray-600"
                        )}>
                          Police du corps de texte
                        </label>
                        <select
                          value={branding.fonts.body}
                          onChange={(e) => handleFontChange('body', e.target.value)}
                          className={clsx(
                            "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200",
                            darkMode 
                              ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500/30 focus:border-purple-500" 
                              : "bg-white border-gray-200 text-gray-900 focus:ring-primary/20 focus:border-primary"
                          )}
                        >
                          {availableFonts.map(font => (
                            <option key={font.value} value={font.value}>{font.name}</option>
                          ))}
                        </select>
                        <div className="mt-2">
                          <div 
                            className={clsx(
                              "p-3 rounded-lg",
                              darkMode ? "bg-gray-700" : "bg-gray-50"
                            )}
                            style={{ fontFamily: branding.fonts.body }}
                          >
                            <span className={clsx(
                              "text-sm",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              Voici un exemple de texte qui utilise la police sélectionnée pour le corps de texte. Cette police sera utilisée pour tous les paragraphes dans vos documents.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Custom Elements */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={clsx(
                        "text-sm font-semibold flex items-center",
                        darkMode ? "text-gray-300" : "text-gray-700"
                      )}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Éléments personnalisés
                      </h3>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => addCustomElement('text')}
                          className={clsx(
                            "flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                            darkMode 
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Ajouter du texte
                        </button>
                        <button
                          onClick={() => addCustomElement('image')}
                          className={clsx(
                            "flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                            darkMode 
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Ajouter une image
                        </button>
                      </div>
                    </div>
                    
                    {branding.customElements.length === 0 ? (
                      <div className={clsx(
                        "p-6 rounded-xl border-2 border-dashed text-center",
                        darkMode 
                          ? "border-gray-700 bg-gray-800/50" 
                          : "border-gray-200 bg-gray-50/50"
                      )}>
                        <p className={clsx(
                          "text-sm",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Ajoutez des éléments personnalisés comme du texte ou des images qui seront inclus dans vos documents générés.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {branding.customElements.map((element) => (
                          <div 
                            key={element.id}
                            className={clsx(
                              "p-4 rounded-xl border",
                              darkMode ? "border-gray-700" : "border-gray-200"
                            )}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center">
                                {element.type === 'text' ? (
                                  <Type className={clsx(
                                    "h-4 w-4 mr-2",
                                    darkMode ? "text-gray-400" : "text-gray-500"
                                  )} />
                                ) : (
                                  <Image className={clsx(
                                    "h-4 w-4 mr-2",
                                    darkMode ? "text-gray-400" : "text-gray-500"
                                  )} />
                                )}
                                <input
                                  type="text"
                                  value={element.description}
                                  onChange={(e) => updateCustomElement(element.id, 'description', e.target.value)}
                                  className={clsx(
                                    "bg-transparent border-b border-dashed focus:outline-none text-sm font-medium",
                                    darkMode 
                                      ? "border-gray-600 text-white focus:border-purple-500" 
                                      : "border-gray-300 text-gray-900 focus:border-primary"
                                  )}
                                  placeholder={element.type === 'text' ? "Texte personnalisé" : "Image personnalisée"}
                                />
                              </div>
                              <button
                                onClick={() => removeCustomElement(element.id)}
                                className={clsx(
                                  "text-sm p-1",
                                  darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
                                )}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            
                            {element.type === 'text' ? (
                              <textarea
                                value={element.content}
                                onChange={(e) => updateCustomElement(element.id, 'content', e.target.value)}
                                rows={3}
                                className={clsx(
                                  "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200 resize-none",
                                  darkMode 
                                    ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500/30 focus:border-purple-500" 
                                    : "bg-white border-gray-200 text-gray-900 focus:ring-primary/20 focus:border-primary"
                                )}
                                placeholder="Entrez votre texte personnalisé ici..."
                              />
                            ) : (
                              <div>
                                <input
                                  type="text"
                                  value={element.content}
                                  onChange={(e) => updateCustomElement(element.id, 'content', e.target.value)}
                                  className={clsx(
                                    "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200",
                                    darkMode 
                                      ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500/30 focus:border-purple-500" 
                                      : "bg-white border-gray-200 text-gray-900 focus:ring-primary/20 focus:border-primary"
                                  )}
                                  placeholder="URL de l'image (https://...)"
                                />
                                {element.content && (
                                  <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <img 
                                      src={element.content} 
                                      alt={element.description}
                                      className="max-h-32 mx-auto object-contain"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                      onLoad={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'block';
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Save Branding */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-end">
                      {/* Ouvrir la charte graphique */}
                      <button
                        className={clsx(
                          "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                          darkMode 
                            ? "bg-purple-600 text-white hover:bg-purple-700" 
                            : "bg-primary text-white hover:bg-opacity-90"
                        )}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Enregistrer la charte graphique
                      </button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;