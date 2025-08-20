import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Clock, 
  Bell, 
  ChevronRight,
  Mail,
  ExternalLink,
  Plus,
  Eye,
  Zap,
  Download,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Building2,
  Target,
  Activity,
  PieChart,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Filter,
  RefreshCw
} from 'lucide-react';
import clsx from 'clsx';

const B2BDashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showSecondaryKPIs, setShowSecondaryKPIs] = useState(false);
  const [showAllStartups, setShowAllStartups] = useState(false);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  
  // Check if dark mode is enabled
  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  }, []);
  
  // Mock data for the dashboard
  const dashboardData = {
    primaryKPIs: {
      totalStartups: 24,
      activeStartups: 18,
      totalAmountSought: 18500000,
      totalAmountRaised: 12300000,
      successRate: 67
    },
    secondaryKPIs: {
      avgTicketSize: 750000,
      avgTimeToFunding: 4.2,
      portfolioGrowth: 15,
      upToDateDiagnostics: 78,
      criticalAlerts: 7,
      newOpportunities: 12
    },
    recentStartups: [
      {
        id: 1,
        name: 'MediScan',
        sector: 'Healthtech',
        stage: 'Seed',
        status: 'En levée',
        responsible: 'Marie Dubois',
        amountSought: 750000,
        amountRaised: 150000,
        runway: 8,
        alerts: ['aide-expiring', 'runway-low'],
        lastActivity: '2025-01-12',
        progress: 20
      },
      {
        id: 2,
        name: 'GreenTech Solutions',
        sector: 'Greentech',
        stage: 'Série A',
        status: 'Accompagnée',
        responsible: 'Thomas Martin',
        amountSought: 2000000,
        amountRaised: 2000000,
        runway: 18,
        alerts: [],
        lastActivity: '2025-01-11',
        progress: 100
      },
      {
        id: 3,
        name: 'PropTech Innovations',
        sector: 'Proptech',
        stage: 'Pré-seed',
        status: 'Pipeline',
        responsible: 'Sophie Laurent',
        amountSought: 500000,
        amountRaised: 0,
        runway: 3,
        alerts: ['runway-critical', 'incomplete-docs'],
        lastActivity: '2025-01-09',
        progress: 0
      },
      {
        id: 4,
        name: 'FinanceAI',
        sector: 'Fintech',
        stage: 'Seed',
        status: 'Accompagnée',
        responsible: 'Jean Martin',
        amountSought: 1200000,
        amountRaised: 800000,
        runway: 12,
        alerts: [],
        lastActivity: '2025-01-12',
        progress: 67
      },
      {
        id: 5,
        name: 'EduTech Pro',
        sector: 'Edtech',
        stage: 'Série A',
        status: 'Alumni',
        responsible: 'Claire Rousseau',
        amountSought: 3000000,
        amountRaised: 3200000,
        runway: 24,
        alerts: ['success-story'],
        lastActivity: '2024-12-20',
        progress: 107
      }
    ],
    criticalAlerts: [
      {
        id: 1,
        type: 'runway-critical',
        startup: 'PropTech Innovations',
        message: 'Runway critique: moins de 3 mois restants',
        priority: 'high',
        time: '2 heures'
      },
      {
        id: 2,
        type: 'aide-expiring',
        startup: 'MediScan',
        message: 'Aide BPI France expire dans 15 jours',
        priority: 'high',
        time: '1 jour'
      },
      {
        id: 3,
        type: 'incomplete-docs',
        startup: 'PropTech Innovations',
        message: 'Documents de due diligence incomplets',
        priority: 'medium',
        time: '3 jours'
      },
      {
        id: 4,
        type: 'new-opportunity',
        startup: 'Général',
        message: 'Nouvel appel à projets France 2030 - Santé',
        priority: 'medium',
        time: '5 heures'
      }
    ],
    upcomingDeadlines: [
      {
        id: 1,
        title: 'Aide PM\'up Île-de-France',
        startup: 'PropTech Innovations',
        date: '2025-03-30',
        daysLeft: 45
      },
      {
        id: 2,
        title: 'Rapport trimestriel',
        startup: 'Général',
        date: '2025-03-31',
        daysLeft: 46
      },
      {
        id: 3,
        title: 'Renouvellement CIR',
        startup: 'MediScan',
        date: '2025-04-15',
        daysLeft: 61
      }
    ]
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
  
  // Get alert info
  const getAlertInfo = (alertType: string) => {
    switch (alertType) {
      case 'aide-expiring':
        return { icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' };
      case 'runway-low':
        return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' };
      case 'runway-critical':
        return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' };
      case 'incomplete-docs':
        return { icon: FileText, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' };
      case 'success-story':
        return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' };
      default:
        return { icon: AlertTriangle, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-900/30' };
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
  
  // Calculate funding progress
  const fundingProgress = (dashboardData.primaryKPIs.totalAmountRaised / dashboardData.primaryKPIs.totalAmountSought) * 100;
  
  return (
    <div className={clsx(
      "py-8 px-6 lg:px-8 max-w-[1400px] mx-auto",
      darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
    )}>
      {/* Header with quick actions - Sticky */}
      <div className={clsx(
        "sticky top-0 z-20 -mx-6 lg:-mx-8 px-6 lg:px-8 py-6 mb-8",
        darkMode ? "bg-gray-900/95 backdrop-blur-sm" : "bg-gray-50/95 backdrop-blur-sm"
      )}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-6 lg:mb-0">
            <h1 className={clsx(
              "text-3xl font-bold",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Vue d'ensemble
            </h1>
            <p className={clsx(
              "mt-2 text-lg",
              darkMode ? "text-gray-400" : "text-gray-600"
            )}>
              Pilotage stratégique de votre portefeuille d'accompagnement
            </p>
          </div>
          
          {/* Quick Actions - Always visible */}
          <div className="flex flex-wrap gap-3">
            <button className={clsx(
              "inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105",
              darkMode 
                ? "bg-purple-600 text-white hover:bg-purple-700 shadow-lg" 
                : "bg-primary text-white hover:bg-opacity-90 shadow-lg"
            )}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter startup
            </button>
            <button className={clsx(
              "inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105",
              darkMode 
                ? "bg-gray-700 text-white hover:bg-gray-600 shadow-lg" 
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-lg"
            )}>
              <FileText className="h-4 w-4 mr-2" />
              Synthèse d'aides
            </button>
            <button className={clsx(
              "inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105",
              darkMode 
                ? "bg-gray-700 text-white hover:bg-gray-600 shadow-lg" 
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-lg"
            )}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Rapport stratégique
            </button>
            <button className={clsx(
              "inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105",
              darkMode 
                ? "bg-gray-700 text-white hover:bg-gray-600 shadow-lg" 
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-lg"
            )}>
              <Calendar className="h-4 w-4 mr-2" />
              Calendrier
            </button>
          </div>
        </div>
      </div>
      
      {/* Primary KPIs - Hero Section */}
      <div className="mb-12">
        <h2 className={clsx(
          "text-xl font-semibold mb-6",
          darkMode ? "text-white" : "text-gray-900"
        )}>
          Indicateurs clés de performance
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main KPI Card - Larger */}
          <div className={clsx(
            "lg:col-span-2 p-8 rounded-2xl shadow-lg border",
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          )}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={clsx(
                  "text-lg font-medium",
                  darkMode ? "text-gray-300" : "text-gray-600"
                )}>
                  Performance globale du portefeuille
                </h3>
                <div className="flex items-center mt-2">
                  <span className={clsx(
                    "text-4xl font-bold",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    {dashboardData.primaryKPIs.successRate}%
                  </span>
                  <div className="ml-4 flex items-center">
                    <ArrowUpRight className="h-5 w-5 text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">+12%</span>
                  </div>
                </div>
                <p className={clsx(
                  "text-sm mt-1",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Taux de réussite des levées
                </p>
              </div>
              <div className={clsx(
                "p-4 rounded-2xl",
                darkMode ? "bg-green-900/30" : "bg-green-100"
              )}>
                <TrendingUp className={clsx(
                  "h-8 w-8",
                  darkMode ? "text-green-400" : "text-green-600"
                )} />
              </div>
            </div>
            
            {/* Mini chart visualization */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className={clsx(
                    darkMode ? "text-gray-400" : "text-gray-600"
                  )}>
                    Montant levé / recherché
                  </span>
                  <span className={clsx(
                    "font-medium",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    {formatCurrency(dashboardData.primaryKPIs.totalAmountRaised)} / {formatCurrency(dashboardData.primaryKPIs.totalAmountSought)}
                  </span>
                </div>
                <div className={clsx(
                  "h-3 rounded-full overflow-hidden",
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                )}>
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-green-400"
                    style={{ width: `${fundingProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className={clsx(
                    darkMode ? "text-gray-500" : "text-gray-400"
                  )}>
                    {Math.round(fundingProgress)}% de l'objectif atteint
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Startups Count */}
          <div className={clsx(
            "p-6 rounded-2xl shadow-lg border",
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          )}>
            <div className="flex items-center justify-between mb-4">
              <div className={clsx(
                "p-3 rounded-xl",
                darkMode ? "bg-blue-900/30" : "bg-blue-100"
              )}>
                <Building2 className={clsx(
                  "h-6 w-6",
                  darkMode ? "text-blue-400" : "text-blue-600"
                )} />
              </div>
            </div>
            <div>
              <p className={clsx(
                "text-sm font-medium",
                darkMode ? "text-gray-400" : "text-gray-600"
              )}>
                Startups accompagnées
              </p>
              <p className={clsx(
                "text-3xl font-bold mt-1",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                {dashboardData.primaryKPIs.totalStartups}
              </p>
              <div className="flex items-center mt-2">
                <span className={clsx(
                  "text-sm",
                  darkMode ? "text-green-400" : "text-green-600"
                )}>
                  {dashboardData.primaryKPIs.activeStartups} actives
                </span>
              </div>
            </div>
          </div>
          
          {/* Funding Amount */}
          <div className={clsx(
            "p-6 rounded-2xl shadow-lg border",
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          )}>
            <div className="flex items-center justify-between mb-4">
              <div className={clsx(
                "p-3 rounded-xl",
                darkMode ? "bg-green-900/30" : "bg-green-100"
              )}>
                <DollarSign className={clsx(
                  "h-6 w-6",
                  darkMode ? "text-green-400" : "text-green-600"
                )} />
              </div>
            </div>
            <div>
              <p className={clsx(
                "text-sm font-medium",
                darkMode ? "text-gray-400" : "text-gray-600"
              )}>
                Montant levé
              </p>
              <p className={clsx(
                "text-3xl font-bold mt-1",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                {formatCurrency(dashboardData.primaryKPIs.totalAmountRaised)}
              </p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 text-sm font-medium">+23%</span>
                <span className={clsx(
                  "text-sm ml-2",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  vs. trimestre précédent
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Secondary KPIs - Collapsible */}
        <div className="mt-8">
          <button
            onClick={() => setShowSecondaryKPIs(!showSecondaryKPIs)}
            className={clsx(
              "flex items-center text-sm font-medium transition-colors",
              darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
            )}
          >
            {showSecondaryKPIs ? (
              <ChevronUp className="h-4 w-4 mr-2" />
            ) : (
              <ChevronDown className="h-4 w-4 mr-2" />
            )}
            {showSecondaryKPIs ? 'Masquer' : 'Afficher'} les indicateurs détaillés
          </button>
          
          {showSecondaryKPIs && (
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-4">
              <div className={clsx(
                "p-4 rounded-xl",
                darkMode ? "bg-gray-800" : "bg-white shadow-sm"
              )}>
                <p className={clsx(
                  "text-xs",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Ticket moyen
                </p>
                <p className={clsx(
                  "text-lg font-bold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  {formatCurrency(dashboardData.secondaryKPIs.avgTicketSize)}
                </p>
              </div>
              
              <div className={clsx(
                "p-4 rounded-xl",
                darkMode ? "bg-gray-800" : "bg-white shadow-sm"
              )}>
                <p className={clsx(
                  "text-xs",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Temps moyen levée
                </p>
                <p className={clsx(
                  "text-lg font-bold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  {dashboardData.secondaryKPIs.avgTimeToFunding} mois
                </p>
              </div>
              
              <div className={clsx(
                "p-4 rounded-xl",
                darkMode ? "bg-gray-800" : "bg-white shadow-sm"
              )}>
                <p className={clsx(
                  "text-xs",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Croissance portefeuille
                </p>
                <p className={clsx(
                  "text-lg font-bold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  +{dashboardData.secondaryKPIs.portfolioGrowth}%
                </p>
              </div>
              
              <div className={clsx(
                "p-4 rounded-xl",
                darkMode ? "bg-gray-800" : "bg-white shadow-sm"
              )}>
                <p className={clsx(
                  "text-xs",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Diagnostics à jour
                </p>
                <p className={clsx(
                  "text-lg font-bold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  {dashboardData.secondaryKPIs.upToDateDiagnostics}%
                </p>
              </div>
              
              <div className={clsx(
                "p-4 rounded-xl",
                darkMode ? "bg-gray-800" : "bg-white shadow-sm"
              )}>
                <p className={clsx(
                  "text-xs",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Alertes critiques
                </p>
                <p className={clsx(
                  "text-lg font-bold",
                  dashboardData.secondaryKPIs.criticalAlerts > 0 ? "text-red-500" : darkMode ? "text-white" : "text-gray-900"
                )}>
                  {dashboardData.secondaryKPIs.criticalAlerts}
                </p>
              </div>
              
              <div className={clsx(
                "p-4 rounded-xl",
                darkMode ? "bg-gray-800" : "bg-white shadow-sm"
              )}>
                <p className={clsx(
                  "text-xs",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Nouvelles opportunités
                </p>
                <p className={clsx(
                  "text-lg font-bold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  {dashboardData.secondaryKPIs.newOpportunities}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Portfolio Overview */}
        <div className="xl:col-span-2 space-y-8">
          {/* Portfolio Summary */}
          <div className={clsx(
            "p-8 rounded-2xl shadow-lg border",
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          )}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={clsx(
                "text-xl font-semibold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Portefeuille Startups
              </h3>
              <div className="flex items-center space-x-3">
                <button className={clsx(
                  "text-sm font-medium hover:underline",
                  darkMode ? "text-purple-400" : "text-primary"
                )}>
                  Voir tout le portefeuille
                </button>
                <button className={clsx(
                  "p-2 rounded-lg transition-colors",
                  darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}>
                  <Filter className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Portfolio Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className={clsx(
                "text-center p-4 rounded-xl",
                darkMode ? "bg-gray-700/50" : "bg-gray-50"
              )}>
                <p className={clsx(
                  "text-2xl font-bold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  {dashboardData.primaryKPIs.activeStartups}
                </p>
                <p className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-400" : "text-gray-600"
                )}>
                  Actives
                </p>
              </div>
              <div className={clsx(
                "text-center p-4 rounded-xl",
                darkMode ? "bg-gray-700/50" : "bg-gray-50"
              )}>
                <p className={clsx(
                  "text-2xl font-bold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  {dashboardData.recentStartups.filter(s => s.alerts.length > 0).length}
                </p>
                <p className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-400" : "text-gray-600"
                )}>
                  Avec alertes
                </p>
              </div>
              <div className={clsx(
                "text-center p-4 rounded-xl",
                darkMode ? "bg-gray-700/50" : "bg-gray-50"
              )}>
                <p className={clsx(
                  "text-2xl font-bold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  {dashboardData.recentStartups.filter(s => s.status === 'Alumni').length}
                </p>
                <p className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-400" : "text-gray-600"
                )}>
                  Alumni
                </p>
              </div>
            </div>
            
            {/* Recent Startups List */}
            <div className="space-y-4">
              {dashboardData.recentStartups.slice(0, showAllStartups ? undefined : 3).map((startup) => (
                <div 
                  key={startup.id}
                  className={clsx(
                    "p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer",
                    darkMode ? "bg-gray-700/30 border-gray-600 hover:border-gray-500" : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className={clsx(
                          "font-medium",
                          darkMode ? "text-white" : "text-gray-900"
                        )}>
                          {startup.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={clsx(
                            "text-xs px-2 py-1 rounded-full",
                            getStatusColor(startup.status)
                          )}>
                            {startup.status}
                          </span>
                          <span className={clsx(
                            "text-xs",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            {startup.sector} • {startup.stage}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={clsx(
                          "text-sm font-medium",
                          darkMode ? "text-white" : "text-gray-900"
                        )}>
                          {formatCurrency(startup.amountRaised)} / {formatCurrency(startup.amountSought)}
                        </p>
                        <div className={clsx(
                          "w-24 h-1.5 rounded-full overflow-hidden mt-1",
                          darkMode ? "bg-gray-600" : "bg-gray-200"
                        )}>
                          <div 
                            className="h-full bg-primary"
                            style={{ width: `${startup.progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {startup.alerts.map((alert, index) => {
                          const alertInfo = getAlertInfo(alert);
                          return (
                            <div
                              key={index}
                              className={clsx(
                                "p-1.5 rounded-full",
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
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button className={clsx(
                          "p-2 rounded-lg transition-colors",
                          darkMode ? "bg-gray-600 text-gray-300 hover:bg-gray-500" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        )}>
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className={clsx(
                          "p-2 rounded-lg transition-colors",
                          darkMode ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-primary text-white hover:bg-opacity-90"
                        )}>
                          <Zap className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {dashboardData.recentStartups.length > 3 && (
                <button
                  onClick={() => setShowAllStartups(!showAllStartups)}
                  className={clsx(
                    "w-full py-3 text-sm font-medium rounded-xl transition-colors",
                    darkMode 
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {showAllStartups ? 'Voir moins' : `Voir les ${dashboardData.recentStartups.length - 3} autres startups`}
                </button>
              )}
            </div>
          </div>
          
          {/* Performance Chart Placeholder */}
          <div className={clsx(
            "p-8 rounded-2xl shadow-lg border",
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          )}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={clsx(
                "text-xl font-semibold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Performance du portefeuille
              </h3>
              <div className="flex items-center space-x-2">
                <select className={clsx(
                  "text-sm border rounded-lg px-3 py-1",
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                )}>
                  <option>3 derniers mois</option>
                  <option>6 derniers mois</option>
                  <option>12 derniers mois</option>
                </select>
              </div>
            </div>
            
            {/* Mock chart area */}
            <div className={clsx(
              "h-64 rounded-xl flex items-center justify-center",
              darkMode ? "bg-gray-700/30" : "bg-gray-50"
            )}>
              <div className="text-center">
                <BarChart3 className={clsx(
                  "h-12 w-12 mx-auto mb-4",
                  darkMode ? "text-gray-600" : "text-gray-400"
                )} />
                <p className={clsx(
                  "text-sm",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Graphique de performance - À venir
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Alerts & Quick Info */}
        <div className="space-y-8">
          {/* Critical Alerts */}
          <div className={clsx(
            "p-6 rounded-2xl shadow-lg border",
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          )}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={clsx(
                "text-lg font-semibold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Alertes critiques
              </h3>
              <div className={clsx(
                "px-3 py-1 rounded-full text-xs font-medium",
                dashboardData.criticalAlerts.filter(a => a.priority === 'high').length > 0
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              )}>
                {dashboardData.criticalAlerts.filter(a => a.priority === 'high').length} urgentes
              </div>
            </div>
            
            <div className="space-y-3">
              {dashboardData.criticalAlerts.slice(0, showAllAlerts ? undefined : 4).map((alert) => (
                <div 
                  key={alert.id}
                  className={clsx(
                    "p-4 rounded-xl border-l-4 transition-colors hover:bg-opacity-50",
                    alert.priority === 'high'
                      ? darkMode 
                        ? "bg-red-900/10 border-red-500 hover:bg-red-900/20" 
                        : "bg-red-50 border-red-500 hover:bg-red-100"
                      : darkMode 
                        ? "bg-amber-900/10 border-amber-500 hover:bg-amber-900/20" 
                        : "bg-amber-50 border-amber-500 hover:bg-amber-100"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={clsx(
                        "text-sm font-medium",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        {alert.startup}
                      </h4>
                      <p className={clsx(
                        "text-xs mt-1",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        {alert.message}
                      </p>
                      <p className={clsx(
                        "text-xs mt-2",
                        darkMode ? "text-gray-500" : "text-gray-400"
                      )}>
                        Il y a {alert.time}
                      </p>
                    </div>
                    <button className={clsx(
                      "ml-3 p-1 rounded-lg transition-colors",
                      darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"
                    )}>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {dashboardData.criticalAlerts.length > 4 && (
                <button
                  onClick={() => setShowAllAlerts(!showAllAlerts)}
                  className={clsx(
                    "w-full py-2 text-sm font-medium rounded-xl transition-colors",
                    darkMode 
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {showAllAlerts ? 'Voir moins' : `Voir les ${dashboardData.criticalAlerts.length - 4} autres alertes`}
                </button>
              )}
            </div>
          </div>
          
          {/* Upcoming Deadlines */}
          <div className={clsx(
            "p-6 rounded-2xl shadow-lg border",
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          )}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={clsx(
                "text-lg font-semibold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Échéances à venir
              </h3>
              <button className={clsx(
                "text-sm font-medium hover:underline",
                darkMode ? "text-purple-400" : "text-primary"
              )}>
                Voir le calendrier complet
              </button>
            </div>
            
            <div className="space-y-4">
              {dashboardData.upcomingDeadlines.map((deadline) => (
                <div 
                  key={deadline.id}
                  className={clsx(
                    "flex items-center p-4 rounded-xl transition-colors hover:bg-opacity-50",
                    deadline.daysLeft <= 30 
                      ? darkMode 
                        ? "bg-orange-900/20 hover:bg-orange-900/30" 
                        : "bg-orange-50 hover:bg-orange-100"
                      : darkMode 
                        ? "bg-gray-700/30 hover:bg-gray-700/50" 
                        : "bg-gray-50 hover:bg-gray-100"
                  )}
                >
                  <div className={clsx(
                    "p-2 rounded-lg mr-4",
                    deadline.daysLeft <= 30 
                      ? darkMode ? "bg-orange-900/50" : "bg-orange-100"
                      : darkMode ? "bg-gray-700" : "bg-gray-200"
                  )}>
                    <Calendar className={clsx(
                      "h-4 w-4",
                      deadline.daysLeft <= 30 
                        ? "text-orange-500" 
                        : darkMode ? "text-gray-400" : "text-gray-500"
                    )} />
                  </div>
                  <div className="flex-1">
                    <h4 className={clsx(
                      "text-sm font-medium",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      {deadline.title}
                    </h4>
                    <p className={clsx(
                      "text-xs",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      {deadline.startup} • Dans {deadline.daysLeft} jours
                    </p>
                  </div>
                  <div className={clsx(
                    "text-xs font-medium px-2 py-1 rounded-full",
                    deadline.daysLeft <= 30 
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  )}>
                    {deadline.daysLeft}j
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Quick Actions Panel */}
          <div className={clsx(
            "p-6 rounded-2xl shadow-lg border",
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          )}>
            <h3 className={clsx(
              "text-lg font-semibold mb-6",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Actions rapides
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <button className={clsx(
                "p-4 rounded-xl text-left transition-all hover:scale-105",
                darkMode ? "bg-purple-900/30 hover:bg-purple-900/50" : "bg-secondary-lighter hover:bg-opacity-80"
              )}>
                <Zap className={clsx(
                  "h-6 w-6 mb-2",
                  darkMode ? "text-purple-400" : "text-primary"
                )} />
                <h4 className={clsx(
                  "font-medium text-sm",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Diagnostic IA groupé
                </h4>
                <p className={clsx(
                  "text-xs mt-1",
                  darkMode ? "text-gray-400" : "text-gray-600"
                )}>
                  Lancer pour 5 startups
                </p>
              </button>
              
              <button className={clsx(
                "p-4 rounded-xl text-left transition-all hover:scale-105",
                darkMode ? "bg-blue-900/30 hover:bg-blue-900/50" : "bg-blue-50 hover:bg-blue-100"
              )}>
                <Download className={clsx(
                  "h-6 w-6 mb-2",
                  darkMode ? "text-blue-400" : "text-blue-600"
                )} />
                <h4 className={clsx(
                  "font-medium text-sm",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Export portefeuille
                </h4>
                <p className={clsx(
                  "text-xs mt-1",
                  darkMode ? "text-gray-400" : "text-gray-600"
                )}>
                  Rapport Excel/PDF
                </p>
              </button>
              
              <button className={clsx(
                "p-4 rounded-xl text-left transition-all hover:scale-105",
                darkMode ? "bg-green-900/30 hover:bg-green-900/50" : "bg-green-50 hover:bg-green-100"
              )}>
                <Target className={clsx(
                  "h-6 w-6 mb-2",
                  darkMode ? "text-green-400" : "text-green-600"
                )} />
                <h4 className={clsx(
                  "font-medium text-sm",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Nouvelles opportunités
                </h4>
                <p className={clsx(
                  "text-xs mt-1",
                  darkMode ? "text-gray-400" : "text-gray-600"
                )}>
                  12 aides détectées
                </p>
              </button>
              
              <button className={clsx(
                "p-4 rounded-xl text-left transition-all hover:scale-105",
                darkMode ? "bg-amber-900/30 hover:bg-amber-900/50" : "bg-amber-50 hover:bg-amber-100"
              )}>
                <RefreshCw className={clsx(
                  "h-6 w-6 mb-2",
                  darkMode ? "text-amber-400" : "text-amber-600"
                )} />
                <h4 className={clsx(
                  "font-medium text-sm",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Actualiser la veille
                </h4>
                <p className={clsx(
                  "text-xs mt-1",
                  darkMode ? "text-gray-400" : "text-gray-600"
                )}>
                  Dernière MAJ: 2h
                </p>
              </button>
            </div>
          </div>
        </div>
        
        {/* Right Column - Summary & Insights */}
        <div className="space-y-8">
          {/* Portfolio Health Score */}
          <div className={clsx(
            "p-6 rounded-2xl shadow-lg border",
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          )}>
            <div className="text-center">
              <h3 className={clsx(
                "text-lg font-semibold mb-4",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Score de santé du portefeuille
              </h3>
              
              {/* Circular progress indicator */}
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke={darkMode ? "#374151" : "#e5e7eb"}
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#d3efdd"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - 0.82)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={clsx(
                    "text-2xl font-bold",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    82%
                  </span>
                </div>
              </div>
              
              <p className={clsx(
                "text-sm",
                darkMode ? "text-gray-400" : "text-gray-600"
              )}>
                Excellent état de santé
              </p>
              
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className={clsx(
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Diagnostics à jour
                  </span>
                  <span className="text-green-500">78%</span>
                </div>
                <div className="flex justify-between">
                  <span className={clsx(
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Runway moyen
                  </span>
                  <span className="text-green-500">12.3 mois</span>
                </div>
                <div className="flex justify-between">
                  <span className={clsx(
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Taux de réussite
                  </span>
                  <span className="text-green-500">67%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className={clsx(
            "p-6 rounded-2xl shadow-lg border",
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          )}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={clsx(
                "text-lg font-semibold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Activité récente
              </h3>
              <button className={clsx(
                "text-sm font-medium hover:underline",
                darkMode ? "text-purple-400" : "text-primary"
              )}>
                Voir tout
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  type: 'diagnostic',
                  startup: 'FinanceAI',
                  action: 'Diagnostic IA terminé',
                  time: '2 heures',
                  icon: Activity
                },
                {
                  id: 2,
                  type: 'funding',
                  startup: 'GreenTech Solutions',
                  action: 'Levée de fonds finalisée',
                  time: '1 jour',
                  icon: DollarSign
                },
                {
                  id: 3,
                  type: 'document',
                  startup: 'MediScan',
                  action: 'Nouveau document uploadé',
                  time: '2 jours',
                  icon: FileText
                },
                {
                  id: 4,
                  type: 'meeting',
                  startup: 'PropTech Innovations',
                  action: 'Rendez-vous planifié',
                  time: '3 jours',
                  icon: Calendar
                }
              ].map((activity) => (
                <div key={activity.id} className="flex items-center">
                  <div className={clsx(
                    "p-2 rounded-lg mr-3",
                    activity.type === 'diagnostic'
                      ? darkMode ? "bg-purple-900/30" : "bg-secondary-lighter"
                      : activity.type === 'funding'
                        ? darkMode ? "bg-green-900/30" : "bg-green-100"
                        : activity.type === 'document'
                          ? darkMode ? "bg-blue-900/30" : "bg-blue-100"
                          : darkMode ? "bg-amber-900/30" : "bg-amber-100"
                  )}>
                    <activity.icon className={clsx(
                      "h-4 w-4",
                      activity.type === 'diagnostic'
                        ? darkMode ? "text-purple-400" : "text-primary"
                        : activity.type === 'funding'
                          ? darkMode ? "text-green-400" : "text-green-600"
                          : activity.type === 'document'
                            ? darkMode ? "text-blue-400" : "text-blue-600"
                            : darkMode ? "text-amber-400" : "text-amber-600"
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className={clsx(
                      "text-sm font-medium",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      {activity.startup}
                    </p>
                    <p className={clsx(
                      "text-xs",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      {activity.action}
                    </p>
                  </div>
                  <span className={clsx(
                    "text-xs",
                    darkMode ? "text-gray-500" : "text-gray-400"
                  )}>
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* AI Insights */}
          <div className={clsx(
            "p-6 rounded-2xl shadow-lg border",
            darkMode ? "bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-800/30" : "bg-gradient-to-br from-secondary-lighter/30 to-blue-50 border-primary/20"
          )}>
            <div className="flex items-center mb-4">
              <div className={clsx(
                "p-2 rounded-lg mr-3",
                darkMode ? "bg-purple-900/50" : "bg-white"
              )}>
                <Sparkles className={clsx(
                  "h-5 w-5",
                  darkMode ? "text-purple-400" : "text-primary"
                )} />
              </div>
              <h3 className={clsx(
                "text-lg font-semibold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Insights IA
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className={clsx(
                "p-4 rounded-xl",
                darkMode ? "bg-gray-800/50" : "bg-white/70"
              )}>
                <h4 className={clsx(
                  "text-sm font-medium mb-2",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Recommandation prioritaire
                </h4>
                <p className={clsx(
                  "text-xs",
                  darkMode ? "text-gray-300" : "text-gray-600"
                )}>
                  3 startups de votre portefeuille sont éligibles à l'appel France 2030 - Santé Numérique. Deadline dans 8 mois.
                </p>
                <button className={clsx(
                  "mt-3 text-xs font-medium hover:underline",
                  darkMode ? "text-purple-400" : "text-primary"
                )}>
                  Voir les détails →
                </button>
              </div>
              
              <div className={clsx(
                "p-4 rounded-xl",
                darkMode ? "bg-gray-800/50" : "bg-white/70"
              )}>
                <h4 className={clsx(
                  "text-sm font-medium mb-2",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Tendance du marché
                </h4>
                <p className={clsx(
                  "text-xs",
                  darkMode ? "text-gray-300" : "text-gray-600"
                )}>
                  Le secteur Healthtech montre une croissance de +34% en Q1. Opportunité pour MediScan et 2 autres projets.
                </p>
                <button className={clsx(
                  "mt-3 text-xs font-medium hover:underline",
                  darkMode ? "text-purple-400" : "text-primary"
                )}>
                  Analyser l'impact →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default B2BDashboard;