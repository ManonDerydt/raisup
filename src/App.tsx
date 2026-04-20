import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage'; 
import LoginPage from './pages/LoginPage';
import OnboardingLayout from './components/OnboardingLayout';
import EntrepreneurForm from './pages/EntrepreneurForm';
import CompanyForm from './pages/CompanyForm';
import BusinessPlanForm from './pages/BusinessPlanForm';
import FinancialsForm from './pages/FinancialsForm';
import DueDiligenceForm from './pages/DueDiligenceForm';
import FinalisationPage from './pages/FinalisationPage';
import SuccessPage from './pages/SuccessPage';
import DashboardWelcome from './pages/DashboardWelcome';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './components/DashboardLayout';
import FinancialJourney from './pages/FinancialJourney';
import DocumentsPage from './pages/DocumentsPage';
import FundraisingPage from './pages/FundraisingPage';
import AnalysisPage from './pages/AnalysisPage';
import SettingsPage from './pages/SettingsPage';
import PricingPage from './pages/PricingPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ProfileSelectionPage from './pages/ProfileSelectionPage';
import B2BOnboardingLayout from './components/B2BOnboardingLayout';
import StructureInfoForm from './pages/b2b/StructureInfoForm';
import B2BFinancialsForm from './pages/b2b/FinancialsForm';
import ObjectivesForm from './pages/b2b/ObjectivesForm';
import ContactForm from './pages/b2b/ContactForm';
import ValidationForm from './pages/b2b/ValidationForm';
import PitchDeckGenerator from "./pages/pitch_generator.tsx";
import DocumentGeneratorPage from './pages/DocumentGeneratorPage';
import KPIsPage from './pages/KPIsPage';
import InvestorUpdatePage from './pages/InvestorUpdatePage';
import B2BDashboardLayout from './components/B2BDashboardLayout';
import B2BDashboard from './pages/B2BDashboard';
import PortfolioPage from './pages/b2b/PortfolioPage';
import B2BDossierDetail from './pages/b2b/B2BDossierDetail';
import FundingSynthesisPage from './pages/b2b/FundingSynthesisPage';
import StrategicReportsPage from './pages/b2b/StrategicReportsPage';
import SimplifiedOnboardingForm from './pages/SimplifiedOnboardingForm';
import RaisupOnboardingForm from './pages/RaisupOnboardingForm';
import RaisupSuccessPage from './pages/RaisupSuccessPage';
import LoadingStrategy from './pages/LoadingStrategy';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ValuationPage from './pages/ValuationPage';
import AgencyOnboarding from './pages/AgencyOnboarding';
import AgencySuccessPage from './pages/AgencySuccessPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<ProfileSelectionPage />} />
        <Route path="/register/b2b" element={<B2BOnboardingLayout />}>
          <Route index element={<Navigate to="/register/b2b/structure" replace />} />
          <Route path="structure" element={<StructureInfoForm />} />
          <Route path="financials" element={<B2BFinancialsForm />} />
          <Route path="objectives" element={<ObjectivesForm />} />
          <Route path="contact" element={<ContactForm />} />
          <Route path="validation" element={<ValidationForm />} />
        </Route>
        <Route path="/register/startup" element={<SimplifiedOnboardingForm />} />
        <Route path="/onboarding/raisup" element={<RaisupOnboardingForm />} />
        <Route path="/onboarding/raisup/success" element={<RaisupSuccessPage />} />
        <Route path="/loading-strategy" element={<LoadingStrategy />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/onboarding/agency" element={<AgencyOnboarding />} />
        <Route path="/onboarding/agency/success" element={<AgencySuccessPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/onboarding" element={<OnboardingLayout />}>
          <Route index element={<Navigate to="/onboarding/entrepreneur" replace />} />
          <Route path="entrepreneur" element={<EntrepreneurForm />} />
          <Route path="entreprise" element={<CompanyForm />} />
          <Route path="business-plan" element={<BusinessPlanForm />} />
          <Route path="financials" element={<FinancialsForm />} />
          <Route path="due-diligence" element={<DueDiligenceForm />} />
          <Route path="finalisation" element={<FinalisationPage />} />
          <Route path="success" element={<SuccessPage />} />
        </Route>

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="welcome" element={<DashboardWelcome />} />
          <Route path="financial-journey" element={<FinancialJourney />} />
          <Route path="documents" element={<DocumentsPage />}>
            <Route path="generate_deck" element={<PitchDeckGenerator />} />
          </Route>

          <Route path="generate" element={<DocumentGeneratorPage />} />
          <Route path="fundraising" element={<FundraisingPage />} />
          <Route path="analytics" element={<AnalysisPage />} />
          <Route path="kpis" element={<KPIsPage />} />
          <Route path="score" element={<DashboardWelcome />} />
          <Route path="investor-update" element={<InvestorUpdatePage />} />
          <Route path="valuation" element={<ValuationPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="/dashboard/b2b" element={<B2BDashboardLayout />}>
          <Route index element={<B2BDashboard />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="dossier/:id" element={<B2BDossierDetail />} />
          <Route path="funding-synthesis" element={<FundingSynthesisPage />} />
          <Route path="reports" element={<StrategicReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;