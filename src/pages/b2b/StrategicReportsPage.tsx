import React, { useState } from 'react';
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  Filter, 
  RefreshCw,
  FileText,
  Users,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  Zap,
  Eye,
  Share2,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Globe,
  Briefcase,
  LayoutDashboard,
  Award,
  TrendingDown,
  UserPlus
} from 'lucide-react';
import clsx from 'clsx';

const StrategicReportsPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('Q1-2025');
  const [selectedReport, setSelectedReport] = useState('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  
  // Check if dark mode is enabled
  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  }, []);
  
  // Mock data for strategic reports
  const reportData = {
    overview: {
      totalStartups: 24,
      activeStartups: 18,
      graduatedStartups: 6,
      totalFundingRaised: 12300000,
      averageTicket: 683333,
      successRate: 75,
      portfolioGrowth: 15.2,
      newStartupsThisQuarter: 8,
      averageTimeToFunding: 4.2,
      topSectors: [
        { name: 'Healthtech', count: 6, percentage: 25, funding: 4200000 },
        { name: 'Fintech', count: 5, percentage: 21, funding: 3100000 },
        { name: 'Greentech', count: 4, percentage: 17, funding: 2800000 },
        { name: 'Edtech', count: 3, percentage: 13, funding: 1500000 },
        { name: 'Autres', count: 6, percentage: 24, funding: 700000 }
      ],
      fundingByStage: [
        { stage: 'Pré-seed', count: 8, amount: 1200000, percentage: 33 },
        { stage: 'Seed', count: 10, amount: 5800000, percentage: 42 },
        { stage: 'Série A', count: 4, amount: 4200000, percentage: 17 },
        { stage: 'Série B+', count: 2, amount: 1100000, percentage: 8 }
      ],
      monthlyMetrics: [
        { month: 'Oct', newStartups: 3, funding: 850000, success: 2 },
        { month: 'Nov', newStartups: 2, funding: 1200000, success: 3 },
        { month: 'Déc', newStartups: 3, funding: 950000, success: 1 },
        { month: 'Jan', newStartups: 4, funding: 1800000, success: 4 }
      ]
    },
    performance: {
      kpis: [
        { name: 'Taux de succès', value: 75, target: 80, trend: 'up', change: 5 },
        { name: 'Temps moyen levée', value: 4.2, target: 4.0, trend: 'down', change: -0.3, unit: 'mois' },
        { name: 'Ticket moyen', value: 683333, target: 700000, trend: 'down', change: -2.4, unit: '€' },
        { name: 'Taux de rétention', value: 92, target: 90, trend: 'up', change: 3, unit: '%' }
      ],
      benchmarks: [
        { metric: 'Taux de succès', ourValue: 75, marketAverage: 68, position: 'above' },
        { metric: 'Temps de levée', ourValue: 4.2, marketAverage: 5.1, position: 'above' },
        { metric: 'Ticket moyen', ourValue: 683333, marketAverage: 650000, position: 'above' },
        { metric: 'Portefeuille actif', ourValue: 18, marketAverage: 15, position: 'above' }
      ]
    },
    funding: {
      totalRaised: 12300000,
      dilutiveFunding: 8900000,
      nonDilutiveFunding: 3400000,
      byType: [
        { type: 'Equity', amount: 8900000, percentage: 72, color: 'purple' },
        { type: 'Subventions', amount: 2100000, percentage: 17, color: 'green' },
        { type: 'Prêts', amount: 1300000, percentage: 11, color: 'blue' }
      ],
      trends: [
        { quarter: 'Q4 2023', dilutive: 2100000, nonDilutive: 800000 },
        { quarter: 'Q1 2024', dilutive: 2800000, nonDilutive: 900000 },
        { quarter: 'Q2 2024', dilutive: 1900000, nonDilutive: 700000 },
        { quarter: 'Q3 2024', dilutive: 2100000, nonDilutive: 1000000 }
      ]
    }
  };
  
  // Available reports
  const availableReports = [
    {
      id: 'overview',
      name: 'Vue d\'ensemble',
      description: 'Synthèse globale du portefeuille et des performances',
      icon: LayoutDashboard,
      lastGenerated: '2025-01-12'
    },
    {
      id: 'performance',
      name: 'Performance & KPIs',
      description: 'Analyse détaillée des indicateurs de performance',
      icon: TrendingUp,
      lastGenerated: '2025-01-10'
    },
    {
      id: 'funding',
      name: 'Analyse Financière',
      description: 'Répartition et évolution des financements',
      icon: DollarSign,
      lastGenerated: '2025-01-11'
    },
    {
      id: 'portfolio',
      name: 'Portefeuille Détaillé',
      description: 'Analyse startup par startup avec recommandations',
      icon: Briefcase,
      lastGenerated: '2025-01-09'
    },
    {
      id: 'market',
      name: 'Veille Marché',
      description: 'Tendances sectorielles et opportunités',
      icon: Globe,
      lastGenerated: '2025-01-08'
    },
    {
      id: 'custom',
      name: 'Rapport Personnalisé',
      description: 'Créez un rapport sur mesure',
      icon: Settings,
      lastGenerated: null
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
  
  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  
  // Handle report generation
  const handleGenerateReport = (reportId: string) => {
    setGeneratingReport(true);
    
    // Simulate report generation
    setTimeout(() => {
      setGeneratingReport(false);
      // In a real app, this would trigger download or open the report
      console.log(`Generating report: ${reportId}`);
    }, 2000);
  };
  
  // Get trend icon and color
  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up' || change > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    } else if (trend === 'down' || change < 0) {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    }
    return <Activity className="h-4 w-4 text-gray-500" />;
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
              Rapports Stratégiques
            </h1>
            <p className={clsx(
              "mt-1",
              darkMode ? "text-gray-400" : "text-gray-500"
            )}>
              Analyses avancées et reporting pour le pilotage de votre structure
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={clsx(
                "px-4 py-2 rounded-lg border text-sm font-medium",
                darkMode 
                  ? "bg-gray-700 border-gray-600 text-white" 
                  : "bg-white border-gray-300 text-gray-900"
              )}
            >
              <option value="Q1-2025">Q1 2025</option>
              <option value="Q4-2024">Q4 2024</option>
              <option value="Q3-2024">Q3 2024</option>
              <option value="2024">Année 2024</option>
            </select>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                showFilters
                  ? darkMode 
                    ? "bg-purple-600 text-white" 
                    : "bg-primary text-white"
                  : darkMode 
                    ? "bg-gray-700 text-white hover:bg-gray-600" 
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              )}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </button>
            
            <button className={clsx(
              "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              darkMode 
                ? "bg-gray-700 text-white hover:bg-gray-600" 
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            )}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </button>
          </div>
        </div>
        
        {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {availableReports.map((report) => (
            <div 
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={clsx(
                "p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg",
                selectedReport === report.id
                  ? darkMode 
                    ? "border-purple-500 bg-purple-900/20" 
                    : "border-primary bg-secondary-light"
                  : darkMode 
                    ? "border-gray-700 bg-gray-800 hover:border-gray-600" 
                    : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={clsx(
                  "p-3 rounded-full",
                  selectedReport === report.id
                    ? darkMode ? "bg-purple-600" : "bg-primary"
                    : darkMode ? "bg-gray-700" : "bg-gray-100"
                )}>
                  <report.icon className={clsx(
                    "h-6 w-6",
                    selectedReport === report.id
                      ? "text-white"
                      : darkMode ? "text-gray-400" : "text-gray-600"
                  )} />
                </div>
                
                {report.lastGenerated && (
                  <span className={clsx(
                    "text-xs px-2 py-1 rounded-full",
                    darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                  )}>
                    {report.lastGenerated}
                  </span>
                )}
              </div>
              
              <h3 className={clsx(
                "text-lg font-semibold mb-2",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                {report.name}
              </h3>
              <p className={clsx(
                "text-sm",
                darkMode ? "text-gray-300" : "text-gray-600"
              )}>
                {report.description}
              </p>
              
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateReport(report.id);
                  }}
                  disabled={generatingReport}
                  className={clsx(
                    "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                    generatingReport
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : darkMode 
                        ? "bg-purple-600 text-white hover:bg-purple-700" 
                        : "bg-primary text-white hover:bg-opacity-90"
                  )}
                >
                  {generatingReport ? (
                    <>
                      <div className="animate-spin h-3 w-3 border border-gray-400 border-t-transparent rounded-full mr-1 inline-block"></div>
                      Génération...
                    </>
                  ) : (
                    <>
                      <Download className="h-3 w-3 mr-1" />
                      Générer
                    </>
                  )}
                </button>
                
                {report.lastGenerated && (
                  <button className={clsx(
                    "text-xs font-medium hover:underline",
                    darkMode ? "text-purple-400" : "text-primary"
                  )}>
                    <Eye className="h-3 w-3 mr-1 inline" />
                    Voir dernier
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Report Content Based on Selection */}
        <div className={clsx(
          "rounded-xl shadow-sm",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          {/* Overview Report */}
          {selectedReport === 'overview' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className={clsx(
                  "text-xl font-semibold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Vue d'ensemble - {selectedPeriod}
                </h2>
                <div className="flex gap-2">
                  <button className={clsx(
                    "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                    darkMode 
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  )}>
                    <Share2 className="h-4 w-4 mr-1" />
                    Partager
                  </button>
                  <button className={clsx(
                    "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                    darkMode 
                      ? "bg-purple-600 text-white hover:bg-purple-700" 
                      : "bg-primary text-white hover:bg-opacity-90"
                  )}>
                    <Download className="h-4 w-4 mr-1" />
                    Export PDF
                  </button>
                </div>
              </div>
              
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className={clsx(
                  "p-6 rounded-xl",
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={clsx(
                      "p-2 rounded-full",
                      darkMode ? "bg-blue-900/30" : "bg-blue-100"
                    )}>
                      <Building2 className={clsx(
                        "h-5 w-5",
                        darkMode ? "text-blue-400" : "text-blue-600"
                      )} />
                    </div>
                    <div className="flex items-center">
                      {getTrendIcon('up', reportData.overview.portfolioGrowth)}
                      <span className="text-xs font-medium text-green-500 ml-1">
                        +{reportData.overview.portfolioGrowth}%
                      </span>
                    </div>
                  </div>
                  <p className={clsx(
                    "text-2xl font-bold",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    {reportData.overview.totalStartups}
                  </p>
                  <p className={clsx(
                    "text-sm",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Startups au portefeuille
                  </p>
                  <p className={clsx(
                    "text-xs mt-1",
                    darkMode ? "text-gray-500" : "text-gray-400"
                  )}>
                    {reportData.overview.activeStartups} actives, {reportData.overview.graduatedStartups} alumni
                  </p>
                </div>
                
                <div className={clsx(
                  "p-6 rounded-xl",
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={clsx(
                      "p-2 rounded-full",
                      darkMode ? "bg-green-900/30" : "bg-green-100"
                    )}>
                      <DollarSign className={clsx(
                        "h-5 w-5",
                        darkMode ? "text-green-400" : "text-green-600"
                      )} />
                    </div>
                    <div className="flex items-center">
                      {getTrendIcon('up', 12)}
                      <span className="text-xs font-medium text-green-500 ml-1">+12%</span>
                    </div>
                  </div>
                  <p className={clsx(
                    "text-2xl font-bold",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    {formatCurrency(reportData.overview.totalFundingRaised)}
                  </p>
                  <p className={clsx(
                    "text-sm",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Total levé
                  </p>
                  <p className={clsx(
                    "text-xs mt-1",
                    darkMode ? "text-gray-500" : "text-gray-400"
                  )}>
                    Ticket moyen: {formatCurrency(reportData.overview.averageTicket)}
                  </p>
                </div>
                
                <div className={clsx(
                  "p-6 rounded-xl",
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={clsx(
                      "p-2 rounded-full",
                      darkMode ? "bg-purple-900/30" : "bg-secondary-light"
                    )}>
                      <Award className={clsx(
                        "h-5 w-5",
                        darkMode ? "text-purple-400" : "text-primary"
                      )} />
                    </div>
                    <div className="flex items-center">
                      {getTrendIcon('up', 5)}
                      <span className="text-xs font-medium text-green-500 ml-1">+5%</span>
                    </div>
                  </div>
                  <p className={clsx(
                    "text-2xl font-bold",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    {reportData.overview.successRate}%
                  </p>
                  <p className={clsx(
                    "text-sm",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Taux de succès
                  </p>
                  <p className={clsx(
                    "text-xs mt-1",
                    darkMode ? "text-gray-500" : "text-gray-400"
                  )}>
                    Temps moyen: {reportData.overview.averageTimeToFunding} mois
                  </p>
                </div>
                
                <div className={clsx(
                  "p-6 rounded-xl",
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={clsx(
                      "p-2 rounded-full",
                      darkMode ? "bg-orange-900/30" : "bg-orange-100"
                    )}>
                      <UserPlus className={clsx(
                        "h-5 w-5",
                        darkMode ? "text-orange-400" : "text-orange-600"
                      )} />
                    </div>
                    <div className="flex items-center">
                      {getTrendIcon('up', 25)}
                      <span className="text-xs font-medium text-green-500 ml-1">+25%</span>
                    </div>
                  </div>
                  <p className={clsx(
                    "text-2xl font-bold",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    {reportData.overview.newStartupsThisQuarter}
                  </p>
                  <p className={clsx(
                    "text-sm",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Nouvelles startups
                  </p>
                  <p className={clsx(
                    "text-xs mt-1",
                    darkMode ? "text-gray-500" : "text-gray-400"
                  )}>
                    Ce trimestre
                  </p>
                </div>
              </div>
              
              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Sectors Distribution */}
                <div className={clsx(
                  "p-6 rounded-xl",
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                )}>
                  <h3 className={clsx(
                    "text-lg font-semibold mb-4",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Répartition par secteur
                  </h3>
                  
                  <div className="space-y-4">
                    {reportData.overview.topSectors.map((sector, index) => (
                      <div key={sector.name} className="flex items-center">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className={clsx(
                              "text-sm font-medium",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              {sector.name}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className={clsx(
                                "text-xs",
                                darkMode ? "text-gray-400" : "text-gray-500"
                              )}>
                                {sector.count} startups
                              </span>
                              <span className={clsx(
                                "text-sm font-medium",
                                darkMode ? "text-gray-300" : "text-gray-700"
                              )}>
                                {formatCurrency(sector.funding)}
                              </span>
                            </div>
                          </div>
                          <div className={clsx(
                            "w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2"
                          )}>
                            <div 
                              className={clsx(
                                "h-2 rounded-full",
                                index === 0 ? "bg-blue-500" :
                                index === 1 ? "bg-green-500" :
                                index === 2 ? "bg-purple-500" :
                                index === 3 ? "bg-orange-500" : "bg-gray-400"
                              )}
                              style={{ width: `${sector.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Funding by Stage */}
                <div className={clsx(
                  "p-6 rounded-xl",
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                )}>
                  <h3 className={clsx(
                    "text-lg font-semibold mb-4",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Financement par stade
                  </h3>
                  
                  <div className="space-y-4">
                    {reportData.overview.fundingByStage.map((stage, index) => (
                      <div key={stage.stage} className="flex items-center">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className={clsx(
                              "text-sm font-medium",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              {stage.stage}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className={clsx(
                                "text-xs",
                                darkMode ? "text-gray-400" : "text-gray-500"
                              )}>
                                {stage.count} startups
                              </span>
                              <span className={clsx(
                                "text-sm font-medium",
                                darkMode ? "text-gray-300" : "text-gray-700"
                              )}>
                                {formatCurrency(stage.amount)}
                              </span>
                            </div>
                          </div>
                          <div className={clsx(
                            "w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2"
                          )}>
                            <div 
                              className={clsx(
                                "h-2 rounded-full",
                                index === 0 ? "bg-gray-400" :
                                index === 1 ? "bg-blue-500" :
                                index === 2 ? "bg-purple-500" : "bg-green-500"
                              )}
                              style={{ width: `${stage.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Monthly Evolution */}
              <div className={clsx(
                "p-6 rounded-xl mb-8",
                darkMode ? "bg-gray-700" : "bg-gray-50"
              )}>
                <h3 className={clsx(
                  "text-lg font-semibold mb-6",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Évolution mensuelle
                </h3>
                
                <div className="grid grid-cols-4 gap-6">
                  {reportData.overview.monthlyMetrics.map((month, index) => (
                    <div key={month.month} className="text-center">
                      <div className={clsx(
                        "p-4 rounded-lg mb-3",
                        darkMode ? "bg-gray-800" : "bg-white"
                      )}>
                        <div className={clsx(
                          "text-lg font-bold",
                          darkMode ? "text-white" : "text-gray-900"
                        )}>
                          {month.newStartups}
                        </div>
                        <div className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Nouvelles
                        </div>
                      </div>
                      
                      <div className={clsx(
                        "p-4 rounded-lg mb-3",
                        darkMode ? "bg-gray-800" : "bg-white"
                      )}>
                        <div className={clsx(
                          "text-lg font-bold",
                          darkMode ? "text-white" : "text-gray-900"
                        )}>
                          {formatCurrency(month.funding)}
                        </div>
                        <div className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Levé
                        </div>
                      </div>
                      
                      <div className={clsx(
                        "p-4 rounded-lg",
                        darkMode ? "bg-gray-800" : "bg-white"
                      )}>
                        <div className={clsx(
                          "text-lg font-bold",
                          darkMode ? "text-white" : "text-gray-900"
                        )}>
                          {month.success}
                        </div>
                        <div className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Succès
                        </div>
                      </div>
                      
                      <div className={clsx(
                        "text-sm font-medium mt-2",
                        darkMode ? "text-gray-300" : "text-gray-700"
                      )}>
                        {month.month}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Performance Report */}
          {selectedReport === 'performance' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className={clsx(
                  "text-xl font-semibold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Performance & KPIs - {selectedPeriod}
                </h2>
                <div className="flex gap-2">
                  <button className={clsx(
                    "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                    darkMode 
                      ? "bg-purple-600 text-white hover:bg-purple-700" 
                      : "bg-primary text-white hover:bg-opacity-90"
                  )}>
                    <Download className="h-4 w-4 mr-1" />
                    Export Excel
                  </button>
                </div>
              </div>
              
              {/* KPIs Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {reportData.performance.kpis.map((kpi, index) => (
                  <div 
                    key={kpi.name}
                    className={clsx(
                      "p-6 rounded-xl",
                      darkMode ? "bg-gray-700" : "bg-gray-50"
                    )}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className={clsx(
                        "text-lg font-medium",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        {kpi.name}
                      </h4>
                      <div className="flex items-center">
                        {getTrendIcon(kpi.trend, kpi.change)}
                        <span className={clsx(
                          "text-sm font-medium ml-1",
                          kpi.change > 0 ? "text-green-500" : "text-red-500"
                        )}>
                          {kpi.change > 0 ? '+' : ''}{kpi.change}{kpi.unit || '%'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-end justify-between">
                      <div>
                        <p className={clsx(
                          "text-3xl font-bold",
                          darkMode ? "text-white" : "text-gray-900"
                        )}>
                          {kpi.unit === '€' ? formatCurrency(kpi.value) : kpi.value}{kpi.unit && kpi.unit !== '€' ? kpi.unit : ''}
                        </p>
                        <p className={clsx(
                          "text-sm",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Objectif: {kpi.unit === '€' ? formatCurrency(kpi.target) : kpi.target}{kpi.unit && kpi.unit !== '€' ? kpi.unit : ''}
                        </p>
                      </div>
                      
                      <div className="w-16 h-16">
                        <div className={clsx(
                          "w-full h-full rounded-full border-4 flex items-center justify-center",
                          kpi.value >= kpi.target 
                            ? "border-green-500 bg-green-100 dark:bg-green-900/30" 
                            : "border-orange-500 bg-orange-100 dark:bg-orange-900/30"
                        )}>
                          <span className={clsx(
                            "text-xs font-bold",
                            kpi.value >= kpi.target ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"
                          )}>
                            {Math.round((kpi.value / kpi.target) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Benchmarks */}
              <div className={clsx(
                "p-6 rounded-xl",
                darkMode ? "bg-gray-700" : "bg-gray-50"
              )}>
                <h3 className={clsx(
                  "text-lg font-semibold mb-6",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Benchmarks marché
                </h3>
                
                <div className="space-y-4">
                  {reportData.performance.benchmarks.map((benchmark, index) => (
                    <div key={benchmark.metric} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className={clsx(
                            "text-sm font-medium",
                            darkMode ? "text-gray-300" : "text-gray-700"
                          )}>
                            {benchmark.metric}
                          </span>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className={clsx(
                                "text-sm font-bold",
                                darkMode ? "text-white" : "text-gray-900"
                              )}>
                                Vous: {typeof benchmark.ourValue === 'number' && benchmark.ourValue > 1000 
                                  ? formatCurrency(benchmark.ourValue) 
                                  : benchmark.ourValue}{typeof benchmark.ourValue === 'number' && benchmark.ourValue <= 100 && benchmark.metric.includes('Taux') ? '%' : ''}
                              </div>
                              <div className={clsx(
                                "text-xs",
                                darkMode ? "text-gray-400" : "text-gray-500"
                              )}>
                                Marché: {typeof benchmark.marketAverage === 'number' && benchmark.marketAverage > 1000 
                                  ? formatCurrency(benchmark.marketAverage) 
                                  : benchmark.marketAverage}{typeof benchmark.marketAverage === 'number' && benchmark.marketAverage <= 100 && benchmark.metric.includes('Taux') ? '%' : ''}
                              </div>
                            </div>
                            <div className={clsx(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              benchmark.position === 'above' 
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            )}>
                              {benchmark.position === 'above' ? 'Au-dessus' : 'En-dessous'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Funding Analysis Report */}
          {selectedReport === 'funding' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className={clsx(
                  "text-xl font-semibold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Analyse Financière - {selectedPeriod}
                </h2>
                <div className="flex gap-2">
                  <button className={clsx(
                    "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                    darkMode 
                      ? "bg-purple-600 text-white hover:bg-purple-700" 
                      : "bg-primary text-white hover:bg-opacity-90"
                  )}>
                    <Download className="h-4 w-4 mr-1" />
                    Export détaillé
                  </button>
                </div>
              </div>
              
              {/* Funding Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className={clsx(
                  "p-6 rounded-xl text-center",
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                )}>
                  <div className={clsx(
                    "text-3xl font-bold mb-2",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    {formatCurrency(reportData.funding.totalRaised)}
                  </div>
                  <div className={clsx(
                    "text-sm",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Total levé
                  </div>
                </div>
                
                <div className={clsx(
                  "p-6 rounded-xl text-center",
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                )}>
                  <div className={clsx(
                    "text-3xl font-bold mb-2",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    {formatCurrency(reportData.funding.dilutiveFunding)}
                  </div>
                  <div className={clsx(
                    "text-sm",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Financement dilutif
                  </div>
                  <div className={clsx(
                    "text-xs mt-1",
                    darkMode ? "text-purple-400" : "text-purple-600"
                  )}>
                    {Math.round((reportData.funding.dilutiveFunding / reportData.funding.totalRaised) * 100)}% du total
                  </div>
                </div>
                
                <div className={clsx(
                  "p-6 rounded-xl text-center",
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                )}>
                  <div className={clsx(
                    "text-3xl font-bold mb-2",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    {formatCurrency(reportData.funding.nonDilutiveFunding)}
                  </div>
                  <div className={clsx(
                    "text-sm",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Financement non dilutif
                  </div>
                  <div className={clsx(
                    "text-xs mt-1",
                    darkMode ? "text-green-400" : "text-green-600"
                  )}>
                    {Math.round((reportData.funding.nonDilutiveFunding / reportData.funding.totalRaised) * 100)}% du total
                  </div>
                </div>
              </div>
              
              {/* Funding by Type */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className={clsx(
                  "p-6 rounded-xl",
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                )}>
                  <h3 className={clsx(
                    "text-lg font-semibold mb-6",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Répartition par type
                  </h3>
                  
                  <div className="space-y-4">
                    {reportData.funding.byType.map((type, index) => (
                      <div key={type.type} className="flex items-center">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <span className={clsx(
                              "text-sm font-medium",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              {type.type}
                            </span>
                            <div className="text-right">
                              <div className={clsx(
                                "text-sm font-bold",
                                darkMode ? "text-white" : "text-gray-900"
                              )}>
                                {formatCurrency(type.amount)}
                              </div>
                              <div className={clsx(
                                "text-xs",
                                darkMode ? "text-gray-400" : "text-gray-500"
                              )}>
                                {type.percentage}%
                              </div>
                            </div>
                          </div>
                          <div className={clsx(
                            "w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3"
                          )}>
                            <div 
                              className={clsx(
                                "h-3 rounded-full",
                                type.color === 'purple' ? "bg-purple-500" :
                                type.color === 'green' ? "bg-green-500" : "bg-blue-500"
                              )}
                              style={{ width: `${type.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Quarterly Trends */}
                <div className={clsx(
                  "p-6 rounded-xl",
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                )}>
                  <h3 className={clsx(
                    "text-lg font-semibold mb-6",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Évolution trimestrielle
                  </h3>
                  
                  <div className="space-y-4">
                    {reportData.funding.trends.map((trend, index) => (
                      <div key={trend.quarter} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <span className={clsx(
                              "text-sm font-medium",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              {trend.quarter}
                            </span>
                            <span className={clsx(
                              "text-sm font-bold",
                              darkMode ? "text-white" : "text-gray-900"
                            )}>
                              {formatCurrency(trend.dilutive + trend.nonDilutive)}
                            </span>
                          </div>
                          
                          <div className="flex space-x-2">
                            <div className="flex-1">
                              <div className={clsx(
                                "w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2"
                              )}>
                                <div 
                                  className="bg-purple-500 h-2 rounded-full"
                                  style={{ width: `${(trend.dilutive / (trend.dilutive + trend.nonDilutive)) * 100}%` }}
                                />
                              </div>
                              <div className={clsx(
                                "text-xs mt-1",
                                darkMode ? "text-purple-400" : "text-purple-600"
                              )}>
                                Dilutif: {formatCurrency(trend.dilutive)}
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className={clsx(
                                "w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2"
                              )}>
                                <div 
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${(trend.nonDilutive / (trend.dilutive + trend.nonDilutive)) * 100}%` }}
                                />
                              </div>
                              <div className={clsx(
                                "text-xs mt-1",
                                darkMode ? "text-green-400" : "text-green-600"
                              )}>
                                Non dilutif: {formatCurrency(trend.nonDilutive)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Other report types placeholder */}
          {!['overview', 'performance', 'funding'].includes(selectedReport) && (
            <div className="p-8 text-center">
              <div className={clsx(
                "p-4 rounded-full mx-auto mb-4 w-fit",
                darkMode ? "bg-gray-700" : "bg-gray-100"
              )}>
                <FileText className={clsx(
                  "h-8 w-8",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )} />
              </div>
              <h3 className={clsx(
                "text-lg font-medium mb-2",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Rapport en développement
              </h3>
              <p className={clsx(
                "text-sm mb-6",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}>
                Ce type de rapport sera bientôt disponible. En attendant, vous pouvez générer les autres rapports.
              </p>
              <button
                onClick={() => handleGenerateReport(selectedReport)}
                className={clsx(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  darkMode 
                    ? "bg-purple-600 text-white hover:bg-purple-700" 
                    : "bg-primary text-white hover:bg-opacity-90"
                )}
              >
                <Zap className="h-4 w-4 mr-2" />
                Demander ce rapport
              </button>
            </div>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className={clsx(
          "mt-8 p-6 rounded-xl",
          darkMode ? "bg-gray-800" : "bg-white shadow-sm"
        )}>
          <h3 className={clsx(
            "text-lg font-semibold mb-4",
            darkMode ? "text-white" : "text-gray-900"
          )}>
            Actions rapides
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className={clsx(
              "p-4 rounded-lg text-left transition-all hover:scale-105",
              darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-50 hover:bg-gray-100"
            )}>
              <Calendar className={clsx(
                "h-5 w-5 mb-2",
                darkMode ? "text-blue-400" : "text-blue-600"
              )} />
              <div className={clsx(
                "text-sm font-medium",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Planifier rapport
              </div>
              <div className={clsx(
                "text-xs",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}>
                Automatiser la génération
              </div>
            </button>
            
            <button className={clsx(
              "p-4 rounded-lg text-left transition-all hover:scale-105",
              darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-50 hover:bg-gray-100"
            )}>
              <Share2 className={clsx(
                "h-5 w-5 mb-2",
                darkMode ? "text-green-400" : "text-green-600"
              )} />
              <div className={clsx(
                "text-sm font-medium",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Partager rapport
              </div>
              <div className={clsx(
                "text-xs",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}>
                Équipe et partenaires
              </div>
            </button>
            
            <button className={clsx(
              "p-4 rounded-lg text-left transition-all hover:scale-105",
              darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-50 hover:bg-gray-100"
            )}>
              <Settings className={clsx(
                "h-5 w-5 mb-2",
                darkMode ? "text-purple-400" : "text-primary"
              )} />
              <div className={clsx(
                "text-sm font-medium",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Personnaliser
              </div>
              <div className={clsx(
                "text-xs",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}>
                Métriques et KPIs
              </div>
            </button>
            
            <button className={clsx(
              "p-4 rounded-lg text-left transition-all hover:scale-105",
              darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-50 hover:bg-gray-100"
            )}>
              <Zap className={clsx(
                "h-5 w-5 mb-2",
                darkMode ? "text-yellow-400" : "text-yellow-600"
              )} />
              <div className={clsx(
                "text-sm font-medium",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Analyse IA
              </div>
              <div className={clsx(
                "text-xs",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}>
                Insights automatiques
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategicReportsPage;