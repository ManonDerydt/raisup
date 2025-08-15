import React, { useState } from 'react';
import { Plus, FileText, BarChart3, AlertTriangle, CheckCircle, Clock, ExternalLink, Eye, Zap, Download, TrendingUp, Users, DollarSign, Target, Calendar, Building2, PieChart, Activity, ArrowUpRight, ArrowDownRight, Filter, MoreHorizontal, MessageSquare, UserPlus, Briefcase, Bell, ChevronRight, Search, Globe, Rocket, Shield, Award, Lightbulb, TrendingUp as Trending, Database, Settings, Mail, Phone } from 'lucide-react';
import clsx from 'clsx';

const B2BDashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeWidget, setActiveWidget] = useState('overview');
  
  // Check if dark mode is enabled
  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  }, []);
  
  // Enhanced portfolio data for B2B structure
  const portfolioData = {
    totalStartups: 47,
    activeStartups: 32,
    onboardedStartups: 28,
    pipelineStartups: 19,
    totalFundingRequested: 28500000,
    totalFundingRaised: 18700000,
    successfulExits: 8,
    activeAlerts: 12,
    highPriorityAlerts: 5,
    recentDiagnostics: 34,
    successRate: 82,
    averageTimeToFunding: 3.8,
    portfolioGrowth: 23.5,
    teamEngagement: 94,
    platformUsage: 87,
    monthlyDiagnostics: 156
  };
  
  // Enhanced KPIs for structure management
  const kpis = [
    {
      name: 'Taux de succès global',
      value: `${portfolioData.successRate}%`,
      change: 7.2,
      trend: 'up',
      description: 'Startups ayant levé avec succès',
      category: 'Performance'
    },
    {
      name: 'Temps moyen levée',
      value: `${portfolioData.averageTimeToFunding} mois`,
      change: -1.2,
      trend: 'up',
      description: 'Durée moyenne jusqu\'à la levée',
      category: 'Efficacité'
    },
    {
      name: 'Croissance portefeuille',
      value: `+${portfolioData.portfolioGrowth}%`,
      change: 5.8,
      trend: 'up',
      description: 'Évolution sur 12 mois',
      category: 'Développement'
    },
    {
      name: 'Engagement équipe',
      value: `${portfolioData.teamEngagement}%`,
      change: 8.3,
      trend: 'up',
      description: 'Utilisation plateforme équipe',
      category: 'Adoption'
    },
    {
      name: 'Diagnostics IA/mois',
      value: `${portfolioData.monthlyDiagnostics}`,
      change: 15.7,
      trend: 'up',
      description: 'Analyses automatisées',
      category: 'IA'
    },
    {
      name: 'Pipeline conversion',
      value: '68%',
      change: 4.1,
      trend: 'up',
      description: 'Pipeline → Accompagnement',
      category: 'Conversion'
    }
  ];
  
  // Enhanced startup data with more B2B relevant fields
  const startups = [
    {
      id: 1,
      name: 'MediScan SAS',
      sector: 'Healthtech',
      status: 'Levée en cours',
      stage: 'Seed',
      lastDiagnostic: '2025-01-10',
      alerts: [
        { type: 'deadline', message: 'Aide BPI expire dans 15j', priority: 'high' },
        { type: 'opportunity', message: 'Appel France 2030 compatible', priority: 'medium' }
      ],
      fundingRequested: 750000,
      fundingRaised: 0,
      responsible: 'Marie Dupont',
      internalCoach: 'Sophie Martin',
      runway: 8,
      lastActivity: '2025-01-12',
      riskLevel: 'medium',
      onboardingStatus: 'Complete',
      teamSize: 5,
      location: 'Paris',
      foundationDate: '2022-06-15',
      nextMilestone: 'Pitch investisseurs - 25 jan',
      kpis: {
        revenue: 45000,
        users: 1200,
        growth: 15
      }
    },
    {
      id: 2,
      name: 'GreenTech Solutions',
      sector: 'Greentech',
      status: 'En accompagnement',
      stage: 'Série A',
      lastDiagnostic: '2025-01-08',
      alerts: [
        { type: 'info', message: 'Diagnostic à jour', priority: 'low' }
      ],
      fundingRequested: 1200000,
      fundingRaised: 300000,
      responsible: 'Thomas Martin',
      internalCoach: 'Pierre Dubois',
      runway: 14,
      lastActivity: '2025-01-11',
      riskLevel: 'low',
      onboardingStatus: 'Complete',
      teamSize: 12,
      location: 'Lyon',
      foundationDate: '2021-03-10',
      nextMilestone: 'Due diligence - 5 fév',
      kpis: {
        revenue: 180000,
        users: 5600,
        growth: 28
      }
    },
    {
      id: 3,
      name: 'EduAI Platform',
      sector: 'Edtech',
      status: 'Levée terminée',
      stage: 'Pré-seed',
      lastDiagnostic: '2024-12-15',
      alerts: [
        { type: 'success', message: 'Levée finalisée avec succès', priority: 'low' }
      ],
      fundingRequested: 500000,
      fundingRaised: 500000,
      responsible: 'Sophie Leroy',
      internalCoach: 'Marie Dubois',
      runway: 18,
      lastActivity: '2024-12-20',
      riskLevel: 'low',
      onboardingStatus: 'Complete',
      teamSize: 8,
      location: 'Bordeaux',
      foundationDate: '2023-01-20',
      nextMilestone: 'Suivi post-levée - 15 fév',
      kpis: {
        revenue: 25000,
        users: 890,
        growth: 45
      }
    },
    {
      id: 4,
      name: 'FinanceBot',
      sector: 'Fintech',
      status: 'En attente',
      stage: 'Série A',
      lastDiagnostic: '2025-01-05',
      alerts: [
        { type: 'warning', message: 'Inactif depuis 10 jours', priority: 'medium' }
      ],
      fundingRequested: 2000000,
      fundingRaised: 0,
      responsible: 'Pierre Dubois',
      internalCoach: 'Jean Martin',
      runway: 6,
      lastActivity: '2025-01-09',
      riskLevel: 'medium',
      onboardingStatus: 'In Progress',
      teamSize: 15,
      location: 'Lille',
      foundationDate: '2020-09-12',
      nextMilestone: 'Relance équipe - 20 jan',
      kpis: {
        revenue: 320000,
        users: 8900,
        growth: 12
      }
    },
    {
      id: 5,
      name: 'PropTech Innovations',
      sector: 'Proptech',
      status: 'Levée en cours',
      stage: 'Seed',
      lastDiagnostic: '2025-01-12',
      alerts: [
        { type: 'risk', message: 'Runway critique < 3 mois', priority: 'high' },
        { type: 'deadline', message: 'Échéance due diligence', priority: 'high' }
      ],
      fundingRequested: 850000,
      fundingRaised: 0,
      responsible: 'Julie Bernard',
      internalCoach: 'Thomas Martin',
      runway: 2,
      lastActivity: '2025-01-12',
      riskLevel: 'high',
      onboardingStatus: 'Complete',
      teamSize: 6,
      location: 'Nantes',
      foundationDate: '2023-04-08',
      nextMilestone: 'Urgence financement - 30 jan',
      kpis: {
        revenue: 12000,
        users: 340,
        growth: 8
      }
    },
    {
      id: 6,
      name: 'AI Logistics',
      sector: 'Logtech',
      status: 'En accompagnement',
      stage: 'Seed',
      lastDiagnostic: '2025-01-07',
      alerts: [],
      fundingRequested: 1500000,
      fundingRaised: 450000,
      responsible: 'Marc Rousseau',
      internalCoach: 'Sophie Martin',
      runway: 12,
      lastActivity: '2025-01-10',
      riskLevel: 'low',
      onboardingStatus: 'Complete',
      teamSize: 9,
      location: 'Toulouse',
      foundationDate: '2022-11-03',
      nextMilestone: 'Série A prep - 15 mars',
      kpis: {
        revenue: 95000,
        users: 2100,
        growth: 22
      }
    }
  ];
  
  // Recent activities for structure management
  const recentActivities = [
    {
      id: 1,
      type: 'diagnostic',
      action: 'Diagnostic IA généré',
      startup: 'GreenTech Solutions',
      user: 'Pierre Dubois',
      time: '2 heures',
      icon: Zap,
      category: 'IA'
    },
    {
      id: 2,
      type: 'alert',
      action: 'Alerte runway critique',
      startup: 'PropTech Innovations',
      user: 'Système',
      time: '4 heures',
      icon: AlertTriangle,
      category: 'Risque'
    },
    {
      id: 3,
      type: 'report',
      action: 'Rapport téléchargé',
      startup: 'MediScan SAS',
      user: 'Marie Dupont',
      time: '5 heures',
      icon: Download,
      category: 'Export'
    },
    {
      id: 4,
      type: 'onboarding',
      action: 'Nouvelle startup ajoutée',
      startup: 'AI Logistics',
      user: 'Sophie Martin',
      time: '1 jour',
      icon: Plus,
      category: 'Onboarding'
    },
    {
      id: 5,
      type: 'update',
      action: 'Fiche projet mise à jour',
      startup: 'FinanceBot',
      user: 'Jean Martin',
      time: '1 jour',
      icon: FileText,
      category: 'Mise à jour'
    },
    {
      id: 6,
      type: 'meeting',
      action: 'Rendez-vous planifié',
      startup: 'EduAI Platform',
      user: 'Marie Dubois',
      time: '2 jours',
      icon: Calendar,
      category: 'Suivi'
    }
  ];
  
  // Upcoming deadlines and events
  const upcomingDeadlines = [
    {
      id: 1,
      title: 'Aide BPI France - MediScan',
      date: '2025-01-30',
      type: 'deadline',
      priority: 'high',
      startup: 'MediScan SAS',
      description: 'Dépôt dossier aide innovation'
    },
    {
      id: 2,
      title: 'Due diligence PropTech',
      date: '2025-02-05',
      type: 'milestone',
      priority: 'high',
      startup: 'PropTech Innovations',
      description: 'Finalisation documents investisseurs'
    },
    {
      id: 3,
      title: 'Board mensuel',
      date: '2025-02-15',
      type: 'meeting',
      priority: 'medium',
      startup: 'Structure',
      description: 'Conseil d\'administration mensuel'
    },
    {
      id: 4,
      title: 'France 2030 - Santé',
      date: '2025-06-30',
      type: 'opportunity',
      priority: 'medium',
      startup: 'Toutes',
      description: 'Appel à projets santé numérique'
    }
  ];
  
  // Team performance data
  const teamPerformance = [
    {
      name: 'Sophie Martin',
      role: 'Senior Coach',
      startupsManaged: 8,
      diagnosticsLaunched: 23,
      successRate: 87,
      lastActivity: '2025-01-12'
    },
    {
      name: 'Pierre Dubois',
      role: 'Investment Manager',
      startupsManaged: 6,
      diagnosticsLaunched: 18,
      successRate: 92,
      lastActivity: '2025-01-12'
    },
    {
      name: 'Marie Dubois',
      role: 'Business Coach',
      startupsManaged: 7,
      diagnosticsLaunched: 21,
      successRate: 79,
      lastActivity: '2025-01-11'
    },
    {
      name: 'Thomas Martin',
      role: 'Tech Advisor',
      startupsManaged: 5,
      diagnosticsLaunched: 15,
      successRate: 85,
      lastActivity: '2025-01-10'
    }
  ];
  
  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M€`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K€`;
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
    if (selectedFilter === 'pipeline') return startup.onboardingStatus === 'In Progress';
    return true;
  });
  
  return (
    <div className={clsx(
      "py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto",
      darkMode ? "text-white" : "text-gray-900"
    )}>
      {/* Welcome banner with structure info */}
      <div className={clsx(
        "rounded-xl shadow-sm p-6 mb-8",
        darkMode ? "bg-gray-800" : "bg-white"
      )}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start">
            <div className={clsx(
              "rounded-full p-3 mr-4",
              darkMode ? "bg-purple-900/30" : "bg-secondary-light"
            )}>
              <Building2 className={clsx(
                "h-8 w-8",
                darkMode ? "text-purple-400" : "text-primary"
              )} />
            </div>
            <div>
              <h1 className={clsx(
                "text-2xl font-bold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Tech Incubator Paris
              </h1>
              <p className={clsx(
                "mt-1",
                darkMode ? "text-gray-300" : "text-gray-600"
              )}>
                Dashboard de pilotage - Vue d'ensemble de votre activité d'accompagnement
              </p>
              <div className="flex items-center mt-2 space-x-4 text-sm">
                <span className={clsx(
                  "flex items-center",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  <Users className="h-4 w-4 mr-1" />
                  {portfolioData.totalStartups} startups
                </span>
                <span className={clsx(
                  "flex items-center",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  <Target className="h-4 w-4 mr-1" />
                  {portfolioData.successRate}% succès
                </span>
                <span className={clsx(
                  "flex items-center",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  <DollarSign className="h-4 w-4 mr-1" />
                  {formatCurrency(portfolioData.totalFundingRaised)} levés
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
            <button className={clsx(
              "btn-secondary flex items-center justify-center",
              darkMode ? "bg-gray-700 text-white hover:bg-gray-600" : ""
            )}>
              <FileText className="h-5 w-5 mr-2" />
              Rapport stratégique
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
      
      {/* Enhanced KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {kpis.map((kpi, index) => (
          <div key={index} className={clsx(
            "rounded-xl shadow-sm p-4",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <div className="flex justify-between items-start mb-2">
              <span className={clsx(
                "text-xs font-medium uppercase tracking-wider",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}>
                {kpi.category}
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
              "text-lg font-bold mb-1",
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
      
      {/* Main dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Portfolio overview - takes 3 columns */}
        <div className="lg:col-span-3 space-y-8">
          {/* Portfolio summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={clsx(
              "rounded-xl shadow-sm p-4",
              darkMode ? "bg-gray-800" : "bg-white"
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={clsx(
                    "text-sm",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Portefeuille total
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
                <Briefcase className={clsx(
                  "h-8 w-8",
                  darkMode ? "text-purple-400" : "text-primary"
                )} />
              </div>
            </div>
            
            <div className={clsx(
              "rounded-xl shadow-sm p-4",
              darkMode ? "bg-gray-800" : "bg-white"
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={clsx(
                    "text-sm",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Onboardées
                  </p>
                  <p className={clsx(
                    "text-2xl font-bold",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    {portfolioData.onboardedStartups}
                  </p>
                  <p className={clsx(
                    "text-xs",
                    darkMode ? "text-gray-500" : "text-gray-400"
                  )}>
                    vs {portfolioData.pipelineStartups} pipeline
                  </p>
                </div>
                <UserPlus className={clsx(
                  "h-8 w-8",
                  darkMode ? "text-green-400" : "text-green-600"
                )} />
              </div>
            </div>
            
            <div className={clsx(
              "rounded-xl shadow-sm p-4",
              darkMode ? "bg-gray-800" : "bg-white"
            )}>
              <div className="flex items-center justify-between">
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
                    sur {formatCurrency(portfolioData.totalFundingRequested)}
                  </p>
                </div>
                <DollarSign className={clsx(
                  "h-8 w-8",
                  darkMode ? "text-green-400" : "text-green-600"
                )} />
              </div>
            </div>
            
            <div className={clsx(
              "rounded-xl shadow-sm p-4",
              darkMode ? "bg-gray-800" : "bg-white"
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={clsx(
                    "text-sm",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Alertes actives
                  </p>
                  <p className={clsx(
                    "text-2xl font-bold",
                    portfolioData.highPriorityAlerts > 0 
                      ? darkMode ? "text-red-400" : "text-red-600"
                      : darkMode ? "text-white" : "text-gray-900"
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
                <AlertTriangle className={clsx(
                  "h-8 w-8",
                  portfolioData.highPriorityAlerts > 0 
                    ? darkMode ? "text-red-400" : "text-red-600"
                    : darkMode ? "text-amber-400" : "text-amber-600"
                )} />
              </div>
            </div>
          </div>
          
          {/* Startups table with enhanced features */}
          <div className={clsx(
            "rounded-xl shadow-sm overflow-hidden",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className={clsx(
                    "text-lg font-semibold",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Portefeuille de startups
                  </h2>
                  <p className={clsx(
                    "text-sm",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Gestion et suivi de vos projets accompagnés
                  </p>
                </div>
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
                    <option value="pipeline">Pipeline ({startups.filter(s => s.onboardingStatus === 'In Progress').length})</option>
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
                      Coach & Diagnostic
                    </th>
                    <th scope="col" className={clsx(
                      "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider",
                      darkMode ? "text-gray-300" : "text-gray-500"
                    )}>
                      Financement & KPIs
                    </th>
                    <th scope="col" className={clsx(
                      "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider",
                      darkMode ? "text-gray-300" : "text-gray-500"
                    )}>
                      Alertes & Échéances
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
                            "w-3 h-3 rounded-full mr-3",
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
                              {startup.stage} • {startup.teamSize} pers. • {startup.location}
                            </div>
                            <div className={clsx(
                              "text-xs mt-1",
                              darkMode ? "text-gray-500" : "text-gray-400"
                            )}>
                              Runway: {startup.runway} mois
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
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
                          <div className={clsx(
                            "text-xs",
                            startup.onboardingStatus === 'Complete' 
                              ? darkMode ? "text-green-400" : "text-green-600"
                              : darkMode ? "text-amber-400" : "text-amber-600"
                          )}>
                            {startup.onboardingStatus === 'Complete' ? '✓ Onboardé' : '⏳ En cours'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className={clsx(
                            "text-xs font-medium",
                            darkMode ? "text-gray-300" : "text-gray-700"
                          )}>
                            Coach: {startup.internalCoach}
                          </div>
                          <div className={clsx(
                            "text-xs",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            Diagnostic: {formatDate(startup.lastDiagnostic)}
                          </div>
                          <div className={clsx(
                            "text-xs",
                            darkMode ? "text-gray-500" : "text-gray-400"
                          )}>
                            Activité: {formatDate(startup.lastActivity)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
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
                              style={{ width: `${Math.min((startup.fundingRaised / startup.fundingRequested) * 100, 100)}%` }}
                            />
                          </div>
                          <div className={clsx(
                            "text-xs",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            CA: {formatCurrency(startup.kpis.revenue)} • {startup.kpis.users} users • +{startup.kpis.growth}%
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {startup.alerts.length > 0 ? (
                            <div className="space-y-1">
                              {startup.alerts.slice(0, 2).map((alert, index) => (
                                <div key={index} className={clsx(
                                  "text-xs px-2 py-1 rounded-full inline-flex items-center",
                                  alert.priority === 'high'
                                    ? darkMode ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-800"
                                    : alert.type === 'deadline'
                                      ? darkMode ? "bg-amber-900/30 text-amber-300" : "bg-amber-100 text-amber-800"
                                      : alert.type === 'opportunity'
                                        ? darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-800"
                                        : darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800"
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
                          ) : (
                            <div className={clsx(
                              "text-xs px-2 py-1 rounded-full inline-flex items-center",
                              darkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-800"
                            )}>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Aucune alerte
                            </div>
                          )}
                          <div className={clsx(
                            "text-xs",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            Prochaine étape: {startup.nextMilestone}
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
          
          {/* Upcoming Deadlines */}
          <div className={clsx(
            "rounded-xl shadow-sm p-6",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={clsx(
                "text-lg font-semibold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Échéances prioritaires
              </h3>
              <div className="flex items-center">
                <span className={clsx(
                  "text-sm mr-2",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  {upcomingDeadlines.filter(d => d.priority === 'high').length} urgentes
                </span>
                <div className={clsx(
                  "w-2 h-2 rounded-full",
                  upcomingDeadlines.filter(d => d.priority === 'high').length > 0 ? "bg-red-500" : "bg-green-500"
                )} />
              </div>
            </div>
            
            <div className="space-y-3">
              {upcomingDeadlines.slice(0, 4).map((deadline) => (
                <div key={deadline.id} className={clsx(
                  "p-3 rounded-lg border-l-4 transition-colors cursor-pointer",
                  deadline.priority === 'high'
                    ? darkMode 
                      ? "border-red-500 bg-red-900/10 hover:bg-red-900/20" 
                      : "border-red-400 bg-red-50 hover:bg-red-100"
                    : deadline.type === 'opportunity'
                      ? darkMode 
                        ? "border-blue-500 bg-blue-900/10 hover:bg-blue-900/20" 
                        : "border-blue-400 bg-blue-50 hover:bg-blue-100"
                      : darkMode 
                        ? "border-amber-500 bg-amber-900/10 hover:bg-amber-900/20" 
                        : "border-amber-400 bg-amber-50 hover:bg-amber-100"
                )}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={clsx(
                        "text-sm font-medium",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        {deadline.title}
                      </p>
                      <p className={clsx(
                        "text-xs mt-1",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        {deadline.description}
                      </p>
                      <div className="flex items-center mt-2">
                        <Calendar className={clsx(
                          "h-3 w-3 mr-1",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )} />
                        <span className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          {formatDate(deadline.date)}
                        </span>
                      </div>
                    </div>
                    <span className={clsx(
                      "text-xs px-2 py-1 rounded-full ml-2",
                      deadline.priority === 'high'
                        ? darkMode ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-700"
                        : darkMode ? "bg-amber-900/30 text-amber-300" : "bg-amber-100 text-amber-700"
                    )}>
                      {deadline.priority === 'high' ? 'Urgent' : 'Important'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <button className={clsx(
              "w-full mt-4 text-sm font-medium hover:underline flex items-center justify-center",
              darkMode ? "text-purple-400" : "text-primary"
            )}>
              Voir toutes les échéances
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          {/* Team Performance */}
          <div className={clsx(
            "rounded-xl shadow-sm p-6",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <h3 className={clsx(
              "text-lg font-semibold mb-4",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Performance équipe
            </h3>
            
            <div className="space-y-3">
              {teamPerformance.slice(0, 3).map((member, index) => (
                <div key={index} className={clsx(
                  "p-3 rounded-lg",
                  darkMode ? "bg-gray-700/50" : "bg-gray-50"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className={clsx(
                        "text-sm font-medium",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        {member.name}
                      </p>
                      <p className={clsx(
                        "text-xs",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        {member.role}
                      </p>
                    </div>
                    <span className={clsx(
                      "text-xs px-2 py-1 rounded-full",
                      member.successRate >= 85
                        ? darkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-700"
                        : darkMode ? "bg-amber-900/30 text-amber-300" : "bg-amber-100 text-amber-700"
                    )}>
                      {member.successRate}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className={clsx(
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        Startups
                      </span>
                      <p className={clsx(
                        "font-medium",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        {member.startupsManaged}
                      </p>
                    </div>
                    <div>
                      <span className={clsx(
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        Diagnostics
                      </span>
                      <p className={clsx(
                        "font-medium",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        {member.diagnosticsLaunched}
                      </p>
                    </div>
                    <div>
                      <span className={clsx(
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        Activité
                      </span>
                      <p className={clsx(
                        "font-medium",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        {formatDate(member.lastActivity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className={clsx(
              "w-full mt-4 text-sm font-medium hover:underline flex items-center justify-center",
              darkMode ? "text-purple-400" : "text-primary"
            )}>
              Gérer l'équipe
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
              {recentActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center">
                  <div className={clsx(
                    "rounded-full p-2 mr-3",
                    activity.type === 'diagnostic'
                      ? darkMode ? "bg-purple-900/30" : "bg-purple-100"
                      : activity.type === 'alert'
                        ? darkMode ? "bg-red-900/30" : "bg-red-100"
                        : activity.type === 'report'
                          ? darkMode ? "bg-blue-900/30" : "bg-blue-100"
                          : activity.type === 'onboarding'
                            ? darkMode ? "bg-green-900/30" : "bg-green-100"
                            : darkMode ? "bg-gray-700" : "bg-gray-100"
                  )}>
                    <activity.icon className={clsx(
                      "h-4 w-4",
                      activity.type === 'diagnostic'
                        ? darkMode ? "text-purple-400" : "text-purple-600"
                        : activity.type === 'alert'
                          ? darkMode ? "text-red-400" : "text-red-600"
                          : activity.type === 'report'
                            ? darkMode ? "text-blue-400" : "text-blue-600"
                            : activity.type === 'onboarding'
                              ? darkMode ? "text-green-400" : "text-green-600"
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
                      {activity.startup} • {activity.user} • Il y a {activity.time}
                    </p>
                  </div>
                  <span className={clsx(
                    "text-xs px-2 py-1 rounded-full",
                    darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                  )}>
                    {activity.category}
                  </span>
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
        </div>
      </div>
    </div>
  );
};

export default B2BDashboard;