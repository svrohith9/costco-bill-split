
import React from 'react';
import { BillProvider, useBill } from '@/context/BillContext';
import Header from '@/components/Header';
import BillCapture from '@/components/BillCapture';
import BillAnalysis from '@/components/BillAnalysis';
import PeopleSplitter from '@/components/PeopleSplitter';
import SummaryView from '@/components/SummaryView';

const AppContent: React.FC = () => {
  const { activeStep } = useBill();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
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
