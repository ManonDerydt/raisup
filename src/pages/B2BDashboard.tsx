import React, { useState } from 'react';
import { 
  Plus, 
  FileText, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  Eye,
  Zap,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Calendar,
  Building2,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  MoreHorizontal,
  MessageSquare,
  UserPlus,
  Briefcase,
  Bell,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

const B2BDashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // Check if dark mode is enabled
  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  }, []);
  
  // Mock data for B2B dashboard
  const portfolioData = {
    totalStartups: 24,
    activeStartups: 18,
    totalFundingRequested: 18500000,
    totalFundingRaised: 12300000,
    dilutivePercentage: 65,
    nonDilutivePercentage: 35,
    activeAlerts: 7,
    highPriorityAlerts: 3,
    recentDiagnostics: 18,
    successRate: 78,
    averageTimeToFunding: 4.2,
    portfolioGrowth: 15.3
  };
  
  const kpis = [
    {
      name: 'Taux de succès',
      value: `${portfolioData.successRate}%`,
      change: 5.2,
      trend: 'up',
      description: 'Startups ayant levé avec succès'
    },
    {
      name: 'Temps moyen levée',
      value: `${portfolioData.averageTimeToFunding} mois`,
      change: -0.8,
      trend: 'up',
      description: 'Durée moyenne jusqu\'à la levée'
    },
    {
      name: 'Croissance portefeuille',
      value: `+${portfolioData.portfolioGrowth}%`,
      change: 3.1,
      trend: 'up',
      description: 'Évolution sur 12 mois'
    },
    {
      name: 'Engagement plateforme',
      value: '89%',
      change: 12.5,
      trend: 'up',
      description: 'Taux d\'utilisation mensuel'
    }
  ];
  
  const startups = [
    {
      id: 1,
      name: 'MediScan SAS',
      sector: 'Healthtech',
      status: 'Levée en cours',
      lastDiagnostic: '2025-01-10',
      alerts: [
        { type: 'warning', message: 'Aide BPI expire dans 15j', priority: 'high' }
      ],
      fundingRequested: 750000,
      fundingRaised: 0,
      responsible: 'Marie Dupont',
      stage: 'Seed',
      runway: 8,
      lastActivity: '2025-01-12',
      riskLevel: 'medium'
    },
    {
      id: 2,
      name: 'GreenTech Solutions',
      sector: 'Greentech',
      status: 'En accompagnement',
      lastDiagnostic: '2025-01-08',
      alerts: [],
      fundingRequested: 1200000,
      fundingRaised: 300000,
      responsible: 'Thomas Martin',
      stage: 'Série A',
      runway: 14,
      lastActivity: '2025-01-11',
      riskLevel: 'low'
    },
    {
      id: 3,
      name: 'EduAI Platform',
      sector: 'Edtech',
      status: 'Levée terminée',
      lastDiagnostic: '2024-12-15',
      alerts: [
        { type: 'info', message: 'Diagnostic à mettre à jour', priority: 'medium' }
      ],
      fundingRequested: 500000,
      fundingRaised: 500000,
      responsible: 'Sophie Leroy',
      stage: 'Pré-seed',
      runway: 18,
      lastActivity: '2024-12-20',
      riskLevel: 'low'
    },
    {
      id: 4,
      name: 'FinanceBot',
      sector: 'Fintech',
      status: 'En attente',
      lastDiagnostic: '2025-01-05',
      alerts: [],
      fundingRequested: 2000000,
      fundingRaised: 0,
      responsible: 'Pierre Dubois',
      stage: 'Série A',
      runway: 6,
      lastActivity: '2025-01-09',
      riskLevel: 'medium'
    },
    {
      id: 5,
      name: 'PropTech Innovations',
      sector: 'Proptech',
      status: 'Levée en cours',
      lastDiagnostic: '2025-01-12',
      alerts: [
        { type: 'alert', message: 'Runway critique < 3 mois', priority: 'high' },
        { type: 'warning', message: 'Échéance due diligence', priority: 'high' }
      ],
      fundingRequested: 850000,
      fundingRaised: 0,
      responsible: 'Julie Bernard',
      stage: 'Seed',
      runway: 2,
      lastActivity: '2025-01-12',
      riskLevel: 'high'
    },
    {
      id: 6,
      name: 'AI Logistics',
      sector: 'Logtech',
      status: 'En accompagnement',
      lastDiagnostic: '2025-01-07',
      alerts: [],
      fundingRequested: 1500000,
      fundingRaised: 450000,
      responsible: 'Marc Rousseau',
      stage: 'Seed',
      runway: 12,
      lastActivity: '2025-01-10',
      riskLevel: 'low'
    }
  ];
  
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M€`;
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short'
    }).format(date);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Levée en cours':
        return darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800';
      case 'En accompagnement':
        return darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800';
      case 'Levée terminée':
        return darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800';
      case 'En attente':
        return darkMode ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-800';
      default:
        return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };
  
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return darkMode ? 'text-red-400' : 'text-red-600';
      case 'medium':
        return darkMode ? 'text-amber-400' : 'text-amber-600';
      case 'low':
        return darkMode ? 'text-green-400' : 'text-green-600';
      default:
        return darkMode ? 'text-gray-400' : 'text-gray-500';
    }
  };
  
  const filteredStartups = startups.filter(startup => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'active') return startup.status === 'Levée en cours' || startup.status === 'En accompagnement';
    if (selectedFilter === 'alerts') return startup.alerts.length > 0;
    if (selectedFilter === 'risk') return startup.riskLevel === 'high';
    return true;
  });
  
  return (
    <div className={clsx(
      "py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto",
      darkMode ? "text-white" : "text-gray-900"
    )}>
      {/* Welcome banner */}
      <div className={clsx(
        "rounded-xl shadow-sm p-6 mb-8",
        darkMode ? "bg-gray-800" : "bg-white"
      )}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className={clsx(
              "text-2xl font-bold",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Dashboard Structure - Tech Incubator Paris
            </h1>
            <p className={clsx(
              "mt-1",
              darkMode ? "text-gray-300" : "text-gray-600"
            )}>
              Pilotez votre portefeuille de startups et optimisez vos accompagnements.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <button className={clsx(
              "btn-secondary flex items-center justify-center",
              darkMode ? "bg-gray-700 text-white hover:bg-gray-600" : ""
            )}>
              <FileText className="h-5 w-5 mr-2" />
              Synthèse d'aides
            </button>
            <button className={clsx(
              "btn-primary flex items-center justify-center",
              darkMode ? "bg-purple-600 hover:bg-purple-700" : ""
            )}>
              <Plus className="h-5 w-5 mr-2" />
              Ajouter une startup
            </button>
          </div>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={clsx(
          "rounded-xl shadow-sm p-6",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={clsx(
                "rounded-full p-2 mr-3",
                darkMode ? "bg-purple-900/30" : "bg-secondary-light"
              )}>
                <Building2 className={clsx(
                  "h-5 w-5",
                  darkMode ? "text-purple-400" : "text-primary"
                )} />
              </div>
              <div>
                <p className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Startups suivies
                </p>
                <p className={clsx(
                  "text-2xl font-bold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  {portfolioData.totalStartups}
                </p>
                <p className={clsx(
                  "text-xs",
                  darkMode ? "text-gray-500" : "text-gray-400"
                )}>
                  {portfolioData.activeStartups} actives
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className={clsx(
          "rounded-xl shadow-sm p-6",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={clsx(
                "rounded-full p-2 mr-3",
                darkMode ? "bg-green-900/30" : "bg-green-100"
              )}>
                <DollarSign className={clsx(
                  "h-5 w-5",
                  darkMode ? "text-green-400" : "text-green-600"
                )} />
              </div>
              <div>
                <p className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Montant levé
                </p>
                <p className={clsx(
                  "text-2xl font-bold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  {formatCurrency(portfolioData.totalFundingRaised)}
                </p>
                <p className={clsx(
                  "text-xs",
                  darkMode ? "text-gray-500" : "text-gray-400"
                )}>
                  sur {formatCurrency(portfolioData.totalFundingRequested)} recherchés
                </p>
              </div>
            </div>
            <div className="flex items-center text-green-500">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+23%</span>
            </div>
          </div>
        </div>
        
        <div className={clsx(
          "rounded-xl shadow-sm p-6",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={clsx(
                "rounded-full p-2 mr-3",
                darkMode ? "bg-blue-900/30" : "bg-blue-100"
              )}>
                <Target className={clsx(
                  "h-5 w-5",
                  darkMode ? "text-blue-400" : "text-blue-600"
                )} />
              </div>
              <div>
                <p className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Taux de succès
                </p>
                <p className={clsx(
                  "text-2xl font-bold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  {portfolioData.successRate}%
                </p>
                <p className={clsx(
                  "text-xs",
                  darkMode ? "text-gray-500" : "text-gray-400"
                )}>
                  Levées réussies
                </p>
              </div>
            </div>
            <div className="flex items-center text-green-500">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+5.2%</span>
            </div>
          </div>
        </div>
        
        <div className={clsx(
          "rounded-xl shadow-sm p-6",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={clsx(
                "rounded-full p-2 mr-3",
                portfolioData.activeAlerts > 5 
                  ? darkMode ? "bg-red-900/30" : "bg-red-100"
                  : darkMode ? "bg-amber-900/30" : "bg-amber-100"
              )}>
                <AlertTriangle className={clsx(
                  "h-5 w-5",
                  portfolioData.activeAlerts > 5 
                    ? darkMode ? "text-red-400" : "text-red-600"
                    : darkMode ? "text-amber-400" : "text-amber-600"
                )} />
              </div>
              <div>
                <p className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Alertes actives
                </p>
                <p className={clsx(
                  "text-2xl font-bold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  {portfolioData.activeAlerts}
                </p>
                <p className={clsx(
                  "text-xs",
                  darkMode ? "text-gray-500" : "text-gray-400"
                )}>
                  {portfolioData.highPriorityAlerts} prioritaires
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Performance KPIs */}
      <div className={clsx(
        "rounded-xl shadow-sm p-6 mb-8",
        darkMode ? "bg-gray-800" : "bg-white"
      )}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={clsx(
            "text-lg font-semibold",
            darkMode ? "text-white" : "text-gray-900"
          )}>
            Indicateurs de performance
          </h2>
          <div className="flex items-center gap-2">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={clsx(
                "text-sm border rounded-lg px-3 py-1",
                darkMode 
                  ? "bg-gray-700 border-gray-600 text-white" 
                  : "bg-white border-gray-300 text-gray-900"
              )}
            >
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="quarter">3 derniers mois</option>
              <option value="year">12 derniers mois</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <div key={index} className={clsx(
              "p-4 rounded-lg border",
              darkMode ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"
            )}>
              <div className="flex justify-between items-start mb-2">
                <span className={clsx(
                  "text-sm font-medium",
                  darkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  {kpi.name}
                </span>
                <div className={clsx(
                  "flex items-center text-xs font-medium",
                  kpi.trend === 'up' 
                    ? kpi.name.includes('Temps') ? 'text-green-500' : 'text-green-500'
                    : 'text-red-500'
                )}>
                  {kpi.trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(kpi.change)}%
                </div>
              </div>
              <p className={clsx(
                "text-xl font-bold mb-1",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                {kpi.value}
              </p>
              <p className={clsx(
                "text-xs",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}>
                {kpi.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Startups table - takes 3 columns */}
        <div className="lg:col-span-3">
          <div className={clsx(
            "rounded-xl shadow-sm overflow-hidden",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className={clsx(
                  "text-lg font-semibold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Portefeuille de startups
                </h2>
                <div className="flex items-center gap-2">
                  <select 
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className={clsx(
                      "text-sm border rounded-lg px-3 py-1",
                      darkMode 
                        ? "bg-gray-700 border-gray-600 text-white" 
                        : "bg-white border-gray-300 text-gray-900"
                    )}
                  >
                    <option value="all">Toutes ({startups.length})</option>
                    <option value="active">Actives ({startups.filter(s => s.status === 'Levée en cours' || s.status === 'En accompagnement').length})</option>
                    <option value="alerts">Avec alertes ({startups.filter(s => s.alerts.length > 0).length})</option>
                    <option value="risk">À risque ({startups.filter(s => s.riskLevel === 'high').length})</option>
                  </select>
                  <button className={clsx(
                    "btn-primary text-sm px-3 py-1 flex items-center",
                    darkMode ? "bg-purple-600 hover:bg-purple-700" : ""
                  )}>
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={clsx(
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                )}>
                  <tr>
                    <th scope="col" className={clsx(
                      "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider",
                      darkMode ? "text-gray-300" : "text-gray-500"
                    )}>
                      Startup / Projet
                    </th>
                    <th scope="col" className={clsx(
                      "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider",
                      darkMode ? "text-gray-300" : "text-gray-500"
                    )}>
                      Secteur & Statut
                    </th>
                    <th scope="col" className={clsx(
                      "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider",
                      darkMode ? "text-gray-300" : "text-gray-500"
                    )}>
                      Diagnostic & Alertes
                    </th>
                    <th scope="col" className={clsx(
                      "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider",
                      darkMode ? "text-gray-300" : "text-gray-500"
                    )}>
                      Financement
                    </th>
                    <th scope="col" className={clsx(
                      "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider",
                      darkMode ? "text-gray-300" : "text-gray-500"
                    )}>
                      Responsable
                    </th>
                    <th scope="col" className={clsx(
                      "px-6 py-3 text-right text-xs font-medium uppercase tracking-wider",
                      darkMode ? "text-gray-300" : "text-gray-500"
                    )}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={clsx(
                  "divide-y",
                  darkMode ? "bg-gray-800 divide-gray-700" : "bg-white divide-gray-200"
                )}>
                  {filteredStartups.map((startup) => (
                    <tr key={startup.id} className={clsx(
                      "hover:bg-opacity-50 transition-colors",
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    )}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={clsx(
                            "w-2 h-2 rounded-full mr-3",
                            getRiskColor(startup.riskLevel)
                          )} />
                          <div>
                            <div className={clsx(
                              "text-sm font-medium",
                              darkMode ? "text-white" : "text-gray-900"
                            )}>
                              {startup.name}
                            </div>
                            <div className={clsx(
                              "text-xs",
                              darkMode ? "text-gray-400" : "text-gray-500"
                            )}>
                              {startup.stage} • Runway: {startup.runway} mois
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className={clsx(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800"
                          )}>
                            {startup.sector}
                          </span>
                          <div>
                            <span className={clsx(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                              getStatusColor(startup.status)
                            )}>
                              {startup.status}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className={clsx(
                            "text-xs",
                            darkMode ? "text-gray-300" : "text-gray-700"
                          )}>
                            Dernier: {formatDate(startup.lastDiagnostic)}
                          </div>
                          {startup.alerts.length > 0 && (
                            <div className="space-y-1">
                              {startup.alerts.slice(0, 2).map((alert, index) => (
                                <div key={index} className={clsx(
                                  "text-xs px-2 py-1 rounded-full inline-flex items-center",
                                  alert.priority === 'high'
                                    ? darkMode ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-800"
                                    : alert.type === 'warning'
                                      ? darkMode ? "bg-amber-900/30 text-amber-300" : "bg-amber-100 text-amber-800"
                                      : darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-800"
                                )}>
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {alert.message}
                                </div>
                              ))}
                              {startup.alerts.length > 2 && (
                                <div className={clsx(
                                  "text-xs",
                                  darkMode ? "text-gray-400" : "text-gray-500"
                                )}>
                                  +{startup.alerts.length - 2} autres
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className={clsx(
                            "text-sm font-medium",
                            darkMode ? "text-white" : "text-gray-900"
                          )}>
                            {formatCurrency(startup.fundingRequested)}
                          </div>
                          {startup.fundingRaised > 0 && (
                            <div className={clsx(
                              "text-xs",
                              darkMode ? "text-green-400" : "text-green-600"
                            )}>
                              {formatCurrency(startup.fundingRaised)} levés
                            </div>
                          )}
                          <div className="w-full bg-gray-200 dark:bg-gray-600 h-1 rounded-full">
                            <div 
                              className="bg-primary dark:bg-purple-600 h-1 rounded-full"
                              style={{ width: `${(startup.fundingRaised / startup.fundingRequested) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={clsx(
                            "w-8 h-8 rounded-full flex items-center justify-center mr-2",
                            darkMode ? "bg-gray-700" : "bg-gray-100"
                          )}>
                            <span className={clsx(
                              "text-xs font-medium",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              {startup.responsible.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className={clsx(
                              "text-sm",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              {startup.responsible}
                            </div>
                            <div className={clsx(
                              "text-xs",
                              darkMode ? "text-gray-500" : "text-gray-400"
                            )}>
                              Activité: {formatDate(startup.lastActivity)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            className={clsx(
                              "p-2 rounded-full transition-colors",
                              darkMode 
                                ? "text-gray-400 hover:text-white hover:bg-gray-700" 
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            )}
                            title="Ouvrir fiche projet"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className={clsx(
                              "p-2 rounded-full transition-colors",
                              darkMode 
                                ? "text-gray-400 hover:text-purple-400 hover:bg-gray-700" 
                                : "text-gray-500 hover:text-primary hover:bg-gray-100"
                            )}
                            title="Lancer diagnostic IA"
                          >
                            <Zap className="h-4 w-4" />
                          </button>
                          <button
                            className={clsx(
                              "p-2 rounded-full transition-colors",
                              darkMode 
                                ? "text-gray-400 hover:text-white hover:bg-gray-700" 
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            )}
                            title="Générer rapport"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            className={clsx(
                              "p-2 rounded-full transition-colors",
                              darkMode 
                                ? "text-gray-400 hover:text-white hover:bg-gray-700" 
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
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
            
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className={clsx(
                "text-sm",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}>
                Affichage de {filteredStartups.length} sur {startups.length} startups
              </span>
              <button className={clsx(
                "text-sm font-medium hover:underline",
                darkMode ? "text-purple-400" : "text-primary"
              )}>
                Voir toutes les startups
              </button>
            </div>
          </div>
        </div>
        
        {/* Right sidebar - takes 1 column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className={clsx(
            "rounded-xl shadow-sm p-6",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <h3 className={clsx(
              "text-lg font-semibold mb-4",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Actions rapides
            </h3>
            
            <div className="space-y-3">
              <button className={clsx(
                "w-full flex items-center p-3 rounded-lg text-left transition-colors",
                darkMode 
                  ? "bg-gray-700 hover:bg-gray-600 text-white" 
                  : "bg-gray-50 hover:bg-gray-100 text-gray-900"
              )}>
                <Plus className="h-5 w-5 mr-3 text-primary dark:text-purple-400" />
                <div>
                  <p className="font-medium">Ajouter une startup</p>
                  <p className={clsx(
                    "text-xs",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Nouveau projet à accompagner
                  </p>
                </div>
              </button>
              
              <button className={clsx(
                "w-full flex items-center p-3 rounded-lg text-left transition-colors",
                darkMode 
                  ? "bg-gray-700 hover:bg-gray-600 text-white" 
                  : "bg-gray-50 hover:bg-gray-100 text-gray-900"
              )}>
                <FileText className="h-5 w-5 mr-3 text-primary dark:text-purple-400" />
                <div>
                  <p className="font-medium">Synthèse d'aides</p>
                  <p className={clsx(
                    "text-xs",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Aides disponibles et échéances
                  </p>
                </div>
              </button>
              
              <button className={clsx(
                "w-full flex items-center p-3 rounded-lg text-left transition-colors",
                darkMode 
                  ? "bg-gray-700 hover:bg-gray-600 text-white" 
                  : "bg-gray-50 hover:bg-gray-100 text-gray-900"
              )}>
                <BarChart3 className="h-5 w-5 mr-3 text-primary dark:text-purple-400" />
                <div>
                  <p className="font-medium">Rapport stratégique</p>
                  <p className={clsx(
                    "text-xs",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Performance du portefeuille
                  </p>
                </div>
              </button>
              
              <button className={clsx(
                "w-full flex items-center p-3 rounded-lg text-left transition-colors",
                darkMode 
                  ? "bg-gray-700 hover:bg-gray-600 text-white" 
                  : "bg-gray-50 hover:bg-gray-100 text-gray-900"
              )}>
                <Calendar className="h-5 w-5 mr-3 text-primary dark:text-purple-400" />
                <div>
                  <p className="font-medium">Calendrier échéances</p>
                  <p className={clsx(
                    "text-xs",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Deadlines et événements
                  </p>
                </div>
              </button>
            </div>
          </div>
          
          {/* Active Alerts */}
          <div className={clsx(
            "rounded-xl shadow-sm p-6",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={clsx(
                "text-lg font-semibold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Alertes prioritaires
              </h3>
              <div className="flex items-center">
                <span className={clsx(
                  "text-sm mr-2",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  {portfolioData.highPriorityAlerts} urgentes
                </span>
                <div className={clsx(
                  "w-2 h-2 rounded-full",
                  portfolioData.highPriorityAlerts > 0 ? "bg-red-500" : "bg-green-500"
                )} />
              </div>
            </div>
            
            <div className="space-y-3">
              {startups
                .filter(s => s.alerts.some(a => a.priority === 'high'))
                .slice(0, 3)
                .map((startup) => (
                  <div key={startup.id} className={clsx(
                    "p-3 rounded-lg border-l-4 transition-colors cursor-pointer",
                    startup.riskLevel === 'high'
                      ? darkMode 
                        ? "border-red-500 bg-red-900/10 hover:bg-red-900/20" 
                        : "border-red-400 bg-red-50 hover:bg-red-100"
                      : darkMode 
                        ? "border-amber-500 bg-amber-900/10 hover:bg-amber-900/20" 
                        : "border-amber-400 bg-amber-50 hover:bg-amber-100"
                  )}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={clsx(
                          "text-sm font-medium",
                          darkMode ? "text-white" : "text-gray-900"
                        )}>
                          {startup.name}
                        </p>
                        {startup.alerts.filter(a => a.priority === 'high').map((alert, index) => (
                          <p key={index} className={clsx(
                            "text-xs mt-1",
                            alert.priority === 'high'
                              ? darkMode ? "text-red-300" : "text-red-700"
                              : darkMode ? "text-amber-300" : "text-amber-700"
                          )}>
                            {alert.message}
                          </p>
                        ))}
                      </div>
                      <span className={clsx(
                        "text-xs px-2 py-1 rounded-full",
                        startup.riskLevel === 'high'
                          ? darkMode ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-700"
                          : darkMode ? "bg-amber-900/30 text-amber-300" : "bg-amber-100 text-amber-700"
                      )}>
                        {startup.riskLevel === 'high' ? 'Critique' : 'Attention'}
                      </span>
                    </div>
                  </div>
                ))}
              
              {startups.filter(s => s.alerts.some(a => a.priority === 'high')).length === 0 && (
                <div className={clsx(
                  "p-4 rounded-lg text-center",
                  darkMode ? "bg-green-900/10 text-green-300" : "bg-green-50 text-green-700"
                )}>
                  <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm font-medium">Aucune alerte critique</p>
                  <p className="text-xs mt-1">Votre portefeuille est en bonne santé</p>
                </div>
              )}
            </div>
            
            <button className={clsx(
              "w-full mt-4 text-sm font-medium hover:underline flex items-center justify-center",
              darkMode ? "text-purple-400" : "text-primary"
            )}>
              Voir toutes les alertes
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          {/* Recent Activity */}
          <div className={clsx(
            "rounded-xl shadow-sm p-6",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <h3 className={clsx(
              "text-lg font-semibold mb-4",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Activité récente
            </h3>
            
            <div className="space-y-3">
              {[
                {
                  action: 'Diagnostic IA généré',
                  startup: 'GreenTech Solutions',
                  time: '2 heures',
                  icon: Zap,
                  type: 'success'
                },
                {
                  action: 'Alerte runway critique',
                  startup: 'PropTech Innovations',
                  time: '4 heures',
                  icon: AlertTriangle,
                  type: 'warning'
                },
                {
                  action: 'Rapport téléchargé',
                  startup: 'MediScan SAS',
                  time: '5 heures',
                  icon: Download,
                  type: 'info'
                },
                {
                  action: 'Nouvelle startup ajoutée',
                  startup: 'AI Logistics',
                  time: '1 jour',
                  icon: Plus,
                  type: 'success'
                },
                {
                  action: 'Fiche projet mise à jour',
                  startup: 'FinanceBot',
                  time: '1 jour',
                  icon: FileText,
                  type: 'info'
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-center">
                  <div className={clsx(
                    "rounded-full p-2 mr-3",
                    activity.type === 'success'
                      ? darkMode ? "bg-green-900/30" : "bg-green-100"
                      : activity.type === 'warning'
                        ? darkMode ? "bg-amber-900/30" : "bg-amber-100"
                        : darkMode ? "bg-gray-700" : "bg-gray-100"
                  )}>
                    <activity.icon className={clsx(
                      "h-4 w-4",
                      activity.type === 'success'
                        ? darkMode ? "text-green-400" : "text-green-600"
                        : activity.type === 'warning'
                          ? darkMode ? "text-amber-400" : "text-amber-600"
                          : darkMode ? "text-gray-400" : "text-gray-500"
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className={clsx(
                      "text-sm",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      {activity.action}
                    </p>
                    <p className={clsx(
                      "text-xs",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      {activity.startup} • Il y a {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <button className={clsx(
              "w-full mt-4 text-sm font-medium hover:underline flex items-center justify-center",
              darkMode ? "text-purple-400" : "text-primary"
            )}>
              Voir toute l'activité
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          {/* Team & Collaboration */}
          <div className={clsx(
            "rounded-xl shadow-sm p-6",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <h3 className={clsx(
              "text-lg font-semibold mb-4",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Équipe & Collaboration
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserPlus className={clsx(
                    "h-5 w-5 mr-2",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )} />
                  <span className={clsx(
                    "text-sm",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Membres actifs
                  </span>
                </div>
                <span className={clsx(
                  "text-sm font-medium",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  8
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare className={clsx(
                    "h-5 w-5 mr-2",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )} />
                  <span className={clsx(
                    "text-sm",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Messages non lus
                  </span>
                </div>
                <span className={clsx(
                  "text-sm font-medium",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  3
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className={clsx(
                    "h-5 w-5 mr-2",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )} />
                  <span className={clsx(
                    "text-sm",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Échéances cette semaine
                  </span>
                </div>
                <span className={clsx(
                  "text-sm font-medium",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  5
                </span>
              </div>
            </div>
            
            <button className={clsx(
              "w-full mt-4 btn-secondary text-sm",
              darkMode ? "bg-gray-700 text-white hover:bg-gray-600" : ""
            )}>
              Gérer l'équipe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default B2BDashboard;