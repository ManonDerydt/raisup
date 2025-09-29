import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TrendingUp,
  DollarSign,
  Building2,
  Target,
  AlertTriangle,
  Zap,
  Download,
  Filter,
  RefreshCw,
  ChevronUp,
  Sparkles,
  LayoutDashboard,
  X,
  Send
} from 'lucide-react';
import clsx from 'clsx';

const B2BDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('quarterly');
  const [darkMode, setDarkMode] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  
  // Check if dark mode is enabled
  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  }, []);
  
  // Mock data for the B2B dashboard
  const dashboardData = {
    totalStartups: 24,
    activeStartups: 18,
    totalAmountSought: 18500000,
    totalAmountRaised: 12300000,
    successRate: 67,
    averageTime: 8.5,
    criticalAlerts: 7,
    upcomingDeadlines: 12,
    newOpportunities: 5,
    portfolioGrowth: 15.2
  };
  
  // Performance data based on selected period
  const getPerformanceData = () => {
    switch (selectedPeriod) {
      case 'monthly':
        return {
          labels: ['Oct', 'Nov', 'Déc', 'Jan'],
          amountsRaised: [850000, 1200000, 950000, 1100000],
          newStartups: [2, 3, 1, 4],
          maxAmount: 1500000
        };
      case 'quarterly':
        return {
          labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'],
          amountsRaised: [2800000, 3200000, 2900000, 3400000],
          newStartups: [6, 8, 5, 9],
          maxAmount: 4000000
        };
      case 'annual':
        return {
          labels: ['2021', '2022', '2023', '2024'],
          amountsRaised: [8500000, 11200000, 9800000, 12300000],
          newStartups: [18, 22, 19, 28],
          maxAmount: 15000000
        };
    }
  };
  
  const performanceData = getPerformanceData();
  
  // Recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'funding_raised',
      startup: 'MediScan',
      amount: 750000,
      investor: 'Venture Capital Partners',
      time: '2 heures',
      status: 'success'
    },
    {
      id: 2,
      type: 'new_startup',
      startup: 'EcoTech Solutions',
      sector: 'Greentech',
      time: '5 heures',
      status: 'new'
    },
    {
      id: 3,
      type: 'alert',
      startup: 'PropTech Innovations',
      message: 'Runway critique (< 3 mois)',
      time: '1 jour',
      status: 'warning'
    },
    {
      id: 4,
      type: 'aid_deadline',
      aid: 'France 2030 - Santé Numérique',
      deadline: '15 jours',
      time: '2 jours',
      status: 'info'
    }
  ];
  
  // Upcoming deadlines
  const upcomingDeadlines = [
    {
      id: 1,
      title: 'Aide BPI France - MediScan',
      date: '2025-01-25',
      type: 'aid_deadline',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Rapport trimestriel',
      date: '2025-01-30',
      type: 'report',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Comité d\'investissement',
      date: '2025-02-05',
      type: 'meeting',
      priority: 'high'
    }
  ];
  
  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M€`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K€`;
    }
    return `${amount}€`;
  };
  
  // Handle startup invitation
  const handleInviteStartup = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setInviteLoading(false);
      setInviteSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteSuccess(false);
      }, 2000);
    }, 1000);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  };
  
  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'funding_raised':
        return <DollarSign className="h-5 w-5" />;
      case 'new_startup':
        return <Building2 className="h-5 w-5" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5" />;
      case 'aid_deadline':
        return <Calendar className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };
  
  // Get activity color
  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success':
        return darkMode ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-600";
      case 'warning':
        return darkMode ? "bg-orange-900/30 text-orange-400" : "bg-orange-100 text-orange-600";
      case 'info':
        return darkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-600";
      case 'new':
        return darkMode ? "bg-purple-900/30 text-purple-400" : "bg-secondary-light text-primary";
      default:
        return darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600";
    }
  };
  
  return (
    <div className="py-10 px-6 sm:px-8 lg:px-10 max-w-7xl mx-auto">
      {/* Header avec alignement amélioré */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Vue d'ensemble
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Pilotage global de votre portefeuille de startups
          </p>
        </div>
        <div className="mt-6 md:mt-0 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => navigate('/dashboard/b2b/funding-synthesis')}
            className="btn-secondary bg-secondary-lighter hover:bg-opacity-80 flex items-center justify-center px-6 py-3"
          >
            <FileText className="h-5 w-5 mr-2" />
            Synthèse d'aides
          </button>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="btn-primary flex items-center justify-center px-6 py-3"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une startup
          </button>
        </div>
      </div>
      
      {/* KPIs avec espacement harmonisé */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Startups accompagnées
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {dashboardData.totalStartups}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {dashboardData.activeStartups} actives
              </p>
            </div>
            <div className="bg-secondary-light dark:bg-purple-900/30 p-4 rounded-full">
              <Building2 className="h-6 w-6 text-primary dark:text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Montant levé total
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(dashboardData.totalAmountRaised)}
              </p>
              <div className="flex items-center mt-1">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">+{dashboardData.portfolioGrowth}%</span>
              </div>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Taux de succès
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {dashboardData.successRate}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Levées réussies
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Alertes critiques
              </p>
              <p className={clsx(
                "text-3xl font-bold",
                dashboardData.criticalAlerts > 0 
                  ? "text-orange-500" 
                  : "text-gray-900 dark:text-white"
              )}>
                {dashboardData.criticalAlerts}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Nécessitent action
              </p>
            </div>
            <div className={clsx(
              "p-4 rounded-full",
              dashboardData.criticalAlerts > 0 
                ? "bg-orange-100 dark:bg-orange-900/30" 
                : "bg-gray-100 dark:bg-gray-700"
            )}>
              <AlertTriangle className={clsx(
                "h-6 w-6",
                dashboardData.criticalAlerts > 0 
                  ? "text-orange-500" 
                  : "text-gray-500 dark:text-gray-400"
              )} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Jauge de performance avec couleurs de la charte */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Indicateurs clés de performance
          </h2>
          <span className="text-lg font-semibold text-primary dark:text-purple-400">
            {dashboardData.successRate}% de réussite
          </span>
        </div>
        
        <div className="mb-8">
          <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary-lighter transition-all duration-1000 ease-out"
              style={{ width: `${dashboardData.successRate}%` }}
            />
          </div>
          <div className="flex justify-between text-sm mt-3">
            <span className="text-gray-600 dark:text-gray-400">Performance globale</span>
            <span className="font-semibold text-primary dark:text-purple-400">
              {dashboardData.successRate}% de taux de succès
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Montant moyen levé</span>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {formatCurrency(dashboardData.totalAmountRaised / dashboardData.totalStartups)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Temps moyen</span>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {dashboardData.averageTime} mois
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Croissance</span>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2 flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 mr-1" />
              +{dashboardData.portfolioGrowth}%
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Nouvelles opportunités</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {dashboardData.newOpportunities}
            </p>
          </div>
        </div>
      </div>
      
      {/* Section Performance du portefeuille avec graphiques dynamiques */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
            Performance du portefeuille
          </h2>
          
          {/* Sélecteur de période */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            {[
              { key: 'monthly', label: 'Mensuel' },
              { key: 'quarterly', label: 'Trimestriel' },
              { key: 'annual', label: 'Annuel' }
            ].map((period) => (
              <button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key as any)}
                className={clsx(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  selectedPeriod === period.key
                    ? "bg-primary dark:bg-purple-600 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Graphique montants levés */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              Montants levés
            </h3>
            <div className="space-y-4">
              {performanceData.labels.map((label, index) => (
                <div key={label} className="flex items-center">
                  <div className="w-20 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary-lighter transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                        style={{ 
                          width: `${(performanceData.amountsRaised[index] / performanceData.maxAmount) * 100}%`,
                          animationDelay: `${index * 200}ms`
                        }}
                      >
                        <span className="text-white text-xs font-semibold">
                          {formatCurrency(performanceData.amountsRaised[index])}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-24 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(performanceData.amountsRaised[index])}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Graphique nouvelles startups */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              Nouvelles startups accompagnées
            </h3>
            <div className="space-y-4">
              {performanceData.labels.map((label, index) => (
                <div key={label} className="flex items-center">
                  <div className="w-20 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-secondary-lighter to-highlight transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                        style={{ 
                          width: `${(performanceData.newStartups[index] / Math.max(...performanceData.newStartups)) * 100}%`,
                          animationDelay: `${index * 200}ms`
                        }}
                      >
                        <span className="text-primary text-xs font-semibold">
                          {performanceData.newStartups[index]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-24 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    {performanceData.newStartups[index]} startups
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Actions rapides avec navigation interactive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <button 
          onClick={() => navigate('/dashboard/b2b/portfolio')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 hover:shadow-lg hover:scale-105 transition-all duration-200 text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full group-hover:scale-110 transition-transform duration-200">
              <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary dark:group-hover:text-purple-400 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Voir le portefeuille
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Gestion complète de vos {dashboardData.totalStartups} startups
          </p>
        </button>
        
        <button 
          onClick={() => navigate('/dashboard/b2b/reports')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 hover:shadow-lg hover:scale-105 transition-all duration-200 text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full group-hover:scale-110 transition-transform duration-200">
              <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary dark:group-hover:text-purple-400 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Rapports stratégiques
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Analytics et exports détaillés
          </p>
        </button>
        
        <button 
          onClick={() => navigate('/dashboard/b2b/calendar')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 hover:shadow-lg hover:scale-105 transition-all duration-200 text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full group-hover:scale-110 transition-transform duration-200">
              <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary dark:group-hover:text-purple-400 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Calendrier
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {dashboardData.upcomingDeadlines} échéances à venir
          </p>
        </button>
        
        <button 
          onClick={() => navigate('/dashboard/b2b/funding-synthesis')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 hover:shadow-lg hover:scale-105 transition-all duration-200 text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full group-hover:scale-110 transition-transform duration-200">
              <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary dark:group-hover:text-purple-400 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Synthèse d'aides
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {dashboardData.newOpportunities} nouvelles opportunités
          </p>
        </button>
      </div>
      
      {/* Contenu principal avec espacement amélioré */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Colonne gauche - Activités récentes */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Activités récentes
              </h2>
              <button className="text-sm font-medium text-primary dark:text-purple-400 hover:underline">
                Voir tout
              </button>
            </div>
            
            <div className="space-y-6">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors duration-200">
                  <div className={clsx(
                    "rounded-full p-3 mr-4 flex-shrink-0",
                    getActivityColor(activity.status)
                  )}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {activity.startup || activity.aid}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {activity.type === 'funding_raised' && `Levée de ${formatCurrency(activity.amount!)} avec ${activity.investor}`}
                          {activity.type === 'new_startup' && `Nouvelle startup ${activity.sector}`}
                          {activity.type === 'alert' && activity.message}
                          {activity.type === 'aid_deadline' && `Échéance dans ${activity.deadline}`}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Il y a {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Colonne droite - Échéances et alertes */}
        <div className="space-y-10">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Échéances importantes
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {upcomingDeadlines.length} à venir
              </span>
            </div>
            
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div 
                  key={deadline.id} 
                  className={clsx(
                    "p-4 rounded-xl border-l-4 transition-colors duration-200",
                    deadline.priority === 'high'
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10"
                      : "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {deadline.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        {formatDate(deadline.date)}
                      </p>
                    </div>
                    <span className={clsx(
                      "text-xs px-2 py-1 rounded-full font-medium",
                      deadline.priority === 'high'
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    )}>
                      {deadline.priority === 'high' ? 'Urgent' : 'Normal'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => navigate('/dashboard/b2b/calendar')}
              className="w-full mt-6 text-sm font-medium text-primary dark:text-purple-400 hover:underline flex items-center justify-center"
            >
              Voir le calendrier complet
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
            <Eye className="h-5 w-5 text-primary dark:text-purple-400" />
          {/* Actions rapides */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">
              Actions rapides
            </h2>
            
            <div className="space-y-4">
              <button 
                onClick={() => navigate('/dashboard/b2b/portfolio?action=diagnostic')}
                className="w-full p-4 bg-secondary-light dark:bg-purple-900/20 rounded-xl hover:bg-opacity-80 transition-all duration-200 text-left group"
              >
                <div className="flex items-center">
                <Zap className="h-4 w-4 text-primary dark:text-purple-400 mr-3" />
                  <div>
                    <p className="font-semibold text-primary dark:text-purple-400">
                      Diagnostic IA groupé
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Analyser tout le portefeuille
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-primary dark:text-purple-400 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/dashboard/b2b/reports?type=monthly')}
                className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-left group"
              >
                <div className="flex items-center">
                <Download className="h-4 w-4 text-gray-600 dark:text-gray-400 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Export rapport mensuel
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Générer le rapport automatique
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/dashboard/b2b/funding-synthesis?filter=expiring')}
                className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-left group"
              >
                <div className="flex items-center">
                <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-400 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Actualiser la veille
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Nouvelles aides disponibles
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    
    {/* Modal d'invitation startup */}
    {showInviteModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={clsx(
          "bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6",
          "transform transition-all duration-300 scale-100"
        )}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-secondary-light dark:bg-purple-900/30 p-2 rounded-full mr-3">
                <Mail className="h-5 w-5 text-primary dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Inviter une startup
              </h3>
            </div>
            <button
              onClick={() => setShowInviteModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {inviteSuccess ? (
            <div className="text-center py-8">
              <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Invitation envoyée !
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                La startup recevra un email d'invitation pour s'inscrire sur la plateforme.
              </p>
            </div>
          ) : (
            <form onSubmit={handleInviteStartup}>
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Envoyez une invitation à une startup pour qu'elle s'inscrive directement sur la plateforme et rejoigne votre portefeuille.
                </p>
                
                <label htmlFor="inviteEmail" className="form-label">
                  Email de la startup
                </label>
                <input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="input-field"
                  placeholder="startup@exemple.com"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="btn-secondary flex-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading || !inviteEmail}
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  {inviteLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer l'invitation
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )}
    </div>
  );
};

export default B2BDashboard;