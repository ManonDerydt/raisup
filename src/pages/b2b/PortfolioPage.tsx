import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Zap, 
  FileText, 
  Download, 
  MoreHorizontal,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react';
import clsx from 'clsx';

const PortfolioPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    sector: '',
    stage: '',
    status: '',
    responsible: '',
    alerts: ''
  });
  const [selectedStartups, setSelectedStartups] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Check if dark mode is enabled
  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  }, []);
  
  // Mock portfolio data
  const portfolioData = {
    totalStartups: 24,
    activeStartups: 18,
    totalAmountSought: 18500000,
    totalAmountRaised: 12300000,
    upToDateDiagnostics: 78,
    criticalAlerts: 7
  };
  
  // Mock startups data
  const startups = [
    {
      id: 1,
      name: 'MediScan',
      sector: 'Healthtech',
      stage: 'Seed',
      status: 'En levée',
      lastDiagnostic: '2025-01-10',
      responsible: 'Marie Dubois',
      amountSought: 750000,
      amountRaised: 150000,
      runway: 8,
      alerts: ['aide-expiring', 'runway-low'],
      email: 'contact@mediscan.fr',
      phone: '+33 1 23 45 67 89',
      website: 'https://mediscan.fr',
      onboardingProgress: 85,
      lastActivity: '2025-01-12'
    },
    {
      id: 2,
      name: 'GreenTech Solutions',
      sector: 'Greentech',
      stage: 'Série A',
      status: 'Accompagnée',
      lastDiagnostic: '2025-01-08',
      responsible: 'Thomas Martin',
      amountSought: 2000000,
      amountRaised: 2000000,
      runway: 18,
      alerts: ['diagnostic-outdated'],
      email: 'hello@greentech-solutions.com',
      phone: '+33 1 34 56 78 90',
      website: 'https://greentech-solutions.com',
      onboardingProgress: 100,
      lastActivity: '2025-01-11'
    },
    {
      id: 3,
      name: 'PropTech Innovations',
      sector: 'Proptech',
      stage: 'Pré-seed',
      status: 'Pipeline',
      lastDiagnostic: '2024-12-15',
      responsible: 'Sophie Laurent',
      amountSought: 500000,
      amountRaised: 0,
      runway: 3,
      alerts: ['runway-critical', 'incomplete-docs'],
      email: 'team@proptech-innov.fr',
      phone: '+33 1 45 67 89 01',
      website: 'https://proptech-innov.fr',
      onboardingProgress: 45,
      lastActivity: '2025-01-09'
    },
    {
      id: 4,
      name: 'FinanceAI',
      sector: 'Fintech',
      stage: 'Seed',
      status: 'Accompagnée',
      lastDiagnostic: '2025-01-12',
      responsible: 'Jean Martin',
      amountSought: 1200000,
      amountRaised: 800000,
      runway: 12,
      alerts: [],
      email: 'contact@financeai.com',
      phone: '+33 1 56 78 90 12',
      website: 'https://financeai.com',
      onboardingProgress: 92,
      lastActivity: '2025-01-12'
    },
    {
      id: 5,
      name: 'EduTech Pro',
      sector: 'Edtech',
      stage: 'Série A',
      status: 'Alumni',
      lastDiagnostic: '2024-11-20',
      responsible: 'Claire Rousseau',
      amountSought: 3000000,
      amountRaised: 3200000,
      runway: 24,
      alerts: ['success-story'],
      email: 'info@edutech-pro.fr',
      phone: '+33 1 67 89 01 23',
      website: 'https://edutech-pro.fr',
      onboardingProgress: 100,
      lastActivity: '2024-12-20'
    }
  ];
  
  // Filter startups based on search and filters
  const filteredStartups = startups.filter(startup => {
    const matchesSearch = startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.responsible.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSector = !selectedFilters.sector || startup.sector === selectedFilters.sector;
    const matchesStage = !selectedFilters.stage || startup.stage === selectedFilters.stage;
    const matchesStatus = !selectedFilters.status || startup.status === selectedFilters.status;
    const matchesResponsible = !selectedFilters.responsible || startup.responsible === selectedFilters.responsible;
    const matchesAlerts = !selectedFilters.alerts || 
                         (selectedFilters.alerts === 'with-alerts' && startup.alerts.length > 0) ||
                         (selectedFilters.alerts === 'no-alerts' && startup.alerts.length === 0);
    
    return matchesSearch && matchesSector && matchesStage && matchesStatus && matchesResponsible && matchesAlerts;
  });
  
  // Get unique values for filters
  const uniqueSectors = [...new Set(startups.map(s => s.sector))];
  const uniqueStages = [...new Set(startups.map(s => s.stage))];
  const uniqueStatuses = [...new Set(startups.map(s => s.status))];
  const uniqueResponsibles = [...new Set(startups.map(s => s.responsible))];
  
  // Handle startup selection
  const handleStartupSelection = (startupId: number) => {
    setSelectedStartups(prev => 
      prev.includes(startupId) 
        ? prev.filter(id => id !== startupId)
        : [...prev, startupId]
    );
  };
  
  // Get alert icon and color
  const getAlertInfo = (alertType: string) => {
    switch (alertType) {
      case 'aide-expiring':
        return { icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' };
      case 'runway-low':
      case 'runway-critical':
        return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' };
      case 'diagnostic-outdated':
        return { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' };
      case 'incomplete-docs':
        return { icon: FileText, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' };
      case 'success-story':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' };
      default:
        return { icon: AlertTriangle, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-900/30' };
    }
  };
  
  // Get stage color
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Pré-seed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'Seed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Série A':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Série B':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accompagnée':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'En levée':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Pipeline':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Alumni':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M€`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K€`;
    }
    return `${amount}€`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  // Calculate days since last diagnostic
  const getDaysSinceLastDiagnostic = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
              Portefeuille Startups
            </h1>
            <p className={clsx(
              "mt-1",
              darkMode ? "text-gray-400" : "text-gray-500"
            )}>
              Pilotage et suivi de vos projets accompagnés
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
              Export Excel
            </button>
            <button className={clsx(
              "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              darkMode 
                ? "bg-purple-600 text-white hover:bg-purple-700" 
                : "bg-primary text-white hover:bg-opacity-90"
            )}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une startup
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
                  Startups accompagnées
                </p>
                <p className={clsx(
                  "text-2xl font-bold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  {portfolioData.totalStartups}
                </p>
                <p className={clsx(
                  "text-xs mt-1",
                  darkMode ? "text-gray-500" : "text-gray-400"
                )}>
                  {portfolioData.activeStartups} actives
                </p>
              </div>
              <div className={clsx(
                "p-3 rounded-full",
                darkMode ? "bg-purple-900/30" : "bg-secondary-light"
              )}>
                <Building2 className={clsx(
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
                  Montant levé / recherché
                </p>
                <p className={clsx(
                  "text-2xl font-bold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  {formatCurrency(portfolioData.totalAmountRaised)}
                </p>
                <p className={clsx(
                  "text-xs mt-1",
                  darkMode ? "text-gray-500" : "text-gray-400"
                )}>
                  sur {formatCurrency(portfolioData.totalAmountSought)} recherchés
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
                  Diagnostics à jour
                </p>
                <p className={clsx(
                  "text-2xl font-bold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  {portfolioData.upToDateDiagnostics}%
                </p>
                <p className={clsx(
                  "text-xs mt-1",
                  darkMode ? "text-gray-500" : "text-gray-400"
                )}>
                  {Math.round(portfolioData.totalStartups * portfolioData.upToDateDiagnostics / 100)} sur {portfolioData.totalStartups}
                </p>
              </div>
              <div className={clsx(
                "p-3 rounded-full",
                darkMode ? "bg-blue-900/30" : "bg-blue-100"
              )}>
                <Activity className={clsx(
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
                  Alertes critiques
                </p>
                <p className={clsx(
                  "text-2xl font-bold",
                  portfolioData.criticalAlerts > 0 
                    ? "text-red-500" 
                    : darkMode ? "text-white" : "text-gray-900"
                )}>
                  {portfolioData.criticalAlerts}
                </p>
                <p className={clsx(
                  "text-xs mt-1",
                  darkMode ? "text-gray-500" : "text-gray-400"
                )}>
                  Nécessitent une action
                </p>
              </div>
              <div className={clsx(
                "p-3 rounded-full",
                portfolioData.criticalAlerts > 0 
                  ? "bg-red-100 dark:bg-red-900/30" 
                  : darkMode ? "bg-gray-700" : "bg-gray-100"
              )}>
                <AlertTriangle className={clsx(
                  "h-6 w-6",
                  portfolioData.criticalAlerts > 0 
                    ? "text-red-500" 
                    : darkMode ? "text-gray-400" : "text-gray-500"
                )} />
              </div>
            </div>
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
                  placeholder="Rechercher une startup, secteur, responsable..."
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
              Filtres
            </button>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  {uniqueSectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
                
                <select
                  value={selectedFilters.stage}
                  onChange={(e) => setSelectedFilters({...selectedFilters, stage: e.target.value})}
                  className={clsx(
                    "px-3 py-2 rounded-lg border text-sm",
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-gray-900"
                  )}
                >
                  <option value="">Tous les stades</option>
                  {uniqueStages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
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
                  value={selectedFilters.responsible}
                  onChange={(e) => setSelectedFilters({...selectedFilters, responsible: e.target.value})}
                  className={clsx(
                    "px-3 py-2 rounded-lg border text-sm",
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-gray-900"
                  )}
                >
                  <option value="">Tous les responsables</option>
                  {uniqueResponsibles.map(responsible => (
                    <option key={responsible} value={responsible}>{responsible}</option>
                  ))}
                </select>
                
                <select
                  value={selectedFilters.alerts}
                  onChange={(e) => setSelectedFilters({...selectedFilters, alerts: e.target.value})}
                  className={clsx(
                    "px-3 py-2 rounded-lg border text-sm",
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-gray-900"
                  )}
                >
                  <option value="">Toutes les alertes</option>
                  <option value="with-alerts">Avec alertes</option>
                  <option value="no-alerts">Sans alertes</option>
                </select>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <p className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  {filteredStartups.length} startup(s) trouvée(s)
                </p>
                <button
                  onClick={() => {
                    setSelectedFilters({
                      sector: '',
                      stage: '',
                      status: '',
                      responsible: '',
                      alerts: ''
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
        
        {/* Startups Table */}
        <div className={clsx(
          "rounded-xl shadow-sm overflow-hidden",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className={clsx(
                "border-b",
                darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
              )}>
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      className="rounded"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStartups(filteredStartups.map(s => s.id));
                        } else {
                          setSelectedStartups([]);
                        }
                      }}
                    />
                  </th>
                  <th className={clsx(
                    "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                    darkMode ? "text-gray-300" : "text-gray-500"
                  )}>
                    Startup / Projet
                  </th>
                  <th className={clsx(
                    "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                    darkMode ? "text-gray-300" : "text-gray-500"
                  )}>
                    Secteur / Stade
                  </th>
                  <th className={clsx(
                    "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                    darkMode ? "text-gray-300" : "text-gray-500"
                  )}>
                    Statut / Onboarding
                  </th>
                  <th className={clsx(
                    "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                    darkMode ? "text-gray-300" : "text-gray-500"
                  )}>
                    Responsable / Diagnostic
                  </th>
                  <th className={clsx(
                    "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                    darkMode ? "text-gray-300" : "text-gray-500"
                  )}>
                    Financement
                  </th>
                  <th className={clsx(
                    "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                    darkMode ? "text-gray-300" : "text-gray-500"
                  )}>
                    Alertes
                  </th>
                  <th className={clsx(
                    "px-6 py-4 text-right text-xs font-medium uppercase tracking-wider",
                    darkMode ? "text-gray-300" : "text-gray-500"
                  )}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={clsx(
                "divide-y",
                darkMode ? "divide-gray-700" : "divide-gray-200"
              )}>
                {filteredStartups.map((startup) => (
                  <tr 
                    key={startup.id}
                    className={clsx(
                      "hover:bg-opacity-50 transition-colors",
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    )}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedStartups.includes(startup.id)}
                        onChange={() => handleStartupSelection(startup.id)}
                      />
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <button className={clsx(
                            "font-medium hover:underline text-left",
                            darkMode ? "text-white" : "text-gray-900"
                          )}>
                            {startup.name}
                          </button>
                          <div className="flex items-center mt-1 space-x-2">
                            <span className={clsx(
                              "text-xs",
                              darkMode ? "text-gray-400" : "text-gray-500"
                            )}>
                              Runway: {startup.runway} mois
                            </span>
                            {startup.runway <= 6 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                Critique
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div>
                        <span className={clsx(
                          "text-sm font-medium",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {startup.sector}
                        </span>
                        <div className="mt-1">
                          <span className={clsx(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            getStageColor(startup.stage)
                          )}>
                            {startup.stage}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div>
                        <span className={clsx(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          getStatusColor(startup.status)
                        )}>
                          {startup.status}
                        </span>
                        <div className="mt-2">
                          <div className={clsx(
                            "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5",
                          )}>
                            <div 
                              className={clsx(
                                "h-1.5 rounded-full",
                                startup.onboardingProgress >= 80 
                                  ? "bg-green-500" 
                                  : startup.onboardingProgress >= 50 
                                    ? "bg-yellow-500" 
                                    : "bg-red-500"
                              )}
                              style={{ width: `${startup.onboardingProgress}%` }}
                            />
                          </div>
                          <span className={clsx(
                            "text-xs mt-1",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            Onboarding {startup.onboardingProgress}%
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div>
                        <p className={clsx(
                          "text-sm font-medium",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {startup.responsible}
                        </p>
                        <div className="mt-1 flex items-center">
                          <span className={clsx(
                            "text-xs",
                            getDaysSinceLastDiagnostic(startup.lastDiagnostic) > 30 
                              ? "text-red-500" 
                              : getDaysSinceLastDiagnostic(startup.lastDiagnostic) > 14 
                                ? "text-yellow-500" 
                                : "text-green-500"
                          )}>
                            Diagnostic: {formatDate(startup.lastDiagnostic)}
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className={clsx(
                            "text-xs",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            Activité: {formatDate(startup.lastActivity)}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center">
                          <span className={clsx(
                            "text-sm font-medium",
                            darkMode ? "text-gray-300" : "text-gray-700"
                          )}>
                            {formatCurrency(startup.amountRaised)}
                          </span>
                          <span className={clsx(
                            "text-xs ml-1",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            / {formatCurrency(startup.amountSought)}
                          </span>
                        </div>
                        <div className="mt-1">
                          <div className={clsx(
                            "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5"
                          )}>
                            <div 
                              className="bg-primary dark:bg-purple-600 h-1.5 rounded-full"
                              style={{ width: `${Math.min((startup.amountRaised / startup.amountSought) * 100, 100)}%` }}
                            />
                          </div>
                          <span className={clsx(
                            "text-xs mt-1",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            {Math.round((startup.amountRaised / startup.amountSought) * 100)}% levé
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {startup.alerts.map((alert, index) => {
                          const alertInfo = getAlertInfo(alert);
                          return (
                            <div
                              key={index}
                              className={clsx(
                                "p-1 rounded-full",
                                alertInfo.bg
                              )}
                              title={alert}
                            >
                              <alertInfo.icon className={clsx(
                                "h-3 w-3",
                                alertInfo.color
                              )} />
                            </div>
                          );
                        })}
                        {startup.alerts.length === 0 && (
                          <span className={clsx(
                            "text-xs",
                            darkMode ? "text-gray-500" : "text-gray-400"
                          )}>
                            Aucune alerte
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className={clsx(
                            "p-2 rounded-lg transition-colors",
                            darkMode 
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          )}
                          title="Voir la fiche projet"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className={clsx(
                            "p-2 rounded-lg transition-colors",
                            darkMode 
                              ? "bg-purple-600 text-white hover:bg-purple-700" 
                              : "bg-primary text-white hover:bg-opacity-90"
                          )}
                          title="Lancer diagnostic IA"
                        >
                          <Zap className="h-4 w-4" />
                        </button>
                        <button
                          className={clsx(
                            "p-2 rounded-lg transition-colors",
                            darkMode 
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          )}
                          title="Générer rapport"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          className={clsx(
                            "p-2 rounded-lg transition-colors",
                            darkMode 
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          )}
                          title="Plus d'options"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredStartups.length === 0 && (
            <div className="text-center py-12">
              <Building2 className={clsx(
                "mx-auto h-12 w-12 mb-4",
                darkMode ? "text-gray-600" : "text-gray-400"
              )} />
              <h3 className={clsx(
                "text-sm font-medium",
                darkMode ? "text-gray-300" : "text-gray-900"
              )}>
                Aucune startup trouvée
              </h3>
              <p className={clsx(
                "text-sm mt-1",
                darkMode ? "text-gray-500" : "text-gray-500"
              )}>
                Modifiez vos critères de recherche ou ajoutez une nouvelle startup.
              </p>
            </div>
          )}
        </div>
        
        {/* Bulk actions */}
        {selectedStartups.length > 0 && (
          <div className={clsx(
            "fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg border",
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          )}>
            <div className="flex items-center space-x-4">
              <span className={clsx(
                "text-sm font-medium",
                darkMode ? "text-gray-300" : "text-gray-700"
              )}>
                {selectedStartups.length} startup(s) sélectionnée(s)
              </span>
              <div className="flex space-x-2">
                <button className={clsx(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                  darkMode 
                    ? "bg-purple-600 text-white hover:bg-purple-700" 
                    : "bg-primary text-white hover:bg-opacity-90"
                )}>
                  Diagnostic IA groupé
                </button>
                <button className={clsx(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                  darkMode 
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                )}>
                  Export sélection
                </button>
                <button 
                  onClick={() => setSelectedStartups([])}
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

export default PortfolioPage;