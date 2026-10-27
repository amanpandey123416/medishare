/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { EmergencyBanner } from './components/EmergencyBanner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { EquipmentView } from './views/EquipmentView';
import { AssistanceView } from './views/AssistanceView';
import { BloodDonorView } from './views/BloodDonorView';
import { FacilitiesView } from './views/FacilitiesView';
import { SafeMedicineView } from './views/SafeMedicineView';
import { MedicalSuppliesView } from './views/MedicalSuppliesView';
import { LeftoverMedicineView } from './views/LeftoverMedicineView';
import { DashboardView } from './views/DashboardView';
import { AboutView } from './views/AboutView';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'equipment':
        return <EquipmentView />;
      case 'medicines':
        return <LeftoverMedicineView />;
      case 'requests':
        return <AssistanceView />;
      case 'blood-donors':
        return <BloodDonorView />;
      case 'facilities':
        return <FacilitiesView />;
      case 'safe-medicine':
        return <SafeMedicineView />;
      case 'supplies':
        return <MedicalSuppliesView />;
      case 'dashboard':
        return <DashboardView />;
      case 'about':
        return <AboutView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-teal-500 selection:text-white">
      <EmergencyBanner />
      <Navbar />
      <main className="flex-1">
        {renderActiveView()}
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
