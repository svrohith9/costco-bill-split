
import React, { useEffect } from 'react';
import { BillProvider, useBill } from '@/context/BillContext';
import Header from '@/components/Header';
import BillCapture from '@/components/BillCapture';
import BillAnalysis from '@/components/BillAnalysis';
import PeopleSplitter from '@/components/PeopleSplitter';
import SummaryView from '@/components/SummaryView';

const AppContent: React.FC = () => {
  const { activeStep } = useBill();
  
  // Set page title based on the active step
  const getStepTitle = () => {
    switch (activeStep) {
      case 0: return 'Capture Receipt';
      case 1: return 'Analyze Receipt';
      case 2: return 'Split Bill';
      case 3: return 'Summary';
      default: return 'Bill Splitter';
    }
  };

  useEffect(() => {
    // Update document title when active step changes
    document.title = getStepTitle();
  }, [activeStep]);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-16 px-4 overflow-auto">
        {activeStep === 0 && <BillCapture />}
        {activeStep === 1 && <BillAnalysis />}
        {activeStep === 2 && <PeopleSplitter />}
        {activeStep === 3 && <SummaryView />}
      </main>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <BillProvider>
      <AppContent />
    </BillProvider>
  );
};

export default Index;
