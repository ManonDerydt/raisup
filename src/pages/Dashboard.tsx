import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import RaisupScore from '../components/dashboard/RaisupScore';
import KPIGrid from '../components/dashboard/KPIGrid';
import DilutivePipeline from '../components/dashboard/DilutivePipeline';
import NonDilutivePipeline from '../components/dashboard/NonDilutivePipeline';
import DocumentsActions from '../components/dashboard/DocumentsActions';
import SkeletonCard from '../components/dashboard/SkeletonCard';

const Dashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
    // Simulate data loading
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className={clsx('py-8 px-4 sm:px-6 lg:px-8 space-y-5 max-w-5xl mx-auto', darkMode ? 'bg-gray-900' : '')}>
        {[4, 3, 3, 4, 4, 3].map((lines, i) => (
          <SkeletonCard key={i} darkMode={darkMode} lines={lines} />
        ))}
      </div>
    );
  }

  return (
    <div className={clsx('py-8 px-4 sm:px-6 lg:px-8 min-h-full', darkMode ? 'bg-gray-900' : 'bg-gray-50')}>
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Section 1 — Header */}
        <DashboardHeader darkMode={darkMode} />

        {/* Section 2 — Score Raisup */}
        <RaisupScore darkMode={darkMode} />

        {/* Section 3 — KPIs */}
        <KPIGrid darkMode={darkMode} />

        {/* Section 4 — Pipeline dilutif */}
        <DilutivePipeline darkMode={darkMode} />

        {/* Section 5 — Pipeline non-dilutif */}
        <NonDilutivePipeline darkMode={darkMode} />

        {/* Section 6 — Documents & actions */}
        <DocumentsActions darkMode={darkMode} />

      </div>
    </div>
  );
};

export default Dashboard;
