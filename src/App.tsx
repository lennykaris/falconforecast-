import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { PredictionsProvider } from './context/PredictionsContext';
import { TipstersProvider } from './context/TipstersContext';
import { BetSlipProvider } from './context/BetSlipContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CheckoutModal } from './components/CheckoutModal';
import { PwaInstallModal, PwaInstallBanner } from './components/PwaInstallModal';

import { HomePage } from './pages/HomePage';
import { PostTipPage } from './pages/PostTipPage';
import { PremiumTipsPage } from './pages/PremiumTipsPage';
import { OddsComparisonPage } from './pages/OddsComparisonPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AboutPage } from './pages/AboutPage';
import { TermsPage } from './pages/TermsPage';
import { GdprPage } from './pages/GdprPage';
import { RefundPolicyPage } from './pages/RefundPolicyPage';
import { CopyrightPage } from './pages/CopyrightPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TipstersPage } from './pages/TipstersPage';
import { TipsterDashboardPage } from './pages/TipsterDashboardPage';

import type { SubscriptionPlan } from './types/prediction';
import { SUBSCRIPTION_PLANS } from './data/predictions';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export const AppContent: React.FC = () => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[1]);

  const handleOpenCheckout = (plan?: SubscriptionPlan) => {
    if (plan) setSelectedPlan(plan);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans selection:bg-[#00a8ff] selection:text-white">
      <ScrollToTop />

      <div>
        <Navbar
          onOpenCheckout={() => handleOpenCheckout(SUBSCRIPTION_PLANS[1])}
          onOpenPwaModal={() => setIsPwaModalOpen(true)}
        />

        <main className="pb-24 md:pb-0">
          <Routes>
            <Route path="/" element={<HomePage onOpenCheckout={handleOpenCheckout} />} />
            <Route path="/post-tip" element={<PostTipPage />} />
            <Route path="/premium-tips" element={<PremiumTipsPage onOpenCheckout={handleOpenCheckout} />} />
            <Route path="/odds-comparison" element={<OddsComparisonPage />} />
            
            {/* Football League Routes */}
            <Route path="/premier-league" element={<HomePage onOpenCheckout={handleOpenCheckout} />} />
            <Route path="/la-liga" element={<HomePage onOpenCheckout={handleOpenCheckout} />} />
            <Route path="/champions-league" element={<HomePage onOpenCheckout={handleOpenCheckout} />} />
            <Route path="/serie-a" element={<HomePage onOpenCheckout={handleOpenCheckout} />} />
            <Route path="/bundesliga" element={<HomePage onOpenCheckout={handleOpenCheckout} />} />
            
            {/* Auxiliary Routes */}
            <Route path="/vip" element={<PremiumTipsPage onOpenCheckout={handleOpenCheckout} />} />
            <Route path="/tips" element={<HomePage onOpenCheckout={handleOpenCheckout} />} />
            <Route path="/live-scores" element={<HomePage onOpenCheckout={handleOpenCheckout} />} />
            
            <Route path="/dashboard" element={<DashboardPage onOpenCheckout={handleOpenCheckout} />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/tipsters" element={<TipstersPage />} />
            <Route path="/tipster-dashboard" element={<TipsterDashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/gdpr" element={<GdprPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/copyright" element={<CopyrightPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
          </Routes>
        </main>
      </div>

      <Footer />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlan={selectedPlan}
      />

      <PwaInstallModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
      />

      <PwaInstallBanner
        onOpenModal={() => setIsPwaModalOpen(true)}
      />
    </div>
  );
};


export function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <PredictionsProvider>
            <TipstersProvider>
              <BetSlipProvider>
                <AppContent />
              </BetSlipProvider>
            </TipstersProvider>
          </PredictionsProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
