import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  DollarSign, 
  Building2, 
  ExternalLink, 
  Download, 
  Bell,
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  Globe,
  ArrowRight,
  Sparkles,
  Eye,
  Send,
  Archive,
  RefreshCw
} from 'lucide-react';
import clsx from 'clsx';

const FundingSynthesisPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    type: '',
    sector: '',
    amount: '',
    deadline: '',
    region: '',
    status: ''
  });
  const [selectedAids, setSelectedAids] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'expiring' | 'recommended'>('all');
  
  // Check if dark mode is enabled
  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  }, []);
  
  // Mock aids/funding data
  const fundingOpportunities = [
    {
      id: 1,
      name: 'Bpifrance - Aide à l\'Innovation',
      type: 'Subvention',
      provider: 'Bpifrance',
      amount: '50 000 € - 200 000 €',
      deadline: '2025-12-31',
      region: 'France',
      sectors: ['Healthtech', 'Fintech', 'Greentech'],
      description: 'Financement des projets innovants à fort potentiel de croissance et de développement.',
      eligibility: 'Startups et PME innovantes de moins de 5 ans avec un projet R&D',
      status: 'Ouvert',
      concernedStartups: ['MediScan', 'FinanceAI'],
      website: 'https://www.bpifrance.fr',
      aiRecommendation: 92,
      isExpiring: false,
      isNew: false,
      lastUpdated: '2025-01-10'
    },
    {
      id: 2,
      name: 'France 2030 - Santé Numérique',
      type: 'Subvention',
      provider: 'État Français',
      amount: '100 000 € - 500 000 €',
      deadline: '2025-09-15',
      region: 'France',
      sectors: ['Healthtech', 'Medtech'],
      description: 'Programme de soutien aux innovations dans le domaine de la santé numérique et de la médecine personnalisée.',
      eligibility: 'Startups et PME dans le secteur de la santé avec un produit en développement',
      status: 'Ouvert',
      concernedStartups: ['MediScan'],
      website: 'https://www.france2030.gouv.fr',
      aiRecommendation: 87,
      isExpiring: false,
      isNew: true,
      lastUpdated: '2025-01-12'
    },
    {
      id: 3,
      name: 'Région Île-de-France - PM\'up',
      type: 'Subvention',
      provider: 'Région IDF',
      amount: 'Jusqu\'à 250 000 €',
      deadline: '2025-03-30',
      region: 'Île-de-France',
      sectors: ['Tous secteurs'],
      description: 'Aide au développement des PME franciliennes à fort potentiel de croissance.',
      eligibility: 'PME basées en Île-de-France avec un CA < 50M€',
      status: 'Ouvert',
      concernedStartups: ['PropTech Innovations', 'EduTech Pro'],
      website: 'https://www.iledefrance.fr',
      aiRecommendation: 78,
      isExpiring: true,
      isNew: false,
      lastUpdated: '2025-01-08'
    },
    {
      id: 4,
      name: 'Prêt Innovation - Bpifrance',
      type: 'Prêt',
      provider: 'Bpifrance',
      amount: '50 000 € - 5 000 000 €',
      deadline: 'Continu',
      region: 'France',
      sectors: ['Tous secteurs'],
      description: 'Prêt à taux avantageux pour financer les projets innovants sans garantie personnelle.',
      eligibility: 'PME et ETI de plus de 3 ans avec un projet innovant',
      status: 'Ouvert',
      concernedStartups: ['GreenTech Solutions', 'FinanceAI'],
      website: 'https://www.bpifrance.fr',
      aiRecommendation: 85,
      isExpiring: false,
      isNew: false,
      lastUpdated: '2025-01-05'
    },
    {
      id: 5,
      name: 'Horizon Europe - EIC Accelerator',
      type: 'Subvention + Equity',
      provider: 'Commission Européenne',
      amount: 'Jusqu\'à 2 500 000 €',
      deadline: '2025-10-15',
      region: 'Europe',
      sectors: ['Deeptech', 'Healthtech', 'Greentech'],
      description: 'Programme européen de financement pour les innovations de rupture avec fort potentiel commercial.',
      eligibility: 'Startups et PME innovantes avec une technologie de rupture',
      status: 'Ouvert',
      concernedStartups: ['MediScan', 'GreenTech Solutions'],
      website: 'https://eic.ec.europa.eu',
      aiRecommendation: 72,
      isExpiring: false,
      isNew: false,
      lastUpdated: '2025-01-07'
    },
    {
      id: 6,
      name: 'CIR - Crédit Impôt Recherche',
      type: 'Crédit d\'impôt',
      provider: 'État Français',
      amount: '30% des dépenses R&D',
      deadline: 'Annuel',
      region: 'France',
      sectors: ['Tous secteurs'],
      description: 'Crédit d\'impôt pour les dépenses de recherche et développement.',
      eligibility: 'Toutes entreprises réalisant des activités de R&D',
      status: 'Permanent',
      concernedStartups: ['MediScan', 'FinanceAI', 'GreenTech Solutions'],
      website: 'https://www.impots.gouv.fr',
      aiRecommendation: 95,
      isExpiring: false,
      isNew: false,
      lastUpdated: '2025-01-01'
    }
  ];
  
  // Filter aids based on view mode and filters
  const getFilteredAids = () => {
    let filtered = fundingOpportunities;
    
    // Apply view mode filter
    switch (viewMode) {
      case 'active':
        filtered = filtered.filter(aid => aid.status === 'Ouvert');
        break;
      case 'expiring':
        filtered = filtered.filter(aid => aid.isExpiring);
        break;
      case 'recommended':
        filtered = filtered.filter(aid => aid.aiRecommendation >= 80);
        break;
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(aid => 
        aid.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aid.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aid.sectors.some(sector => sector.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply other filters
    if (selectedFilters.type) {
      filtered = filtered.filter(aid => aid.type === selectedFilters.type);
    }
    if (selectedFilters.sector) {
      filtered = filtered.filter(aid => aid.sectors.includes(selectedFilters.sector) || aid.sectors.includes('Tous secteurs'));
    }
    if (selectedFilters.region) {
      filtered = filtered.filter(aid => aid.region === selectedFilters.region);
    }
    if (selectedFilters.status) {
      filtered = filtered.filter(aid => aid.status === selectedFilters.status);
    }
    
    return filtered;
  };
  
  const filteredAids = getFilteredAids();
  
  // Get unique values for filters
  const uniqueTypes = [...new Set(fundingOpportunities.map(aid => aid.type))];
  const uniqueSectors = [...new Set(fundingOpportunities.flatMap(aid => aid.sectors))];
  const uniqueRegions = [...new Set(fundingOpportunities.map(aid => aid.region))];
  const uniqueStatuses = [...new Set(fundingOpportunities.map(aid => aid.status))];
  
  // Handle aid selection
  const handleAidSelection = (aidId: number) => {
    setSelectedAids(prev => 
      prev.includes(aidId) 
        ? prev.filter(id => id !== aidId)
        : [...prev, aidId]
    );
  };
  
  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Subvention':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'Prêt':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Crédit d\'impôt':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Subvention + Equity':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ouvert':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'Fermé':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'Permanent':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    if (dateString === 'Continu' || dateString === 'Annuel') return dateString;
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  // Check if deadline is soon
  const isDeadlineSoon = (dateString: string) => {
    if (dateString === 'Continu' || dateString === 'Annuel') return false;
    const deadline = new Date(dateString);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };
  
  // Calculate portfolio stats
  const portfolioStats = {
    totalAids: fundingOpportunities.length,
    activeAids: fundingOpportunities.filter(aid => aid.status === 'Ouvert').length,
    expiringAids: fundingOpportunities.filter(aid => aid.isExpiring).length,
    newAids: fundingOpportunities.filter(aid => aid.isNew).length,
    totalPotentialAmount: fundingOpportunities.reduce((sum, aid) => {
      const maxAmount = aid.amount.includes('Jusqu\'à') 
        ? parseInt(aid.amount.replace(/[^\d]/g, '')) 
        : aid.amount.includes('-') 
          ? parseInt(aid.amount.split('-')[1].replace(/[^\d]/g, ''))
          : 200000; // default estimate
      return sum + maxAmount;
    }, 0),
    concernedStartups: [...new Set(fundingOpportunities.flatMap(aid => aid.concernedStartups))].length
  };
  
  return (
    <div className={clsx(
      "py-8 px-4 sm:px-6 lg:px-8",
      darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
    )}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className={clsx(
              "text-2xl font-bold",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Synthèse d'aides & Opportunités
            </h1>
            <p className={clsx(
              "mt-1",
              darkMode ? "text-gray-400" : "text-gray-500"
            )}>
              Centralisation et gestion des aides publiques/privées pour votre portefeuille
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-3">
            <button className={clsx(
              "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              darkMode 
                ? "bg-gray-700 text-white hover:bg-gray-600" 
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            )}>
              <Download className="h-4 w-4 mr-2" />
              Export synthèse
            </button>
            <button className={clsx(
              "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              darkMode 
                ? "bg-gray-700 text-white hover:bg-gray-600" 
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            )}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser la veille
            </button>
            <button className={clsx(
              "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              darkMode 
                ? "bg-purple-600 text-white hover:bg-purple-700" 
                : "bg-primary text-white hover:bg-opacity-90"
            )}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une aide
            </button>
          </div>
        </div>
        
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={clsx(
            "p-6 rounded-xl",
            darkMode ? "bg-gray-800" : "bg-white shadow-sm"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Aides disponibles
                </p>
                <p className={clsx(
                  "text-2xl font-bold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  {portfolioStats.totalAids}
                </p>
                <p className={clsx(
                  "text-xs mt-1",
                  darkMode ? "text-gray-500" : "text-gray-400"
                )}>
                  {portfolioStats.activeAids} ouvertes
                </p>
              </div>
              <div className={clsx(
                "p-3 rounded-full",
                darkMode ? "bg-blue-900/30" : "bg-blue-100"
              )}>
                <FileText className={clsx(
                  "h-6 w-6",
                  darkMode ? "text-blue-400" : "text-blue-600"
                )} />
              </div>
            </div>
          </div>
          
          <div className={clsx(
            "p-6 rounded-xl",
            darkMode ? "bg-gray-800" : "bg-white shadow-sm"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Potentiel de financement
                </p>
                <p className={clsx(
                  "text-2xl font-bold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  {(portfolioStats.totalPotentialAmount / 1000000).toFixed(1)}M€
                </p>
                <p className={clsx(
                  "text-xs mt-1",
                  darkMode ? "text-gray-500" : "text-gray-400"
                )}>
                  Montant cumulé maximum
                </p>
              </div>
              <div className={clsx(
                "p-3 rounded-full",
                darkMode ? "bg-green-900/30" : "bg-green-100"
              )}>
                <DollarSign className={clsx(
                  "h-6 w-6",
                  darkMode ? "text-green-400" : "text-green-600"
                )} />
              </div>
            </div>
          </div>
          
          <div className={clsx(
            "p-6 rounded-xl",
            darkMode ? "bg-gray-800" : "bg-white shadow-sm"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Startups concernées
                </p>
                <p className={clsx(
                  "text-2xl font-bold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  {portfolioStats.concernedStartups}
                </p>
                <p className={clsx(
                  "text-xs mt-1",
                  darkMode ? "text-gray-500" : "text-gray-400"
                )}>
                  Éligibles aux aides
                </p>
              </div>
              <div className={clsx(
                "p-3 rounded-full",
                darkMode ? "bg-purple-900/30" : "bg-secondary-light"
              )}>
                <Users className={clsx(
                  "h-6 w-6",
                  darkMode ? "text-purple-400" : "text-primary"
                )} />
              </div>
            </div>
          </div>
          
          <div className={clsx(
            "p-6 rounded-xl",
            darkMode ? "bg-gray-800" : "bg-white shadow-sm"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Échéances imminentes
                </p>
                <p className={clsx(
                  "text-2xl font-bold",
                  portfolioStats.expiringAids > 0 
                    ? "text-orange-500" 
                    : darkMode ? "text-white" : "text-gray-900"
                )}>
                  {portfolioStats.expiringAids}
                </p>
                <p className={clsx(
                  "text-xs mt-1",
                  darkMode ? "text-gray-500" : "text-gray-400"
                )}>
                  {portfolioStats.newAids} nouvelles
                </p>
              </div>
              <div className={clsx(
                "p-3 rounded-full",
                portfolioStats.expiringAids > 0 
                  ? "bg-orange-100 dark:bg-orange-900/30" 
                  : darkMode ? "bg-gray-700" : "bg-gray-100"
              )}>
                <Calendar className={clsx(
                  "h-6 w-6",
                  portfolioStats.expiringAids > 0 
                    ? "text-orange-500" 
                    : darkMode ? "text-gray-400" : "text-gray-500"
                )} />
              </div>
            </div>
          </div>
        </div>
        
        {/* View Mode Tabs */}
        <div className={clsx(
          "rounded-xl shadow-sm mb-6",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { key: 'all', label: 'Toutes les aides', count: fundingOpportunities.length },
              { key: 'active', label: 'Ouvertes', count: fundingOpportunities.filter(aid => aid.status === 'Ouvert').length },
              { key: 'expiring', label: 'Échéances proches', count: fundingOpportunities.filter(aid => aid.isExpiring).length },
              { key: 'recommended', label: 'Recommandées IA', count: fundingOpportunities.filter(aid => aid.aiRecommendation >= 80).length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setViewMode(tab.key as any)}
                className={clsx(
                  "px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                  viewMode === tab.key
                    ? darkMode 
                      ? "border-purple-500 text-purple-400" 
                      : "border-primary text-primary"
                    : darkMode 
                      ? "border-transparent text-gray-400 hover:text-gray-300" 
                      : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className={clsx(
          "rounded-xl shadow-sm p-6 mb-8",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className={clsx(
                  "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )} />
                <input
                  type="text"
                  placeholder="Rechercher une aide, organisme, secteur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={clsx(
                    "w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all",
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500/30 focus:border-purple-500" 
                      : "bg-white border-gray-300 text-gray-900 focus:ring-primary/20 focus:border-primary"
                  )}
                />
              </div>
            </div>
            
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                "inline-flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                showFilters
                  ? darkMode 
                    ? "bg-purple-600 text-white" 
                    : "bg-primary text-white"
                  : darkMode 
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres avancés
            </button>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                <select
                  value={selectedFilters.type}
                  onChange={(e) => setSelectedFilters({...selectedFilters, type: e.target.value})}
                  className={clsx(
                    "px-3 py-2 rounded-lg border text-sm",
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-gray-900"
                  )}
                >
                  <option value="">Tous les types</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                
                <select
                  value={selectedFilters.sector}
                  onChange={(e) => setSelectedFilters({...selectedFilters, sector: e.target.value})}
                  className={clsx(
                    "px-3 py-2 rounded-lg border text-sm",
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-gray-900"
                  )}
                >
                  <option value="">Tous les secteurs</option>
                  {uniqueSectors.filter(s => s !== 'Tous secteurs').map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
                
                <select
                  value={selectedFilters.region}
                  onChange={(e) => setSelectedFilters({...selectedFilters, region: e.target.value})}
                  className={clsx(
                    "px-3 py-2 rounded-lg border text-sm",
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-gray-900"
                  )}
                >
                  <option value="">Toutes les régions</option>
                  {uniqueRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                
                <select
                  value={selectedFilters.status}
                  onChange={(e) => setSelectedFilters({...selectedFilters, status: e.target.value})}
                  className={clsx(
                    "px-3 py-2 rounded-lg border text-sm",
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-gray-900"
                  )}
                >
                  <option value="">Tous les statuts</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                
                <select
                  value={selectedFilters.amount}
                  onChange={(e) => setSelectedFilters({...selectedFilters, amount: e.target.value})}
                  className={clsx(
                    "px-3 py-2 rounded-lg border text-sm",
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-gray-900"
                  )}
                >
                  <option value="">Tous les montants</option>
                  <option value="small">< 100K€</option>
                  <option value="medium">100K€ - 500K€</option>
                  <option value="large">> 500K€</option>
                </select>
                
                <select
                  value={selectedFilters.deadline}
                  onChange={(e) => setSelectedFilters({...selectedFilters, deadline: e.target.value})}
                  className={clsx(
                    "px-3 py-2 rounded-lg border text-sm",
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-gray-900"
                  )}
                >
                  <option value="">Toutes les échéances</option>
                  <option value="soon">< 30 jours</option>
                  <option value="medium">30-90 jours</option>
                  <option value="later">> 90 jours</option>
                </select>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <p className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  {filteredAids.length} aide(s) trouvée(s)
                </p>
                <button
                  onClick={() => {
                    setSelectedFilters({
                      type: '',
                      sector: '',
                      amount: '',
                      deadline: '',
                      region: '',
                      status: ''
                    });
                    setSearchTerm('');
                  }}
                  className={clsx(
                    "text-sm font-medium hover:underline",
                    darkMode ? "text-purple-400" : "text-primary"
                  )}
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Aids Cards/Table */}
        <div className="space-y-4">
          {filteredAids.map((aid) => (
            <div 
              key={aid.id}
              className={clsx(
                "rounded-xl shadow-sm border transition-all hover:shadow-md",
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      className="mt-1 mr-4 rounded"
                      checked={selectedAids.includes(aid.id)}
                      onChange={() => handleAidSelection(aid.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={clsx(
                            "text-lg font-semibold",
                            darkMode ? "text-white" : "text-gray-900"
                          )}>
                            {aid.name}
                          </h3>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className={clsx(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                              getTypeColor(aid.type)
                            )}>
                              {aid.type}
                            </span>
                            <span className={clsx(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                              getStatusColor(aid.status)
                            )}>
                              {aid.status}
                            </span>
                            {aid.isNew && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                Nouveau
                              </span>
                            )}
                            {aid.isExpiring && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                                Expire bientôt
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={clsx(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            aid.aiRecommendation >= 90 
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : aid.aiRecommendation >= 70 
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          )}>
                            <Sparkles className="h-3 w-3 mr-1 inline" />
                            Match {aid.aiRecommendation}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <p className={clsx(
                      "text-sm mb-3",
                      darkMode ? "text-gray-300" : "text-gray-600"
                    )}>
                      {aid.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className={clsx(
                          "font-medium mb-2",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          Informations clés
                        </h4>
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <DollarSign className={clsx(
                              "h-4 w-4 mr-2",
                              darkMode ? "text-gray-400" : "text-gray-500"
                            )} />
                            <span className={clsx(
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              {aid.amount}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className={clsx(
                              "h-4 w-4 mr-2",
                              isDeadlineSoon(aid.deadline) ? "text-orange-500" : darkMode ? "text-gray-400" : "text-gray-500"
                            )} />
                            <span className={clsx(
                              isDeadlineSoon(aid.deadline) ? "text-orange-500" : darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              Échéance: {formatDate(aid.deadline)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Globe className={clsx(
                              "h-4 w-4 mr-2",
                              darkMode ? "text-gray-400" : "text-gray-500"
                            )} />
                            <span className={clsx(
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              {aid.region}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Building2 className={clsx(
                              "h-4 w-4 mr-2",
                              darkMode ? "text-gray-400" : "text-gray-500"
                            )} />
                            <span className={clsx(
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              {aid.provider}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className={clsx(
                          "font-medium mb-2",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          Éligibilité & Secteurs
                        </h4>
                        <p className={clsx(
                          "text-xs mb-2",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          {aid.eligibility}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {aid.sectors.map((sector, index) => (
                            <span 
                              key={index}
                              className={clsx(
                                "px-2 py-1 rounded-full text-xs",
                                darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                              )}
                            >
                              {sector}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className={clsx(
                      "font-medium mb-3",
                      darkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      Startups concernées ({aid.concernedStartups.length})
                    </h4>
                    <div className="space-y-2 mb-4">
                      {aid.concernedStartups.map((startup, index) => (
                        <div 
                          key={index}
                          className={clsx(
                            "flex items-center justify-between p-2 rounded-lg",
                            darkMode ? "bg-gray-700" : "bg-gray-50"
                          )}
                        >
                          <span className={clsx(
                            "text-sm",
                            darkMode ? "text-gray-300" : "text-gray-700"
                          )}>
                            {startup}
                          </span>
                          <button className={clsx(
                            "text-xs font-medium hover:underline",
                            darkMode ? "text-purple-400" : "text-primary"
                          )}>
                            Voir fiche
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <button className={clsx(
                        "w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        darkMode 
                          ? "bg-purple-600 text-white hover:bg-purple-700" 
                          : "bg-primary text-white hover:bg-opacity-90"
                      )}>
                        <Send className="h-4 w-4 mr-2 inline" />
                        Recommander au portefeuille
                      </button>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button className={clsx(
                          "px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                          darkMode 
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        )}>
                          <Eye className="h-3 w-3 mr-1 inline" />
                          Détails
                        </button>
                        <a
                          href={aid.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={clsx(
                            "px-3 py-2 text-xs font-medium rounded-lg transition-colors text-center",
                            darkMode 
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          )}
                        >
                          <ExternalLink className="h-3 w-3 mr-1 inline" />
                          Site
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredAids.length === 0 && (
          <div className={clsx(
            "text-center py-12 rounded-xl",
            darkMode ? "bg-gray-800" : "bg-white shadow-sm"
          )}>
            <FileText className={clsx(
              "mx-auto h-12 w-12 mb-4",
              darkMode ? "text-gray-600" : "text-gray-400"
            )} />
            <h3 className={clsx(
              "text-sm font-medium",
              darkMode ? "text-gray-300" : "text-gray-900"
            )}>
              Aucune aide trouvée
            </h3>
            <p className={clsx(
              "text-sm mt-1",
              darkMode ? "text-gray-500" : "text-gray-500"
            )}>
              Modifiez vos critères de recherche ou ajoutez une nouvelle aide.
            </p>
          </div>
        )}
        
        {/* Bulk actions */}
        {selectedAids.length > 0 && (
          <div className={clsx(
            "fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg border z-50",
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          )}>
            <div className="flex items-center space-x-4">
              <span className={clsx(
                "text-sm font-medium",
                darkMode ? "text-gray-300" : "text-gray-700"
              )}>
                {selectedAids.length} aide(s) sélectionnée(s)
              </span>
              <div className="flex space-x-2">
                <button className={clsx(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                  darkMode 
                    ? "bg-purple-600 text-white hover:bg-purple-700" 
                    : "bg-primary text-white hover:bg-opacity-90"
                )}>
                  <Send className="h-3 w-3 mr-1" />
                  Recommander
                </button>
                <button className={clsx(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                  darkMode 
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                )}>
                  <Archive className="h-3 w-3 mr-1" />
                  Archiver
                </button>
                <button 
                  onClick={() => setSelectedAids([])}
                  className={clsx(
                    "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                    darkMode 
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  )}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundingSynthesisPage;