import React, { useState } from 'react';
import { Info, TrendingUp, DollarSign, BarChart3, CheckCircle, AlertCircle, Clock, PieChart, Users, HelpCircle, Download, Calendar, Target, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

const FinancialJourney: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

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
    fundingMix: {
      seriesA: {
        equity: 80,
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
    },
    benchmarks: {
      sector: 'SaaS B2B',
      avgDilution: {
        seriesA: 22,
        seriesB: 18,
        seriesC: 15
      },
      avgValuation: {
        seriesA: '10-18M€',
        seriesB: '35-55M€',
        seriesC: '90-130M€'
      }
    }
  };

  const nextSteps = [
    { id: 1, title: 'Finaliser le pitch deck', completed: true, priority: 'high' },
    { id: 2, title: 'Mettre à jour les projections financières', completed: true, priority: 'high' },
    { id: 3, title: 'Identifier 20 investisseurs cibles', completed: false, priority: 'high' },
    { id: 4, title: 'Préparer la data room', completed: false, priority: 'medium' },
    { id: 5, title: 'Valider les KPIs avec le board', completed: false, priority: 'medium' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const tooltips: Record<string, string> = {
    dilution: "La dilution représente le pourcentage de capital que vous cédez lors d'une levée de fonds. Plus elle est élevée, moins vous possédez de parts de votre entreprise.",
    valorisation: "La valorisation est la valeur estimée de votre entreprise. Elle détermine le prix auquel vous vendez des parts lors d'une levée de fonds.",
    burnRate: "Le burn rate est le montant d'argent que votre entreprise dépense chaque mois. Il détermine combien de temps vous pouvez survivre avec votre trésorerie actuelle.",
    runway: "Le runway est le nombre de mois pendant lesquels votre entreprise peut fonctionner avant de manquer d'argent, calculé à partir de votre trésorerie et burn rate actuels."
  };

  const Tooltip: React.FC<{ id: string; content: string }> = ({ id, content }) => (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShowTooltip(id)}
        onMouseLeave={() => setShowTooltip(null)}
        className={clsx(
          "ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-xs",
          darkMode ? "bg-gray-600 text-gray-300 hover:bg-gray-500" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
        )}
      >
        ?
      </button>
      {showTooltip === id && (
        <div className={clsx(
          "absolute z-50 w-64 p-3 rounded-lg shadow-lg text-xs bottom-full mb-2 left-1/2 transform -translate-x-1/2",
          darkMode ? "bg-gray-700 text-gray-200 border border-gray-600" : "bg-white text-gray-700 border border-gray-200"
        )}>
          {content}
          <div className={clsx(
            "absolute w-2 h-2 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1",
            darkMode ? "bg-gray-700 border-r border-b border-gray-600" : "bg-white border-r border-b border-gray-200"
          )} />
        </div>
      )}
    </div>
  );

  const downloadSynthesis = () => {
    alert('Téléchargement de la synthèse en cours...');
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
          <button
            onClick={downloadSynthesis}
            className={clsx(
              "mt-4 md:mt-0 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              darkMode
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-white text-gray-900 hover:bg-gray-50 border border-gray-200"
            )}
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger la synthèse
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className={clsx(
            "p-6 rounded-xl shadow-sm border-2",
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-[#d8ffbd]"
          )}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className={clsx(
                  "p-2 rounded-lg",
                  darkMode ? "bg-gray-700" : "bg-[#d8ffbd]/30"
                )}>
                  <Target className={clsx("h-5 w-5", darkMode ? "text-gray-300" : "text-primary")} />
                </div>
                <div className="ml-3">
                  <h3 className={clsx("text-sm font-medium", darkMode ? "text-gray-300" : "text-gray-700")}>
                    Dilution max
                    <Tooltip id="dilution" content={tooltips.dilution} />
                  </h3>
                  <p className={clsx("text-2xl font-bold mt-1", darkMode ? "text-white" : "text-gray-900")}>
                    {financialData.fundingStrategy.maxDilution}%
                  </p>
                </div>
              </div>
            </div>
            <div className={clsx("text-xs", darkMode ? "text-gray-400" : "text-gray-500")}>
              Secteur: {financialData.benchmarks.avgDilution.seriesA}% en moyenne
            </div>
          </div>

          <div className={clsx(
            "p-6 rounded-xl shadow-sm border-2",
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-[#d8ffbd]"
          )}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className={clsx(
                  "p-2 rounded-lg",
                  darkMode ? "bg-gray-700" : "bg-[#d8ffbd]/30"
                )}>
                  <TrendingUp className={clsx("h-5 w-5", darkMode ? "text-gray-300" : "text-primary")} />
                </div>
                <div className="ml-3">
                  <h3 className={clsx("text-sm font-medium", darkMode ? "text-gray-300" : "text-gray-700")}>
                    Valorisation Série A
                    <Tooltip id="valorisation" content={tooltips.valorisation} />
                  </h3>
                  <p className={clsx("text-2xl font-bold mt-1", darkMode ? "text-white" : "text-gray-900")}>
                    {financialData.fundingStrategy.targetValuation.seriesA}
                  </p>
                </div>
              </div>
            </div>
            <div className={clsx("text-xs", darkMode ? "text-gray-400" : "text-gray-500")}>
              Secteur: {financialData.benchmarks.avgValuation.seriesA}
            </div>
          </div>

          <div className={clsx(
            "p-6 rounded-xl shadow-sm border-2",
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-[#d8ffbd]"
          )}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className={clsx(
                  "p-2 rounded-lg",
                  darkMode ? "bg-gray-700" : "bg-[#d8ffbd]/30"
                )}>
                  <Clock className={clsx("h-5 w-5", darkMode ? "text-gray-300" : "text-primary")} />
                </div>
                <div className="ml-3">
                  <h3 className={clsx("text-sm font-medium", darkMode ? "text-gray-300" : "text-gray-700")}>
                    Runway actuel
                    <Tooltip id="runway" content={tooltips.runway} />
                  </h3>
                  <p className={clsx("text-2xl font-bold mt-1", darkMode ? "text-white" : "text-gray-900")}>
                    {financialData.fundingStrategy.runway.current}
                  </p>
                </div>
              </div>
            </div>
            <div className={clsx("text-xs", darkMode ? "text-gray-400" : "text-gray-500")}>
              Burn rate: {financialData.fundingStrategy.burnRate.current}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className={clsx(
            "lg:col-span-2 rounded-xl shadow-sm",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <div className="p-6">
              <h2 className={clsx(
                "text-lg font-semibold mb-6",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Timeline de financement
              </h2>

              <div className="relative">
                <div className={clsx(
                  "absolute top-5 left-5 h-full w-0.5",
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                )} />

                <div className="space-y-6">
                  <div className="relative pl-10">
                    <div className={clsx(
                      "absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                      darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                    )}>
                      Now
                    </div>
                    <div className={clsx(
                      "p-4 rounded-lg",
                      darkMode ? "bg-gray-700" : "bg-gray-50"
                    )}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={clsx("text-sm font-semibold", darkMode ? "text-white" : "text-gray-900")}>
                          Situation actuelle
                        </h4>
                      </div>
                      <p className={clsx("text-xs mb-3", darkMode ? "text-gray-400" : "text-gray-500")}>
                        Seed round de 750K€ réalisé en Q2 2023. Runway actuel de 10 mois.
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className={clsx(
                          "px-2 py-1 rounded-full",
                          darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"
                        )}>
                          Fondateurs: 85%
                        </span>
                        <span className={clsx(
                          "px-2 py-1 rounded-full",
                          darkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-700"
                        )}>
                          Investisseurs: 15%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative pl-10">
                    <div className={clsx(
                      "absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                      darkMode ? "bg-gray-700 text-gray-300" : "bg-[#d8ffbd] text-primary"
                    )}>
                      A
                    </div>
                    <div className={clsx(
                      "p-4 rounded-lg border-2",
                      darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-[#d8ffbd]"
                    )}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={clsx("text-sm font-semibold", darkMode ? "text-white" : "text-gray-900")}>
                          Série A - Q3 2024
                        </h4>
                        <button
                          onClick={() => setExpandedSeries(expandedSeries === 'A' ? null : 'A')}
                          className={clsx(
                            "text-xs px-2 py-1 rounded-full flex items-center gap-1",
                            darkMode ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-700"
                          )}
                        >
                          75% de chances
                          {expandedSeries === 'A' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                      </div>
                      <p className={clsx("text-xs mb-3", darkMode ? "text-gray-400" : "text-gray-500")}>
                        Objectif: 3M€ pour une valorisation de 12-15M€ (dilution 20-25%)
                      </p>

                      {expandedSeries === 'A' && (
                        <div className={clsx(
                          "mt-4 p-3 rounded-lg space-y-3 text-xs",
                          darkMode ? "bg-gray-800" : "bg-gray-50"
                        )}>
                          <div>
                            <h5 className={clsx("font-semibold mb-2", darkMode ? "text-white" : "text-gray-900")}>
                              Objectifs clés avant la levée:
                            </h5>
                            <ul className={clsx("space-y-1", darkMode ? "text-gray-300" : "text-gray-700")}>
                              <li className="flex items-center">
                                <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                                ARR de 1.2M€
                              </li>
                              <li className="flex items-center">
                                <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                                Expansion dans 3 nouveaux pays
                              </li>
                              <li className="flex items-center">
                                <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                                Équipe de 15 personnes
                              </li>
                            </ul>
                          </div>

                          <div>
                            <h5 className={clsx("font-semibold mb-2 flex items-center", darkMode ? "text-green-400" : "text-green-700")}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Facteurs de succès:
                            </h5>
                            <ul className={clsx("list-disc list-inside space-y-1", darkMode ? "text-gray-300" : "text-gray-700")}>
                              <li>Traction commerciale solide</li>
                              <li>Équipe complète et expérimentée</li>
                              <li>Product-market fit validé</li>
                            </ul>
                          </div>

                          <div>
                            <h5 className={clsx("font-semibold mb-2 flex items-center", darkMode ? "text-amber-400" : "text-amber-700")}>
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Risques à surveiller:
                            </h5>
                            <ul className={clsx("list-disc list-inside space-y-1", darkMode ? "text-gray-300" : "text-gray-700")}>
                              <li>Concurrence accrue sur le marché</li>
                              <li>Contexte économique incertain</li>
                              <li>Dépendance à quelques gros clients</li>
                            </ul>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className={clsx(
                          "p-2 rounded",
                          darkMode ? "bg-gray-800" : "bg-gray-50"
                        )}>
                          <div className={clsx("font-medium mb-1", darkMode ? "text-gray-300" : "text-gray-700")}>
                            Mix de financement
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={clsx(darkMode ? "text-gray-400" : "text-gray-600")}>
                              Dilutif: {financialData.fundingMix.seriesA.equity}%
                            </span>
                          </div>
                        </div>
                        <div className={clsx(
                          "p-2 rounded",
                          darkMode ? "bg-gray-800" : "bg-gray-50"
                        )}>
                          <div className={clsx("font-medium mb-1", darkMode ? "text-gray-300" : "text-gray-700")}>
                            Structure post-levée
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={clsx(darkMode ? "text-gray-400" : "text-gray-600")}>
                              Fondateurs: {financialData.ownership.postSeriesA.founders}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative pl-10">
                    <div className={clsx(
                      "absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                      darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                    )}>
                      B
                    </div>
                    <div className={clsx("p-4 rounded-lg", darkMode ? "bg-gray-700" : "bg-gray-50")}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={clsx("text-sm font-semibold", darkMode ? "text-white" : "text-gray-900")}>
                          Série B - 2025-2026
                        </h4>
                        <button
                          onClick={() => setExpandedSeries(expandedSeries === 'B' ? null : 'B')}
                          className={clsx(
                            "text-xs px-2 py-1 rounded-full flex items-center gap-1",
                            darkMode ? "bg-amber-900/50 text-amber-300" : "bg-amber-100 text-amber-700"
                          )}
                        >
                          45% de chances
                          {expandedSeries === 'B' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                      </div>
                      <p className={clsx("text-xs mb-2", darkMode ? "text-gray-400" : "text-gray-500")}>
                        Objectif: 5-8M€ pour une valorisation de 40-50M€
                      </p>

                      {expandedSeries === 'B' && (
                        <div className={clsx(
                          "mt-4 p-3 rounded-lg space-y-2 text-xs",
                          darkMode ? "bg-gray-800" : "bg-white"
                        )}>
                          <div className="flex items-start">
                            <CheckCircle className={clsx("h-4 w-4 mr-2 mt-0.5", darkMode ? "text-green-400" : "text-green-500")} />
                            <span className={clsx(darkMode ? "text-gray-300" : "text-gray-700")}>
                              Croissance internationale établie
                            </span>
                          </div>
                          <div className="flex items-start">
                            <AlertCircle className={clsx("h-4 w-4 mr-2 mt-0.5", darkMode ? "text-amber-400" : "text-amber-500")} />
                            <span className={clsx(darkMode ? "text-gray-300" : "text-gray-700")}>
                              Exécution de la Série A critique
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative pl-10">
                    <div className={clsx(
                      "absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                      darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                    )}>
                      C
                    </div>
                    <div className={clsx("p-4 rounded-lg", darkMode ? "bg-gray-700" : "bg-gray-50")}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={clsx("text-sm font-semibold", darkMode ? "text-white" : "text-gray-900")}>
                          Série C - 2026+
                        </h4>
                        <span className={clsx(
                          "text-xs px-2 py-1 rounded-full",
                          darkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700"
                        )}>
                          20% de chances
                        </span>
                      </div>
                      <p className={clsx("text-xs", darkMode ? "text-gray-400" : "text-gray-500")}>
                        Objectif: 15-20M€ pour une valorisation de 100-120M€
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={clsx(
              "rounded-xl shadow-sm p-6",
              darkMode ? "bg-gray-800" : "bg-white"
            )}>
              <h3 className={clsx("text-sm font-semibold mb-4 flex items-center", darkMode ? "text-white" : "text-gray-900")}>
                <Lightbulb className="h-4 w-4 mr-2" />
                Prochaines étapes
              </h3>
              <div className="space-y-3">
                {nextSteps.map((step) => (
                  <div
                    key={step.id}
                    className={clsx(
                      "flex items-start p-3 rounded-lg",
                      darkMode ? "bg-gray-700" : "bg-gray-50"
                    )}
                  >
                    <div className={clsx(
                      "flex-shrink-0 w-5 h-5 rounded flex items-center justify-center mt-0.5",
                      step.completed
                        ? darkMode ? "bg-green-900/50 text-green-400" : "bg-green-100 text-green-600"
                        : darkMode ? "bg-gray-600" : "bg-gray-200"
                    )}>
                      {step.completed && <CheckCircle className="h-3 w-3" />}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className={clsx(
                        "text-xs font-medium",
                        step.completed
                          ? darkMode ? "text-gray-400 line-through" : "text-gray-500 line-through"
                          : darkMode ? "text-gray-200" : "text-gray-900"
                      )}>
                        {step.title}
                      </div>
                      <div className={clsx(
                        "text-xs mt-1 px-2 py-0.5 rounded inline-block",
                        step.priority === 'high'
                          ? darkMode ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-700"
                          : darkMode ? "bg-amber-900/30 text-amber-300" : "bg-amber-100 text-amber-700"
                      )}>
                        {step.priority === 'high' ? 'Priorité haute' : 'Priorité moyenne'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={clsx(
              "rounded-xl shadow-sm p-6 border-2",
              darkMode ? "bg-gray-800 border-gray-700" : "bg-[#d8ffbd]/10 border-[#d8ffbd]"
            )}>
              <div className="flex items-start mb-4">
                <Info className={clsx("h-5 w-5 mr-2 flex-shrink-0 mt-0.5", darkMode ? "text-gray-300" : "text-primary")} />
                <div>
                  <h4 className={clsx("text-sm font-semibold mb-2", darkMode ? "text-white" : "text-gray-900")}>
                    Recommandation IA
                  </h4>
                  <p className={clsx("text-xs mb-3", darkMode ? "text-gray-300" : "text-gray-700")}>
                    Basé sur votre taux de croissance et votre burn rate actuel, nous recommandons de préparer votre Série A pour Q3 2024 avec un objectif de 3M€.
                  </p>
                  <p className={clsx("text-xs", darkMode ? "text-gray-400" : "text-gray-600")}>
                    Privilégiez un mix avec 20% non dilutif (dette, subventions) pour préserver votre capital.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button className={clsx(
                "w-full py-3 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center",
                darkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-primary text-white hover:bg-gray-800"
              )}>
                <Calendar className="h-4 w-4 mr-2" />
                Prendre RDV avec un conseiller
              </button>
              <button className={clsx(
                "w-full py-3 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center",
                darkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-white text-primary hover:bg-gray-50 border-2 border-primary"
              )}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Simuler un scénario
              </button>
            </div>
          </div>
        </div>

        <div className={clsx(
          "rounded-xl shadow-sm p-6",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <h3 className={clsx("text-sm font-semibold mb-4", darkMode ? "text-white" : "text-gray-900")}>
            Comprendre les termes clés
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={clsx("p-4 rounded-lg", darkMode ? "bg-gray-700" : "bg-gray-50")}>
              <h4 className={clsx("text-xs font-semibold mb-2", darkMode ? "text-white" : "text-gray-900")}>
                Financement dilutif (Equity)
              </h4>
              <p className={clsx("text-xs", darkMode ? "text-gray-300" : "text-gray-700")}>
                Vous cédez une partie du capital de votre entreprise en échange de fonds. Les actionnaires existants voient leur participation diminuer proportionnellement.
              </p>
            </div>
            <div className={clsx("p-4 rounded-lg", darkMode ? "bg-gray-700" : "bg-gray-50")}>
              <h4 className={clsx("text-xs font-semibold mb-2", darkMode ? "text-white" : "text-gray-900")}>
                Financement non dilutif
              </h4>
              <p className={clsx("text-xs", darkMode ? "text-gray-300" : "text-gray-700")}>
                Comprend la dette (à rembourser avec intérêts) et les subventions (sans remboursement). Permet de conserver le contrôle de votre entreprise.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialJourney;
