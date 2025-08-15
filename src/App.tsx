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
            {/* Ajouter la route pour generate_deck sous documents */}
            <Route path="generate_deck" element={<PitchDeckGenerator />} />
          </Route>

          <Route path="fundraising" element={<FundraisingPage />} />
          <Route path="analytics" element={<AnalysisPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;