import React, { useState } from 'react';
import { Info, TrendingUp, DollarSign, BarChart3, CheckCircle, AlertCircle, Clock, PieChart, Users } from 'lucide-react';
import clsx from 'clsx';

const FinancialJourney: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  
  // Mock financial data
  const financialData = {
    current: {
      revenue: 850000,
      netIncome: -120000,
      cash: 450000,
      debt: 0
    },
    fundingGoals: {
      amount: 3000000,
      type: 'Série A',
      timeline: 'Q3 2024',
      valuation: {
        min: 12000000,
        max: 15000000
      },
      dilution: {
        min: 20,
        max: 25
      }
    },
    fundingStrategy: {
      maxDilution: 25,
      targetValuation: {
        seriesA: '12-15M€',
        seriesB: '40-50M€'
      },
      burnRate: {
        current: '180K€/mois',
        postSeriesA: '250K€/mois'
      },
      runway: {
        current: '10 mois',
        postSeriesA: '24 mois'
      }
    },
    // Ownership structure data
    ownership: {
      current: {
        founders: 85,
        seedInvestors: 15,
        employees: 0
      },
      postSeriesA: {
        founders: 65,
        seedInvestors: 12,
        seriesAInvestors: 20,
        employees: 3
      },
      postSeriesB: {
        founders: 52,
        seedInvestors: 10,
        seriesAInvestors: 16,
        seriesBInvestors: 17,
        employees: 5
      },
      postSeriesC: {
        founders: 44,
        seedInvestors: 8,
        seriesAInvestors: 14,
        seriesBInvestors: 14,
        seriesCInvestors: 15,
        employees: 5
      }
    },
    // Funding mix data
    fundingMix: {
      seriesA: {
        equity: 80, // percentage
        debt: 10,
        grants: 10
      },
      seriesB: {
        equity: 85,
        debt: 15,
        grants: 0
      },
      seriesC: {
        equity: 90,
        debt: 10,
        grants: 0
      }
    }
  };
  
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
              Parcours Financier
            </h1>
            <p className={clsx(
              "mt-1",
              darkMode ? "text-gray-400" : "text-gray-500"
            )}>
              Planifiez votre stratégie de financement et suivez votre progression
            </p>
          </div>
        </div>
        
        <div className={clsx(
          "rounded-xl shadow-sm overflow-hidden",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="p-6">
            <h2 className={clsx(
              "text-lg font-semibold mb-6",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Stratégie de Financement
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Funding Strategy */}
              <div>
                <h3 className={clsx(
                  "text-sm font-semibold mb-4",
                  darkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Paramètres de la stratégie
                </h3>
                
                <div className="space-y-4">
                  <div className={clsx(
                    "p-4 rounded-lg",
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  )}>
                    <div className="mb-2">
                      <h4 className={clsx(
                        "text-sm font-medium",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        Paramètres clés
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Dilution maximale:
                        </span>
                        <span className={clsx(
                          "text-xs font-medium",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {financialData.fundingStrategy.maxDilution}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Valorisation Série A:
                        </span>
                        <span className={clsx(
                          "text-xs font-medium",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {financialData.fundingStrategy.targetValuation.seriesA}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Valorisation Série B:
                        </span>
                        <span className={clsx(
                          "text-xs font-medium",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {financialData.fundingStrategy.targetValuation.seriesB}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Structure d'actionnariat */}
                  <div className={clsx(
                    "p-4 rounded-lg",
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  )}>
                    <div className="mb-3">
                      <h4 className={clsx(
                        "text-sm font-medium flex items-center",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        <Users className="h-4 w-4 mr-1" />
                        Structure d'actionnariat
                      </h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className={clsx(
                          "text-xs font-medium mb-2",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          Actuel (Post-Seed)
                        </h5>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 dark:bg-gray-600 h-4 rounded-full overflow-hidden">
                            <div className="flex h-full">
                              <div 
                                className="bg-blue-500 dark:bg-blue-600" 
                                style={{width: `${financialData.ownership.current.founders}%`}}
                                title={`Fondateurs: ${financialData.ownership.current.founders}%`}
                              />
                              <div 
                                className="bg-green-500 dark:bg-green-600" 
                                style={{width: `${financialData.ownership.current.seedInvestors}%`}}
                                title={`Investisseurs Seed: ${financialData.ownership.current.seedInvestors}%`}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className={clsx(
                            darkMode ? "text-blue-400" : "text-blue-600"
                          )}>
                            Fondateurs: {financialData.ownership.current.founders}%
                          </span>
                          <span className={clsx(
                            darkMode ? "text-green-400" : "text-green-600"
                          )}>
                            Investisseurs: {financialData.ownership.current.seedInvestors}%
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className={clsx(
                          "text-xs font-medium mb-2",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          Post-Série A (Prévisionnel)
                        </h5>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 dark:bg-gray-600 h-4 rounded-full overflow-hidden">
                            <div className="flex h-full">
                              <div 
                                className="bg-blue-500 dark:bg-blue-600" 
                                style={{width: `${financialData.ownership.postSeriesA.founders}%`}}
                                title={`Fondateurs: ${financialData.ownership.postSeriesA.founders}%`}
                              />
                              <div 
                                className="bg-green-500 dark:bg-green-600" 
                                style={{width: `${financialData.ownership.postSeriesA.seedInvestors}%`}}
                                title={`Investisseurs Seed: ${financialData.ownership.postSeriesA.seedInvestors}%`}
                              />
                              <div 
                                className="bg-purple-500 dark:bg-purple-600" 
                                style={{width: `${financialData.ownership.postSeriesA.seriesAInvestors}%`}}
                                title={`Investisseurs Série A: ${financialData.ownership.postSeriesA.seriesAInvestors}%`}
                              />
                              <div 
                                className="bg-yellow-500 dark:bg-yellow-600" 
                                style={{width: `${financialData.ownership.postSeriesA.employees}%`}}
                                title={`Employés: ${financialData.ownership.postSeriesA.employees}%`}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 text-xs mt-1">
                          <span className={clsx(
                            darkMode ? "text-blue-400" : "text-blue-600"
                          )}>
                            Fondateurs: {financialData.ownership.postSeriesA.founders}%
                          </span>
                          <span className={clsx(
                            darkMode ? "text-green-400" : "text-green-600"
                          )}>
                            Seed: {financialData.ownership.postSeriesA.seedInvestors}%
                          </span>
                          <span className={clsx(
                            darkMode ? "text-purple-400" : "text-purple-600"
                          )}>
                            Série A: {financialData.ownership.postSeriesA.seriesAInvestors}%
                          </span>
                          <span className={clsx(
                            darkMode ? "text-yellow-400" : "text-yellow-600"
                          )}>
                            Employés: {financialData.ownership.postSeriesA.employees}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mix de financement */}
                  <div className={clsx(
                    "p-4 rounded-lg",
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  )}>
                    <div className="mb-3">
                      <h4 className={clsx(
                        "text-sm font-medium flex items-center",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        <PieChart className="h-4 w-4 mr-1" />
                        Mix de financement recommandé
                      </h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className={clsx(
                          "text-xs font-medium mb-2",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          Série A
                        </h5>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 dark:bg-gray-600 h-4 rounded-full overflow-hidden">
                            <div className="flex h-full">
                              <div 
                                className="bg-purple-500 dark:bg-purple-600" 
                                style={{width: `${financialData.fundingMix.seriesA.equity}%`}}
                                title={`Equity (dilutif): ${financialData.fundingMix.seriesA.equity}%`}
                              />
                              <div 
                                className="bg-blue-500 dark:bg-blue-600" 
                                style={{width: `${financialData.fundingMix.seriesA.debt}%`}}
                                title={`Dette (non dilutif): ${financialData.fundingMix.seriesA.debt}%`}
                              />
                              <div 
                                className="bg-green-500 dark:bg-green-600" 
                                style={{width: `${financialData.fundingMix.seriesA.grants}%`}}
                                title={`Subventions (non dilutif): ${financialData.fundingMix.seriesA.grants}%`}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-x-2 text-xs mt-1">
                          <span className={clsx(
                            darkMode ? "text-purple-400" : "text-purple-600"
                          )}>
                            Equity: {financialData.fundingMix.seriesA.equity}%
                          </span>
                          <span className={clsx(
                            darkMode ? "text-blue-400" : "text-blue-600"
                          )}>
                            Dette: {financialData.fundingMix.seriesA.debt}%
                          </span>
                          <span className={clsx(
                            darkMode ? "text-green-400" : "text-green-600"
                          )}>
                            Subventions: {financialData.fundingMix.seriesA.grants}%
                          </span>
                        </div>
                        <div className="flex justify-between text-xs mt-2">
                          <span className={clsx(
                            "font-medium",
                            darkMode ? "text-purple-400" : "text-purple-600"
                          )}>
                            Dilutif: {financialData.fundingMix.seriesA.equity}%
                          </span>
                          <span className={clsx(
                            "font-medium",
                            darkMode ? "text-green-400" : "text-green-600"
                          )}>
                            Non dilutif: {financialData.fundingMix.seriesA.debt + financialData.fundingMix.seriesA.grants}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={clsx(
                    "p-4 rounded-lg",
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  )}>
                    <div className="mb-2">
                      <h4 className={clsx(
                        "text-sm font-medium",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        Burn Rate
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Actuel:
                        </span>
                        <span className={clsx(
                          "text-xs font-medium",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {financialData.fundingStrategy.burnRate.current}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Post-Série A:
                        </span>
                        <span className={clsx(
                          "text-xs font-medium",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {financialData.fundingStrategy.burnRate.postSeriesA}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={clsx(
                    "p-4 rounded-lg",
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  )}>
                    <div className="mb-2">
                      <h4 className={clsx(
                        "text-sm font-medium",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        Runway
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Actuel:
                        </span>
                        <span className={clsx(
                          "text-xs font-medium",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {financialData.fundingStrategy.runway.current}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={clsx(
                          "text-xs",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Post-Série A:
                        </span>
                        <span className={clsx(
                          "text-xs font-medium",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {financialData.fundingStrategy.runway.postSeriesA}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={clsx(
                    "p-4 rounded-lg border-2 border-dashed",
                    darkMode 
                      ? "bg-purple-900/10 border-purple-800/30 text-purple-300" 
                      : "bg-secondary-light/30 border-secondary-lighter/50 text-primary"
                  )}>
                    <div className="flex items-start">
                      <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium mb-1">Recommandation IA</h4>
                        <p className="text-xs">
                          Basé sur votre taux de croissance et votre burn rate actuel, nous recommandons de préparer votre Série A pour Q3 2024 avec un objectif de 3M€ pour assurer 24 mois de runway. Privilégiez un mix de financement avec 20% non dilutif (dette, subventions) pour préserver votre capital.
                        </p>
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
                  Calendrier de financement recommandé
                </h3>
                
                <div className="relative">
                  {/* Timeline */}
                  <div className={clsx(
                    "absolute top-5 left-5 h-full w-0.5",
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  )} />
                  
                  {/* Timeline items */}
                  <div className="space-y-8">
                    {/* Current */}
                    <div className="relative pl-10">
                      <div className={clsx(
                        "absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center",
                        darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                      )}>
                        <span className="text-sm font-medium">Now</span>
                      </div>
                      <div className={clsx(
                        "p-4 rounded-lg",
                        darkMode ? "bg-gray-700" : "bg-gray-50"
                      )}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={clsx(
                            "text-sm font-medium",
                            darkMode ? "text-white" : "text-gray-900"
                          )}>
                            Situation actuelle
                          </h4>
                          <div className={clsx(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            darkMode ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-700"
                          )}>
                            N/A
                          </div>
                        </div>
                        <p className={clsx(
                          "text-xs mb-3",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Seed round de 750K€ réalisé en Q2 2023. Runway actuel de 10 mois avec un burn rate de 180K€/mois.
                        </p>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center">
                            <Clock className={clsx(
                              "h-4 w-4 mr-1",
                              darkMode ? "text-gray-400" : "text-gray-500"
                            )} />
                            <span className={clsx(
                              "text-xs",
                              darkMode ? "text-gray-400" : "text-gray-500"
                            )}>
                              Préparation de la prochaine levée
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Users className={clsx(
                              "h-4 w-4 mr-1",
                              darkMode ? "text-blue-400" : "text-blue-600"
                            )} />
                            <span className={clsx(
                              "text-xs",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              Fondateurs: {financialData.ownership.current.founders}% | Investisseurs: {financialData.ownership.current.seedInvestors}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Series A */}
                    <div className="relative pl-10">
                      <div className={clsx(
                        "absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center",
                        darkMode ? "bg-purple-900/50 text-purple-300" : "bg-secondary-light text-primary"
                      )}>
                        <span className="text-sm font-medium">A</span>
                      </div>
                      <div className={clsx(
                        "p-4 rounded-lg border-2",
                        darkMode 
                          ? "bg-gray-700 border-purple-800/30" 
                          : "bg-gray-50 border-secondary-lighter/30"
                      )}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={clsx(
                            "text-sm font-medium",
                            darkMode ? "text-white" : "text-gray-900"
                          )}>
                            Série A
                          </h4>
                          <div className={clsx(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            darkMode ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-700"
                          )}>
                            75% de chances
                          </div>
                        </div>
                        <p className={clsx(
                          "text-xs mb-3",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Objectif de 3M€ pour une valorisation de 12-15M€. Dilution estimée de 20-25%.
                        </p>
                        <div className={clsx(
                          "text-xs p-2 rounded mb-3",
                          darkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-700"
                        )}>
                          <div className="font-medium mb-1">Objectifs clés avant la levée:</div>
                          <ul className="list-disc list-inside space-y-1">
                            <li>ARR de 1.2M€</li>
                            <li>Expansion dans 3 nouveaux pays</li>
                            <li>Équipe de 15 personnes</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <CheckCircle className={clsx(
                              "h-4 w-4 mr-1",
                              darkMode ? "text-green-400" : "text-green-500"
                            )} />
                            <span className={clsx(
                              "text-xs",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              Facteurs de succès: Traction commerciale, équipe complète
                            </span>
                          </div>
                          <div className="flex items-center">
                            <AlertCircle className={clsx(
                              "h-4 w-4 mr-1",
                              darkMode ? "text-amber-400" : "text-amber-500"
                            )} />
                            <span className={clsx(
                              "text-xs",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              Risques: Concurrence, contexte économique
                            </span>
                          </div>
                          <div className="flex items-center">
                            <PieChart className={clsx(
                              "h-4 w-4 mr-1",
                              darkMode ? "text-purple-400" : "text-purple-600"
                            )} />
                            <span className={clsx(
                              "text-xs",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              Mix: {financialData.fundingMix.seriesA.equity}% dilutif | {financialData.fundingMix.seriesA.debt + financialData.fundingMix.seriesA.grants}% non dilutif
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Users className={clsx(
                              "h-4 w-4 mr-1",
                              darkMode ? "text-blue-400" : "text-blue-600"
                            )} />
                            <span className={clsx(
                              "text-xs",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              Fondateurs: {financialData.ownership.postSeriesA.founders}% | Investisseurs: {financialData.ownership.postSeriesA.seedInvestors + financialData.ownership.postSeriesA.seriesAInvestors}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Series B */}
                    <div className="relative pl-10">
                      <div className={clsx(
                        "absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center",
                        darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                      )}>
                        <span className="text-sm font-medium">B</span>
                      </div>
                      <div className={clsx(
                        "p-4 rounded-lg",
                        darkMode ? "bg-gray-700" : "bg-gray-50"
                      )}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={clsx(
                            "text-sm font-medium",
                            darkMode ? "text-white" : "text-gray-900"
                          )}>
                            Série B
                          </h4>
                          <div className={clsx(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            darkMode ? "bg-amber-900/50 text-amber-300" : "bg-amber-100 text-amber-700"
                          )}>
                            45% de chances
                          </div>
                        </div>
                        <p className={clsx(
                          "text-xs mb-3",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Objectif de 5-8M€ pour une valorisation de 40-50M€. Dilution estimée de 15-20%.
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <CheckCircle className={clsx(
                              "h-4 w-4 mr-1",
                              darkMode ? "text-green-400" : "text-green-500"
                            )} />
                            <span className={clsx(
                              "text-xs",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              Facteurs de succès: Croissance internationale, rentabilité
                            </span>
                          </div>
                          <div className="flex items-center">
                            <AlertCircle className={clsx(
                              "h-4 w-4 mr-1",
                              darkMode ? "text-amber-400" : "text-amber-500"
                            )} />
                            <span className={clsx(
                              "text-xs",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              Risques: Exécution de la Série A, scalabilité
                            </span>
                          </div>
                          <div className="flex items-center">
                            <PieChart className={clsx(
                              "h-4 w-4 mr-1",
                              darkMode ? "text-purple-400" : "text-purple-600"
                            )} />
                            <span className={clsx(
                              "text-xs",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              Mix: {financialData.fundingMix.seriesB.equity}% dilutif | {financialData.fundingMix.seriesB.debt + financialData.fundingMix.seriesB.grants}% non dilutif
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Users className={clsx(
                              "h-4 w-4 mr-1",
                              darkMode ? "text-blue-400" : "text-blue-600"
                            )} />
                            <span className={clsx(
                              "text-xs",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              Fondateurs: {financialData.ownership.postSeriesB.founders}% | Investisseurs: {financialData.ownership.postSeriesB.seedInvestors + financialData.ownership.postSeriesB.seriesAInvestors + financialData.ownership.postSeriesB.seriesBInvestors}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Series C */}
                    <div className="relative pl-10">
                      <div className={clsx(
                        "absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center",
                        darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                      )}>
                        <span className="text-sm font-medium">C</span>
                      </div>
                      <div className={clsx(
                        "p-4 rounded-lg",
                        darkMode ? "bg-gray-700" : "bg-gray-50"
                      )}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={clsx(
                            "text-sm font-medium",
                            darkMode ? "text-white" : "text-gray-900"
                          )}>
                            Série C
                          </h4>
                          <div className={clsx(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            darkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700"
                          )}>
                            20% de chances
                          </div>
                        </div>
                        <p className={clsx(
                          "text-xs mb-3",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Objectif de 15-20M€ pour une valorisation de 100-120M€. Dilution estimée de 15%.
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <CheckCircle className={clsx(
                              "h-4 w-4 mr-1",
                              darkMode ? "text-green-400" : "text-green-500"
                            )} />
                            <span className={clsx(
                              "text-xs",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              Facteurs de succès: Leadership de marché, forte croissance
                            </span>
                          </div>
                          <div className="flex items-center">
                            <PieChart className={clsx(
                              "h-4 w-4 mr-1",
                              darkMode ? "text-purple-400" : "text-purple-600"
                            )} />
                            <span className={clsx(
                              "text-xs",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              Mix: {financialData.fundingMix.seriesC.equity}% dilutif | {financialData.fundingMix.seriesC.debt + financialData.fundingMix.seriesC.grants}% non dilutif
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Users className={clsx(
                              "h-4 w-4 mr-1",
                              darkMode ? "text-blue-400" : "text-blue-600"
                            )} />
                            <span className={clsx(
                              "text-xs",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              Fondateurs: {financialData.ownership.postSeriesC.founders}% | Investisseurs: {financialData.ownership.postSeriesC.seedInvestors + financialData.ownership.postSeriesC.seriesAInvestors + financialData.ownership.postSeriesC.seriesBInvestors + financialData.ownership.postSeriesC.seriesCInvestors}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-amber-500 dark:text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800 dark:text-amber-400 mb-1">Stratégie de financement dilutif vs non dilutif</h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    <strong>Financement dilutif</strong> (equity) : Vous cédez une partie du capital de votre entreprise en échange de fonds, ce qui dilue la part des actionnaires existants.
                    <br /><br />
                    <strong>Financement non dilutif</strong> (dette, subventions) : Vous obtenez des fonds sans céder de parts de votre entreprise. La dette devra être remboursée avec intérêts, tandis que les subventions n'ont généralement pas à être remboursées.
                    <br /><br />
                    Notre recommandation est de combiner ces deux approches pour optimiser votre structure de capital et préserver le contrôle des fondateurs tout en assurant une croissance suffisante.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialJourney;