import React, { useState } from 'react';
import { Send, Copy, Download, CheckCircle, Loader2, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { jsPDF } from 'jspdf';
import { currentKPIs, previousKPIs } from '../data/mockKPIs';

const API_URL = import.meta.env.VITE_API_URL as string || 'http://127.0.0.1:8000';

const MONTHS = [
  'Avril 2026', 'Mars 2026', 'Février 2026', 'Janvier 2026', 'Décembre 2025',
];

const InvestorUpdatePage: React.FC = () => {
  const [darkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0]);
  const [news, setNews] = useState('');
  const [objectives, setObjectives] = useState('');
  const [needs, setNeeds] = useState<string[]>([]);
  const [generated, setGenerated] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const needOptions = ['Introductions investisseurs', 'Conseils techniques', 'Recrutement', 'Partenariats commerciaux', 'Aide juridique'];

  const toggleNeed = (n: string) =>
    setNeeds(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/generate/investor-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: selectedMonth,
          current_kpis: currentKPIs,
          previous_kpis: previousKPIs,
          news,
          objectives,
          needs,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).detail ?? res.statusText);
      const data = await res.json();
      setGenerated(data.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setFillColor(29, 29, 27);
    doc.rect(0, 0, 210, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`Investor Update — ${selectedMonth}`, 10, 12);

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    let y = 26;
    const lines = doc.splitTextToSize(generated, 185);
    lines.forEach((line: string) => {
      if (y > 280) { doc.addPage(); y = 15; }
      doc.text(line, 10, y);
      y += 5;
    });
    doc.save(`investor-update-${selectedMonth.replace(' ', '-')}.pdf`);
  };

  const cardCls = clsx('rounded-xl border p-6', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200');
  const inputCls = clsx('w-full rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-primary resize-none', darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400');
  const labelCls = clsx('block text-xs font-medium mb-1.5', darkMode ? 'text-gray-300' : 'text-gray-600');

  return (
    <div className={clsx('py-8 px-4 sm:px-6 lg:px-8 min-h-full', darkMode ? 'bg-gray-900' : 'bg-gray-50')}>
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Title */}
        <div>
          <h1 className={clsx('text-2xl font-bold', darkMode ? 'text-white' : 'text-gray-900')}>Investor Update</h1>
          <p className={clsx('text-sm mt-1', darkMode ? 'text-gray-400' : 'text-gray-500')}>
            Générez votre update mensuel à destination de vos investisseurs
          </p>
        </div>

        {/* Config card */}
        <div className={cardCls}>
          {/* Month selector */}
          <div className="mb-4">
            <label className={labelCls}>Période</label>
            <div className="relative w-48">
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className={clsx(inputCls, 'appearance-none pr-8')}
              >
                {MONTHS.map(m => <option key={m}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
            </div>
          </div>

          {/* KPIs recap */}
          <div className={clsx('rounded-lg p-3 mb-4 text-xs', darkMode ? 'bg-gray-700/50' : 'bg-gray-50')}>
            <p className={clsx('font-semibold mb-2', darkMode ? 'text-gray-200' : 'text-gray-700')}>KPIs auto-importés ({selectedMonth})</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { l: 'MRR',         v: `${(currentKPIs.mrr / 1000).toFixed(1)}K€` },
                { l: 'Croissance',  v: `+${currentKPIs.growth_mom}%` },
                { l: 'Clients',     v: String(currentKPIs.active_customers) },
                { l: 'Churn',       v: `${currentKPIs.churn}%` },
                { l: 'Runway',      v: `${currentKPIs.runway} mois` },
                { l: 'CAC',         v: `${currentKPIs.cac}€` },
              ].map(({ l, v }) => (
                <div key={l}>
                  <span className={clsx(darkMode ? 'text-gray-400' : 'text-gray-500')}>{l} : </span>
                  <span className={clsx('font-medium', darkMode ? 'text-gray-200' : 'text-gray-800')}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* News */}
          <div className="mb-4">
            <label className={labelCls}>Quoi de neuf ce mois ?</label>
            <textarea
              rows={3}
              placeholder="Ex : Signature d'un contrat avec Doctolib, recrutement d'un Head of Sales, participation au salon VivaTech…"
              value={news}
              onChange={e => setNews(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Objectives */}
          <div className="mb-4">
            <label className={labelCls}>Vos objectifs pour le mois prochain</label>
            <textarea
              rows={2}
              placeholder="Ex : Atteindre 20K€ MRR, finaliser le dossier BPI, recruter un développeur senior…"
              value={objectives}
              onChange={e => setObjectives(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Needs */}
          <div className="mb-5">
            <label className={labelCls}>Avez-vous besoin d'aide sur un sujet spécifique ?</label>
            <div className="flex flex-wrap gap-2">
              {needOptions.map(n => (
                <button
                  key={n}
                  onClick={() => toggleNeed(n)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition',
                    needs.includes(n)
                      ? 'bg-primary text-white border-primary'
                      : darkMode ? 'border-gray-600 text-gray-300 hover:border-gray-400' : 'border-gray-200 text-gray-600 hover:border-primary',
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-opacity-90 transition disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {loading ? 'Génération en cours…' : `Générer l'update de ${selectedMonth}`}
          </button>

          {error && (
            <p className="mt-3 text-sm text-red-500">{error}</p>
          )}
        </div>

        {/* Generated update */}
        {generated && (
          <div className={cardCls}>
            <div className="flex items-center justify-between mb-3">
              <h2 className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
                Update généré — {selectedMonth}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={clsx('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition', darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50')}
                >
                  {copied ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copié !' : 'Copier'}
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-opacity-90 transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </button>
              </div>
            </div>
            <textarea
              value={generated}
              onChange={e => setGenerated(e.target.value)}
              rows={20}
              className={clsx(
                'w-full rounded-lg px-4 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-primary font-mono leading-relaxed resize-y',
                darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-800',
              )}
            />
            <p className={clsx('text-xs mt-2', darkMode ? 'text-gray-500' : 'text-gray-400')}>
              Vous pouvez modifier le texte directement avant de le télécharger.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default InvestorUpdatePage;
