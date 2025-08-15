import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  Info, 
  Sliders, 
  PieChart, 
  Target, 
  Clock, 
  Percent,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import clsx from 'clsx';

const AnalysisPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState(3000000);
  const [equityPercentage, setEquityPercentage] = useState(20);
  const [timeToBreakeven, setTimeToBreakeven] = useState(36);
  const [selectedScenario, setSelectedScenario] = useState('base');
  
  // Check if dark mode is enabled
  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  }, []);
  
  // Toggle section visibility
  const toggleSection = (section: string) => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
    }
  };
  
  // Mock financial data
  const financialData = {
    projections: {
      bestCase: {
        revenue: [1200000, 3500000, 8000000, 15000000, 25000000],
        costs: [1700000, 3150000, 6400000, 10500000, 16250000],
        profits: [-500000, 350000, 1600000, 4500000, 8750000],
        margins: [-41.7, 10, 20, 30, 35]
      },
      baseCase: {
        revenue: [950000, 2800000, 6400000, 12000000, 20000000],
        costs: [1600000, 2660000, 5120000, 8400000, 13000000],
        profits: [-650000, 140000, 1280000, 3600000, 7000000],
        margins: [-68.4, 5, 20, 30, 35]
      },
      worstCase: {
        revenue: [750000, 1800000, 4000000, 7500000, 12000000],
        costs: [1550000, 1980000, 3600000, 6000000, 9000000],
        profits: [-800000, -180000, 400000, 1500000, 3000000],
        margins: [-106.7, -10, 10, 20, 25]
      }
    },
    investmentRequirements: {
      total: 3000000,
      breakdown: {
        product: 1200000,
        marketing: 900000,
        operations: 600000,
        other: 300000
      },
      runway: 24, // months
      burnRate: 125000 // monthly
    },
    investorRequirements: {
      minimumTicket: 250000,
      targetROI: 5, // 5x
      expectedTimeframe: 5, // years
      preferredStages: ['Seed', 'Series A'],
      keyMetrics: ['ARR', 'Customer Acquisition Cost', 'Retention Rate'],
      exitStrategy: ['Acquisition', 'IPO'],
      governanceRequirements: ['Board Seat', 'Information Rights', 'Pro-rata Rights']
    },
    investmentCriteria: [
      {
        type: 'Business Angels',
        ticketSize: '50K€ - 300K€',
        equity: '5-15%',
        timeline: '5-7 ans',
        focus: 'Produit, vision, équipe',
        requirements: ['Preuve de concept', 'Premiers clients', 'Équipe complémentaire'],
        successRate: 65
      },
      {
        type: 'Venture Capital (Seed)',
        ticketSize: '300K€ - 1.5M€',
        equity: '15-25%',
        timeline: '5-7 ans',
        focus: 'Traction, scalabilité, marché',
        requirements: ['Croissance MRR', 'Métriques d\'acquisition', 'Potentiel de marché'],
        successRate: 45
      },
      {
        type: 'Venture Capital (Series A)',
        ticketSize: '1.5M€ - 5M€',
        equity: '15-30%',
        timeline: '4-6 ans',
        focus: 'Croissance, unit economics, équipe complète',
        requirements: ['ARR > 1M€', 'Croissance > 100%/an', 'Voie vers la rentabilité'],
        successRate: 30
      },
      {
        type: 'Corporate Venture',
        ticketSize: '500K€ - 3M€',
        equity: '10-20%',
        timeline: '4-7 ans',
        focus: 'Synergies, technologie, marché',
        requirements: ['Produit mature', 'Complémentarité stratégique', 'Potentiel de partenariat'],
        successRate: 40
      }
    ]
  };
  
  // Calculate ROI based on investment amount and equity percentage
  const calculateROI = () => {
    const exitValue = selectedScenario === 'best' 
      ? 50000000 
      : selectedScenario === 'base' 
        ? 40000000 
        : 25000000;
    
    const investmentValue = (exitValue * equityPercentage) / 100;
    const roi = investmentValue / investmentAmount;
    const annualROI = Math.pow(roi, 1/5) - 1; // 5-year investment
    
    return {
      multiple: roi.toFixed(1) + 'x',
      annualReturn: (annualROI * 100).toFixed(1) + '%',
      exitValue: exitValue.toLocaleString('fr-FR') + ' €',
      investorShare: investmentValue.toLocaleString('fr-FR') + ' €'
    };
  };
  
  const roiData = calculateROI();
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
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
              Analyse Financière
            </h1>
            <p className={clsx(
              "mt-1",
              darkMode ? "text-gray-400" : "text-gray-500"
            )}>
              Visualisez vos projections et comprenez les attentes des investisseurs
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <button className={clsx(
              "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              darkMode 
                ? "bg-purple-600 text-white hover:bg-purple-700" 
                : "bg-primary text-white hover:bg-opacity-90"
            )}>
              <Sparkles className="h-4 w-4 mr-2" />
              Générer un rapport
            </button>
          </div>
        </div>
        
        {/* Financial Projections Section */}
        <div className={clsx(
          "rounded-xl shadow-sm overflow-hidden mb-8",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className={clsx(
                  "p-2 rounded-full mr-3",
                  darkMode ? "bg-purple-900/30" : "bg-secondary-light"
                )}>
                  <BarChart3 className={clsx(
                    "h-5 w-5",
                    darkMode ? "text-purple-400" : "text-primary"
                  )} />
                </div>
                <h2 className={clsx(
                  "text-lg font-semibold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Projections Financières
                </h2>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => setSelectedScenario('best')}
                  className={clsx(
                    "px-3 py-1 text-xs font-medium rounded-full transition-colors",
                    selectedScenario === 'best'
                      ? darkMode 
                        ? "bg-green-900/30 text-green-400 ring-1 ring-green-500/30" 
                        : "bg-green-100 text-green-800 ring-1 ring-green-500/30"
                      : darkMode 
                        ? "text-gray-400 hover:text-green-400" 
                        : "text-gray-500 hover:text-green-800"
                  )}
                >
                  Meilleur cas
                </button>
                <button 
                  onClick={() => setSelectedScenario('base')}
                  className={clsx(
                    "px-3 py-1 text-xs font-medium rounded-full transition-colors",
                    selectedScenario === 'base'
                      ? darkMode 
                        ? "bg-blue-900/30 text-blue-400 ring-1 ring-blue-500/30" 
                        : "bg-blue-100 text-blue-800 ring-1 ring-blue-500/30"
                      : darkMode 
                        ? "text-gray-400 hover:text-blue-400" 
                        : "text-gray-500 hover:text-blue-800"
                  )}
                >
                  Cas de base
                </button>
                <button 
                  onClick={() => setSelectedScenario('worst')}
                  className={clsx(
                    "px-3 py-1 text-xs font-medium rounded-full transition-colors",
                    selectedScenario === 'worst'
                      ? darkMode 
                        ? "bg-red-900/30 text-red-400 ring-1 ring-red-500/30" 
                        : "bg-red-100 text-red-800 ring-1 ring-red-500/30"
                      : darkMode 
                        ? "text-gray-400 hover:text-red-400" 
                        : "text-gray-500 hover:text-red-800"
                  )}
                >
                  Pire cas
                </button>
              </div>
            </div>
            
            {/* Revenue Chart */}
            <div className="mb-8">
              <h3 className={clsx(
                "text-sm font-medium mb-4",
                darkMode ? "text-gray-300" : "text-gray-700"
              )}>
                Chiffre d'affaires (€)
              </h3>
              <div className="h-64 relative">
                {/* Chart Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-right pr-2">
                  <span className={clsx(darkMode ? "text-gray-400" : "text-gray-500")}>25M</span>
                  <span className={clsx(darkMode ? "text-gray-400" : "text-gray-500")}>20M</span>
                  <span className={clsx(darkMode ? "text-gray-400" : "text-gray-500")}>15M</span>
                  <span className={clsx(darkMode ? "text-gray-400" : "text-gray-500")}>10M</span>
                  <span className={clsx(darkMode ? "text-gray-400" : "text-gray-500")}>5M</span>
                  <span className={clsx(darkMode ? "text-gray-400" : "text-gray-500")}>0</span>
                </div>
                
                {/* Chart content */}
                <div className="ml-16 h-full flex items-end">
                  {/* Chart bars */}
                  <div className="flex-1 flex items-end justify-around h-full relative">
                    {/* Horizontal grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div 
                          key={i} 
                          className={clsx(
                            "w-full h-px", 
                            darkMode ? "bg-gray-700" : "bg-gray-200"
                          )} 
                        />
                      ))}
                    </div>
                    
                    {/* Year 1 */}
                    <div className="w-16 flex flex-col items-center">
                      <div 
                        className={clsx(
                          "w-10 rounded-t transition-all",
                          selectedScenario === 'best' 
                            ? darkMode ? "bg-green-500" : "bg-green-500" 
                            : selectedScenario === 'base' 
                              ? darkMode ? "bg-blue-500" : "bg-blue-500" 
                              : darkMode ? "bg-red-500" : "bg-red-500"
                        )}
                        style={{ 
                          height: `${(selectedScenario === 'best' 
                            ? financialData.projections.bestCase.revenue[0] 
                            : selectedScenario === 'base' 
                              ? financialData.projections.baseCase.revenue[0] 
                              : financialData.projections.worstCase.revenue[0]) / 250000}px` 
                        }}
                      />
                      <span className={clsx(
                        "text-xs mt-2",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        Année 1
                      </span>
                    </div>
                    
                    {/* Year 2 */}
                    <div className="w-16 flex flex-col items-center">
                      <div 
                        className={clsx(
                          "w-10 rounded-t transition-all",
                          selectedScenario === 'best' 
                            ? darkMode ? "bg-green-500" : "bg-green-500" 
                            : selectedScenario === 'base' 
                              ? darkMode ? "bg-blue-500" : "bg-blue-500" 
                              : darkMode ? "bg-red-500" : "bg-red-500"
                        )}
                        style={{ 
                          height: `${(selectedScenario === 'best' 
                            ? financialData.projections.bestCase.revenue[1] 
                            : selectedScenario === 'base' 
                              ? financialData.projections.baseCase.revenue[1] 
                              : financialData.projections.worstCase.revenue[1]) / 250000}px` 
                        }}
                      />
                      <span className={clsx(
                        "text-xs mt-2",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        Année 2
                      </span>
                    </div>
                    
                    {/* Year 3 */}
                    <div className="w-16 flex flex-col items-center">
                      <div 
                        className={clsx(
                          "w-10 rounded-t transition-all",
                          selectedScenario === 'best' 
                            ? darkMode ? "bg-green-500" : "bg-green-500" 
                            : selectedScenario === 'base' 
                              ? darkMode ? "bg-blue-500" : "bg-blue-500" 
                              : darkMode ? "bg-red-500" : "bg-red-500"
                        )}
                        style={{ 
                          height: `${(selectedScenario === 'best' 
                            ? financialData.projections.bestCase.revenue[2] 
                            : selectedScenario === 'base' 
                              ? financialData.projections.baseCase.revenue[2] 
                              : financialData.projections.worstCase.revenue[2]) / 250000}px` 
                        }}
                      />
                      <span className={clsx(
                        "text-xs mt-2",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        Année 3
                      </span>
                    </div>
                    
                    {/* Year 4 */}
                    <div className="w-16 flex flex-col items-center">
                      <div 
                        className={clsx(
                          "w-10 rounded-t transition-all",
                          selectedScenario === 'best' 
                            ? darkMode ? "bg-green-500" : "bg-green-500" 
                            : selectedScenario === 'base' 
                              ? darkMode ? "bg-blue-500" : "bg-blue-500" 
                              : darkMode ? "bg-red-500" : "bg-red-500"
                        )}
                        style={{ 
                          height: `${(selectedScenario === 'best' 
                            ? financialData.projections.bestCase.revenue[3] 
                            : selectedScenario === 'base' 
                              ? financialData.projections.baseCase.revenue[3] 
                              : financialData.projections.worstCase.revenue[3]) / 250000}px` 
                        }}
                      />
                      <span className={clsx(
                        "text-xs mt-2",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        Année 4
                      </span>
                    </div>
                    
                    {/* Year 5 */}
                    <div className="w-16 flex flex-col items-center">
                      <div 
                        className={clsx(
                          "w-10 rounded-t transition-all",
                          selectedScenario === 'best' 
                            ? darkMode ? "bg-green-500" : "bg-green-500" 
                            : selectedScenario === 'base' 
                              ? darkMode ? "bg-blue-500" : "bg-blue-500" 
                              : darkMode ? "bg-red-500" : "bg-red-500"
                        )}
                        style={{ 
                          height: `${(selectedScenario === 'best' 
                            ? financialData.projections.bestCase.revenue[4] 
                            : selectedScenario === 'base' 
                              ? financialData.projections.baseCase.revenue[4] 
                              : financialData.projections.worstCase.revenue[4]) / 250000}px` 
                        }}
                      />
                      <span className={clsx(
                        "text-xs mt-2",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        Année 5
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className={clsx(
                "p-4 rounded-lg",
                darkMode ? "bg-gray-700" : "bg-gray-50"
              )}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className={clsx(
                    "text-sm font-medium",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    CA Année 5
                  </h4>
                  <span className={clsx(
                    "text-sm font-semibold",
                    selectedScenario === 'best' 
                      ? darkMode ? "text-green-400" : "text-green-600" 
                      : selectedScenario === 'base' 
                        ? darkMode ? "text-blue-400" : "text-blue-600" 
                        : darkMode ? "text-red-400" : "text-red-600"
                  )}>
                    {formatCurrency(selectedScenario === 'best' 
                      ? financialData.projections.bestCase.revenue[4] 
                      : selectedScenario === 'base' 
                        ? financialData.projections.baseCase.revenue[4] 
                        : financialData.projections.worstCase.revenue[4])}
                  </span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className={clsx(
                    "h-4 w-4 mr-1",
                    selectedScenario === 'best' 
                      ? darkMode ? "text-green-400" : "text-green-600" 
                      : selectedScenario === 'base' 
                        ? darkMode ? "text-blue-400" : "text-blue-600" 
                        : darkMode ? "text-red-400" : "text-red-600"
                  )} />
                  <span className={clsx(
                    "text-xs",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    TCAC de {selectedScenario === 'best' 
                      ? '83%' 
                      : selectedScenario === 'base' 
                        ? '84%' 
                        : '74%'} sur 5 ans
                  </span>
                </div>
              </div>
              
              <div className={clsx(
                "p-4 rounded-lg",
                darkMode ? "bg-gray-700" : "bg-gray-50"
              )}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className={clsx(
                    "text-sm font-medium",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Profit Année 5
                  </h4>
                  <span className={clsx(
                    "text-sm font-semibold",
                    selectedScenario === 'best' 
                      ? darkMode ? "text-green-400" : "text-green-600" 
                      : selectedScenario === 'base' 
                        ? darkMode ? "text-blue-400" : "text-blue-600" 
                        : darkMode ? "text-red-400" : "text-red-600"
                  )}>
                    {formatCurrency(selectedScenario === 'best' 
                      ? financialData.projections.bestCase.profits[4] 
                      : selectedScenario === 'base' 
                        ? financialData.projections.baseCase.profits[4] 
                        : financialData.projections.worstCase.profits[4])}
                  </span>
                </div>
                <div className="flex items-center">
                  <Percent className={clsx(
                    "h-4 w-4 mr-1",
                    selectedScenario === 'best' 
                      ? darkMode ? "text-green-400" : "text-green-600" 
                      : selectedScenario === 'base' 
                        ? darkMode ? "text-blue-400" : "text-blue-600" 
                        : darkMode ? "text-red-400" : "text-red-600"
                  )} />
                  <span className={clsx(
                    "text-xs",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Marge de {selectedScenario === 'best' 
                      ? '35%' 
                      : selectedScenario === 'base' 
                        ? '35%' 
                        : '25%'}
                  </span>
                </div>
              </div>
              
              <div className={clsx(
                "p-4 rounded-lg",
                darkMode ? "bg-gray-700" : "bg-gray-50"
              )}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className={clsx(
                    "text-sm font-medium",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Seuil de rentabilité
                  </h4>
                  <span className={clsx(
                    "text-sm font-semibold",
                    selectedScenario === 'best' 
                      ? darkMode ? "text-green-400" : "text-green-600" 
                      : selectedScenario === 'base' 
                        ? darkMode ? "text-blue-400" : "text-blue-600" 
                        : darkMode ? "text-red-400" : "text-red-600"
                  )}>
                    {selectedScenario === 'best' 
                      ? 'Année 2' 
                      : selectedScenario === 'base' 
                        ? 'Année 2' 
                        : 'Année 3'}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className={clsx(
                    "h-4 w-4 mr-1",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )} />
                  <span className={clsx(
                    "text-xs",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    {selectedScenario === 'best' 
                      ? 'Mois 18' 
                      : selectedScenario === 'base' 
                        ? 'Mois 22' 
                        : 'Mois 30'}
                  </span>
                </div>
              </div>
              
              <div className={clsx(
                "p-4 rounded-lg",
                darkMode ? "bg-gray-700" : "bg-gray-50"
              )}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className={clsx(
                    "text-sm font-medium",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Valorisation estimée
                  </h4>
                  <span className={clsx(
                    "text-sm font-semibold",
                    selectedScenario === 'best' 
                      ? darkMode ? "text-green-400" : "text-green-600" 
                      : selectedScenario === 'base' 
                        ? darkMode ? "text-blue-400" : "text-blue-600" 
                        : darkMode ? "text-red-400" : "text-red-600"
                  )}>
                    {selectedScenario === 'best' 
                      ? '50M€' 
                      : selectedScenario === 'base' 
                        ? '40M€' 
                        : '25M€'}
                  </span>
                </div>
                <div className="flex items-center">
                  <Target className={clsx(
                    "h-4 w-4 mr-1",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )} />
                  <span className={clsx(
                    "text-xs",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Multiple de {selectedScenario === 'best' 
                      ? '5.7x' 
                      : selectedScenario === 'base' 
                        ? '5.7x' 
                        : '8.3x'} l'ARR
                  </span>
                </div>
              </div>
            </div>
            
            {/* Financial Table */}
            <div className={clsx(
              "overflow-x-auto rounded-lg",
              darkMode ? "bg-gray-700" : "bg-gray-50"
            )}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead>
                  <tr>
                    <th className={clsx(
                      "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      Indicateur
                    </th>
                    <th className={clsx(
                      "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      Année 1
                    </th>
                    <th className={clsx(
                      "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      Année 2
                    </th>
                    <th className={clsx(
                      "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      Année 3
                    </th>
                    <th className={clsx(
                      "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      Année 4
                    </th>
                    <th className={clsx(
                      "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      Année 5
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  <tr>
                    <td className={clsx(
                      "px-4 py-3 text-sm font-medium",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Chiffre d'affaires
                    </td>
                    {(selectedScenario === 'best' 
                      ? financialData.projections.bestCase.revenue 
                      : selectedScenario === 'base' 
                        ? financialData.projections.baseCase.revenue 
                        : financialData.projections.worstCase.revenue).map((value, index) => (
                      <td key={index} className={clsx(
                        "px-4 py-3 text-sm",
                        darkMode ? "text-gray-300" : "text-gray-700"
                      )}>
                        {formatCurrency(value)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={clsx(
                      "px-4 py-3 text-sm font-medium",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Coûts
                    </td>
                    {(selectedScenario === 'best' 
                      ? financialData.projections.bestCase.costs 
                      : selectedScenario === 'base' 
                        ? financialData.projections.baseCase.costs 
                        : financialData.projections.worstCase.costs).map((value, index) => (
                      <td key={index} className={clsx(
                        "px-4 py-3 text-sm",
                        darkMode ? "text-gray-300" : "text-gray-700"
                      )}>
                        {formatCurrency(value)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={clsx(
                      "px-4 py-3 text-sm font-medium",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Profits
                    </td>
                    {(selectedScenario === 'best' 
                      ? financialData.projections.bestCase.profits 
                      : selectedScenario === 'base' 
                        ? financialData.projections.baseCase.profits 
                        : financialData.projections.worstCase.profits).map((value, index) => (
                      <td key={index} className={clsx(
                        "px-4 py-3 text-sm",
                        value >= 0
                          ? darkMode ? "text-green-400" : "text-green-600"
                          : darkMode ? "text-red-400" : "text-red-600"
                      )}>
                        {formatCurrency(value)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={clsx(
                      "px-4 py-3 text-sm font-medium",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Marge (%)
                    </td>
                    {(selectedScenario === 'best' 
                      ? financialData.projections.bestCase.margins 
                      : selectedScenario === 'base' 
                        ? financialData.projections.baseCase.margins 
                        : financialData.projections.worstCase.margins).map((value, index) => (
                      <td key={index} className={clsx(
                        "px-4 py-3 text-sm",
                        value >= 0
                          ? darkMode ? "text-green-400" : "text-green-600"
                          : darkMode ? "text-red-400" : "text-red-600"
                      )}>
                        {value}%
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Investment Requirements Section */}
        <div className={clsx(
          "rounded-xl shadow-sm overflow-hidden mb-8",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className={clsx(
                  "p-2 rounded-full mr-3",
                  darkMode ? "bg-purple-900/30" : "bg-secondary-light"
                )}>
                  <DollarSign className={clsx(
                    "h-5 w-5",
                    darkMode ? "text-purple-400" : "text-primary"
                  )} />
                </div>
                <h2 className={clsx(
                  "text-lg font-semibold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Besoins d'Investissement
                </h2>
              </div>
              
              <button 
                onClick={() => toggleSection('investment')}
                className={clsx(
                  "p-1 rounded-full transition-colors",
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                )}
              >
                {activeSection === 'investment' ? (
                  <ChevronUp className={clsx(
                    "h-5 w-5",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )} />
                ) : (
                  <ChevronDown className={clsx(
                    "h-5 w-5",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )} />
                )}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className={clsx(
                  "text-sm font-semibold mb-4",
                  darkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Montant et allocation
                </h3>
                
                <div className="space-y-4">
                  <div className={clsx(
                    "p-4 rounded-lg",
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  )}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className={clsx(
                        "text-sm font-medium",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        Montant total requis
                      </h4>
                      <span className={clsx(
                        "text-sm font-semibold",
                        darkMode ? "text-purple-400" : "text-primary"
                      )}>
                        {formatCurrency(financialData.investmentRequirements.total)}
                      </span>
                    </div>
                    <p className={clsx(
                      "text-xs",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      Pour financer la croissance sur les 24 prochains mois
                    </p>
                  </div>
                  
                  <div className={clsx(
                    "p-4 rounded-lg",
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  )}>
                    <h4 className={clsx(
                      "text-sm font-medium mb-3",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Allocation des fonds
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={clsx(
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            Développement produit
                          </span>
                          <span className={clsx(
                            darkMode ? "text-gray-300" : "text-gray-700"
                          )}>
                            {formatCurrency(financialData.investmentRequirements.breakdown.product)} (40%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                          <div 
                            className={clsx(
                              darkMode ? "bg-purple-500" : "bg-primary"
                            )}
                            style={{ width: '40%' }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={clsx(
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            Marketing & Acquisition
                          </span>
                          <span className={clsx(
                            darkMode ? "text-gray-300" : "text-gray-700"
                          )}>
                            {formatCurrency(financialData.investmentRequirements.breakdown.marketing)} (30%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                          <div 
                            className={clsx(
                              darkMode ? "bg-blue-500" : "bg-blue-500"
                            )}
                            style={{ width: '30%' }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={clsx(
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            Opérations
                          </span>
                          <span className={clsx(
                            darkMode ? "text-gray-300" : "text-gray-700"
                          )}>
                            {formatCurrency(financialData.investmentRequirements.breakdown.operations)} (20%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                          <div 
                            className={clsx(
                              darkMode ? "bg-green-500" : "bg-green-500"
                            )}
                            style={{ width: '20%' }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={clsx(
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            Autres
                          </span>
                          <span className={clsx(
                            darkMode ? "text-gray-300" : "text-gray-700"
                          )}>
                            {formatCurrency(financialData.investmentRequirements.breakdown.other)} (10%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                          <div 
                            className={clsx(
                              darkMode ? "bg-yellow-500" : "bg-yellow-500"
                            )}
                            style={{ width: '10%' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className={clsx(
                      "p-4 rounded-lg",
                      darkMode ? "bg-gray-700" : "bg-gray-50"
                    )}>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className={clsx(
                          "text-sm font-medium",
                          darkMode ? "text-white" : "text-gray-900"
                        )}>
                          Burn rate mensuel
                        </h4>
                        <span className={clsx(
                          "text-sm font-semibold",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {formatCurrency(financialData.investmentRequirements.burnRate)}
                        </span>
                      </div>
                    </div>
                    
                    <div className={clsx(
                      "p-4 rounded-lg",
                      darkMode ? "bg-gray-700" : "bg-gray-50"
                    )}>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className={clsx(
                          "text-sm font-medium",
                          darkMode ? "text-white" : "text-gray-900"
                        )}>
                          Runway
                        </h4>
                        <span className={clsx(
                          "text-sm font-semibold",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {financialData.investmentRequirements.runway} mois
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className={clsx(
                  "text-sm font-semibold mb-4",
                  darkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Simulateur d'investissement
                </h3>
                
                <div className={clsx(
                  "p-4 rounded-lg",
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                )}>
                  <div className="space-y-4">
                    <div>
                      <label className={clsx(
                        "block text-sm font-medium mb-2",
                        darkMode ? "text-gray-300" : "text-gray-700"
                      )}>
                        Montant d'investissement
                      </label>
                      <input
                        type="range"
                        min="500000"
                        max="5000000"
                        step="100000"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between mt-1">
                        <span className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          500K€
                        </span>
                        <span className={clsx(
                          "text-sm font-medium",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {formatCurrency(investmentAmount)}
                        </span>
                        <span className={clsx(
                          "text- xys",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          5M€
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className={clsx(
                        "block text-sm font-medium mb-2",
                        darkMode ? "text-gray-300" : "text-gray-700"
                      )}>
                        Pourcentage d'equity cédé
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="40"
                        step="1"
                        value={equityPercentage}
                        onChange={(e) => setEquityPercentage(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between mt-1">
                        <span className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          5%
                        </span>
                        <span className={clsx(
                          "text-sm font-medium",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {equityPercentage}%
                        </span>
                        <span className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          40%
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className={clsx(
                        "block text-sm font-medium mb-2",
                        darkMode ? "text-gray-300" : "text-gray-700"
                      )}>
                        Temps jusqu'au breakeven (mois)
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="60"
                        step="1"
                        value={timeToBreakeven}
                        onChange={(e) => setTimeToBreakeven(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between mt-1">
                        <span className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          12 mois
                        </span>
                        <span className={clsx(
                          "text-sm font-medium",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {timeToBreakeven} mois
                        </span>
                        <span className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          60 mois
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={clsx(
                    "mt-6 p-4 rounded-lg",
                    darkMode ? "bg-gray-800" : "bg-white"
                  )}>
                    <h4 className={clsx(
                      "text-sm font-medium mb-3",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Résultats de la simulation
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Valorisation post-money
                        </p>
                        <p className={clsx(
                          "text-sm font-medium",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {formatCurrency(investmentAmount / (equityPercentage / 100))}
                        </p>
                      </div>
                      
                      <div>
                        <p className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Valorisation pre-money
                        </p>
                        <p className={clsx(
                          "text-sm font-medium",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {formatCurrency((investmentAmount / (equityPercentage / 100)) - investmentAmount)}
                        </p>
                      </div>
                      
                      <div>
                        <p className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Multiple à la sortie
                        </p>
                        <p className={clsx(
                          "text-sm font-medium",
                          darkMode ? "text-green-400" : "text-green-600"
                        )}>
                          {roiData.multiple}
                        </p>
                      </div>
                      
                      <div>
                        <p className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Rendement annuel
                        </p>
                        <p className={clsx(
                          "text-sm font-medium",
                          darkMode ? "text-green-400" : "text-green-600"
                        )}>
                          {roiData.annualReturn}
                        </p>
                      </div>
                      
                      <div>
                        <p className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Valeur à la sortie
                        </p>
                        <p className={clsx(
                          "text-sm font-medium",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {roiData.exitValue}
                        </p>
                      </div>
                      
                      <div>
                        <p className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Part investisseur
                        </p>
                        <p className={clsx(
                          "text-sm font-medium",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {roiData.investorShare}
                        </p>
                      </div>
                    </div>
                    
                    <div className={clsx(
                      "mt-4 p-2 rounded",
                      timeToBreakeven <= 24
                        ? darkMode ? "bg-green-900/20 text-green-400" : "bg-green-50 text-green-800"
                        : timeToBreakeven <= 36
                          ? darkMode ? "bg-yellow-900/20 text-yellow-400" : "bg-yellow-50 text-yellow-800"
                          : darkMode ? "bg-red-900/20 text-red-400" : "bg-red-50 text-red-800"
                    )}>
                      <div className="flex items-start">
                        {timeToBreakeven <= 24 ? (
                          <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
                        )}
                        <p className="text-xs">
                          {timeToBreakeven <= 24
                            ? "Délai de rentabilité attractif pour les investisseurs."
                            : timeToBreakeven <= 36
                              ? "Délai de rentabilité acceptable mais à optimiser."
                              : "Délai de rentabilité trop long pour attirer des investisseurs."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {activeSection === 'investment' && (
              <div className={clsx(
                "p-4 rounded-lg mt-4",
                darkMode ? "bg-gray-700" : "bg-gray-50"
              )}>
                <h3 className={clsx(
                  "text-sm font-semibold mb-4",
                  darkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Détails des besoins d'investissement
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className={clsx(
                      "text-sm font-medium mb-2",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Développement produit (1 200 000 €)
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        Équipe d'ingénieurs (6 personnes): 720 000 €
                      </li>
                      <li className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        Infrastructure et outils: 180 000 €
                      </li>
                      <li className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        Développement de nouvelles fonctionnalités: 300 000 €
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className={clsx(
                      "text-sm font-medium mb-2",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Marketing & Acquisition (900 000 €)
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        Équipe marketing (3 personnes): 360 000 €
                      </li>
                      <li className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        Campagnes d'acquisition: 400 000 €
                      </li>
                      <li className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        Événements et PR: 140 000 €
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className={clsx(
                      "text-sm font-medium mb-2",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Opérations (600 000 €)
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        Équipe opérationnelle (2 personnes): 240 000 €
                      </li>
                      <li className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        Locaux et équipements: 120 000 €
                      </li>
                      <li className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        Services juridiques et comptables: 100 000 €
                      </li>
                      <li className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        Autres frais opérationnels: 140 000 €
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className={clsx(
                      "text-sm font-medium mb-2",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Autres (300 000 €)
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        Réserve de trésorerie: 200 000 €
                      </li>
                      <li className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        Dépenses imprévues: 100 000 €
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Investor Requirements Section */}
        <div className={clsx(
          "rounded-xl shadow-sm overflow-hidden mb-8",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className={clsx(
                  "p-2 rounded-full mr-3",
                  darkMode ? "bg-purple-900/30" : "bg-secondary-light"
                )}>
                  <Users className={clsx(
                    "h-5 w-5",
                    darkMode ? "text-purple-400" : "text-primary"
                  )} />
                </div>
                <h2 className={clsx(
                  "text-lg font-semibold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Conditions pour les Investisseurs
                </h2>
              </div>
              
              <button 
                onClick={() => toggleSection('investors')}
                className={clsx(
                  "p-1 rounded-full transition-colors",
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                )}
              >
                {activeSection === 'investors' ? (
                  <ChevronUp className={clsx(
                    "h-5 w-5",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )} />
                ) : (
                  <ChevronDown className={clsx(
                    "h-5 w-5",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )} />
                )}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className={clsx(
                  "text-sm font-semibold mb-4",
                  darkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Attentes des investisseurs
                </h3>
                
                <div className="space-y-4">
                  <div className={clsx(
                    "p-4 rounded-lg",
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  )}>
                    <h4 className={clsx(
                      "text-sm font-medium mb-3",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Critères financiers
                    </h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={clsx(
                          "text-sm",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Ticket minimum
                        </span>
                        <span className={clsx(
                          "text-sm font-medium",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {formatCurrency(financialData.investorRequirements.minimumTicket)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className={clsx(
                          "text-sm",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          ROI cible
                        </span>
                        <span className={clsx(
                          "text-sm font-medium",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {financialData.investorRequirements.targetROI}x
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className={clsx(
                          "text-sm",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Horizon d'investissement
                        </span>
                        <span className={clsx(
                          "text-sm font-medium",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {financialData.investorRequirements.expectedTimeframe} ans
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={clsx(
                    "p-4 rounded-lg",
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  )}>
                    <h4 className={clsx(
                      "text-sm font-medium mb-3",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Métriques clés surveillées
                    </h4>
                    
                    <div className="space-y-2">
                      {financialData.investorRequirements.keyMetrics.map((metric, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className={clsx(
                            "h-4 w-4 mr-2",
                            darkMode ? "text-green-400" : "text-green-500"
                          )} />
                          <span className={clsx(
                            "text-sm",
                            darkMode ? "text-gray-300" : "text-gray-700"
                          )}>
                            {metric}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className={clsx(
                    "p-4 rounded-lg",
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  )}>
                    <h4 className={clsx(
                      "text-sm font-medium mb-3",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Stratégies de sortie préférées
                    </h4>
                    
                    <div className="space-y-2">
                      {financialData.investorRequirements.exitStrategy.map((strategy, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className={clsx(
                            "h-4 w-4 mr-2",
                            darkMode ? "text-green-400" : "text-green-500"
                          )} />
                          <span className={clsx(
                            "text-sm",
                            darkMode ? "text-gray-300" : "text-gray-700"
                          )}>
                            {strategy}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className={clsx(
                  "text-sm font-semibold mb-4",
                  darkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Critères d'investissement par type d'investisseur
                </h3>
                
                <div className="space-y-4">
                  {financialData.investmentCriteria.map((criteria, index) => (
                    <div 
                      key={index}
                      className={clsx(
                        "p-4 rounded-lg",
                        darkMode ? "bg-gray-700" : "bg-gray-50"
                      )}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className={clsx(
                          "text-sm font-medium",
                          darkMode ? "text-white" : "text-gray-900"
                        )}>
                          {criteria.type}
                        </h4>
                        <div className={clsx(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          criteria.successRate >= 60
                            ? darkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-800"
                            : criteria.successRate >= 40
                              ? darkMode ? "bg-yellow-900/30 text-yellow-300" : "bg-yellow-100 text-yellow-800"
                              : darkMode ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-800"
                        )}>
                          {criteria.successRate}% de chances
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                        <div>
                          <p className={clsx(
                            "text-xs",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            Ticket
                          </p>
                          <p className={clsx(
                            "text-sm",
                            darkMode ? "text-gray-300" : "text-gray-700"
                          )}>
                            {criteria.ticketSize}
                          </p>
                        </div>
                        
                        <div>
                          <p className={clsx(
                            "text-xs",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            Equity
                          </p>
                          <p className={clsx(
                            "text-sm",
                            darkMode ? "text-gray-300" : "text-gray-700"
                          )}>
                            {criteria.equity}
                          </p>
                        </div>
                        
                        <div>
                          <p className={clsx(
                            "text-xs",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            Horizon
                          </p>
                          <p className={clsx(
                            "text-sm",
                            darkMode ? "text-gray-300" : "text-gray-700"
                          )}>
                            {criteria.timeline}
                          </p>
                        </div>
                        
                        <div>
                          <p className={clsx(
                            "text-xs",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            Focus
                          </p>
                          <p className={clsx(
                            "text-sm",
                            darkMode ? "text-gray-300" : "text-gray-700"
                          )}>
                            {criteria.focus}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <p className={clsx(
                          "text-xs mb-1",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Exigences
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {criteria.requirements.map((req, idx) => (
                            <li 
                              key={idx}
                              className={clsx(
                                "text-xs",
                                darkMode ? "text-gray-300" : "text-gray-700"
                              )}
                            >
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {activeSection === 'investors' && (
              <div className={clsx(
                "p-4 rounded-lg mt-4",
                darkMode ? "bg-gray-700" : "bg-gray-50"
              )}>
                <h3 className={clsx(
                  "text-sm font-semibold mb-4",
                  darkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Exigences de gouvernance
                </h3>
                
                <div className="space-y-4">
                  <p className={clsx(
                    "text-sm",
                    darkMode ? "text-gray-300" : "text-gray-600"
                  )}>
                    Les investisseurs, en particulier les fonds de capital-risque, demandent généralement certains droits de gouvernance en échange de leur investissement. Voici les exigences typiques:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={clsx(
                      "p-3 rounded-lg",
                      darkMode ? "bg-gray-800" : "bg-white"
                    )}>
                      <h4 className={clsx(
                        "text-sm font-medium mb-2",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        Siège au conseil d'administration
                      </h4>
                      <p className={clsx(
                        "text-xs",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        Les investisseurs principaux demandent généralement un siège au conseil d'administration pour participer aux décisions stratégiques.
                      </p>
                    </div>
                    
                    <div className={clsx(
                      "p-3 rounded-lg",
                      darkMode ? "bg-gray-800" : "bg-white"
                    )}>
                      <h4 className={clsx(
                        "text-sm font-medium mb-2",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        Droits d'information
                      </h4>
                      <p className={clsx(
                        "text-xs",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        Accès régulier aux informations financières et opérationnelles de l'entreprise (rapports mensuels, trimestriels).
                      </p>
                    </div>
                    
                    <div className={clsx(
                      "p-3 rounded-lg",
                      darkMode ? "bg-gray-800" : "bg-white"
                    )}>
                      <h4 className={clsx(
                        "text-sm font-medium mb-2",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        Droits de préemption
                      </h4>
                      <p className={clsx(
                        "text-xs",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        Possibilité de maintenir leur pourcentage de propriété lors des futures levées de fonds (droits pro-rata).
                      </p>
                    </div>
                    
                    <div className={clsx(
                      "p-3 rounded-lg",
                      darkMode ? "bg-gray-800" : "bg-white"
                    )}>
                      <h4 className={clsx(
                        "text-sm font-medium mb-2",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        Droits de veto
                      </h4>
                      <p className={clsx(
                        "text-xs",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        Droit de bloquer certaines décisions importantes comme les changements dans la structure du capital, les acquisitions, ou la vente de l'entreprise.
                      </p>
                    </div>
                    
                    <div className={clsx(
                      "p-3 rounded-lg",
                      darkMode ? "bg-gray-800" : "bg-white"
                    )}>
                      <h4 className={clsx(
                        "text-sm font-medium mb-2",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        Clauses de liquidité
                      </h4>
                      <p className={clsx(
                        "text-xs",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        Dispositions pour faciliter la sortie des investisseurs après une certaine période (droits de cession, clauses de sortie forcée).
                      </p>
                    </div>
                    
                    <div className={clsx(
                      "p-3 rounded-lg",
                      darkMode ? "bg-gray-800" : "bg-white"
                    )}>
                      <h4 className={clsx(
                        "text-sm font-medium mb-2",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        Protection anti-dilution
                      </h4>
                      <p className={clsx(
                        "text-xs",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        Protection contre la dilution excessive lors des futures levées de fonds, surtout si elles sont réalisées à une valorisation inférieure.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Recommendations Section */}
        <div className={clsx(
          "rounded-xl shadow-sm overflow-hidden",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="p-6">
            <div className="flex items-start">
              <div className={clsx(
                "p-2 rounded-full mr-3 flex-shrink-0",
                darkMode ? "bg-amber-900/30" : "bg-amber-100"
              )}>
                <Info className={clsx(
                  "h-5 w-5",
                  darkMode ? "text-amber-400" : "text-amber-600"
                )} />
              </div>
              <div>
                <h2 className={clsx(
                  "text-lg font-semibold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Recommandations pour optimiser votre levée de fonds
                </h2>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className={clsx(
                      "text-md font-medium mb-2",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Préparation du dossier
                    </h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        <span className="font-medium">Pitch deck convaincant:</span> Mettez en avant votre proposition de valeur unique, votre marché et votre traction actuelle.
                      </li>
                      <li className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        <span className="font-medium">Prévisions financières solides:</span> Présentez des projections réalistes avec des hypothèses clairement documentées.
                      </li>
                      <li className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        <span className="font-medium">Plan d'utilisation des fonds:</span> Détaillez précisément comment l'investissement sera utilisé et quel impact il aura sur votre croissance.
                      </li>
                      <li className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        <span className="font-medium">Due diligence prête:</span> Préparez à l'avance tous les documents juridiques, financiers et commerciaux que les investisseurs pourraient demander.
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className={clsx(
                      "text-md font-medium mb-2",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      Stratégie de financement
                    </h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        <span className="font-medium">Mix de financement:</span> Combinez financement dilutif (80%) et non dilutif (20%) pour optimiser votre structure de capital.
                      </li>
                      <li className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        <span className="font-medium">Valorisation équilibrée:</span> Visez une valorisation entre 12M€ et 15M€, ce qui correspond à un multiple de 12-15x votre ARR actuel.
                      </li>
                      <li className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        <span className="font-medium">Dilution raisonnable:</span> Limitez la dilution à 20-25% pour ce tour de financement afin de préserver le contrôle des fondateurs.
                      </li>
                      <li className={clsx(
                        "text-sm",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        <span className="font-medium">Timing stratégique:</span> Commencez votre levée avec au moins 6-9 mois de runway restant pour négocier en position de force.
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className={clsx(
                  "mt-6 p-4 rounded-lg border-2 border-dashed",
                  darkMode 
                    ? "bg-purple-900/10 border-purple-800/30 text-purple-300" 
                    : "bg-secondary-light/30 border-secondary-lighter/50 text-primary"
                )}>
                  <div className="flex items-start">
                    <Sparkles className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium mb-1">Analyse IA</h4>
                      <p className="text-sm">
                        Basé sur vos projections financières et votre modèle d'affaires, nous recommandons de cibler des investisseurs de type Venture Capital spécialisés dans le secteur Healthtech avec une expérience en Seed/Series A. Votre profil correspond particulièrement bien aux critères d'investissement de fonds comme Elaia Partners, Partech Ventures et Kima Ventures, avec une probabilité de succès estimée à 65-75%.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;