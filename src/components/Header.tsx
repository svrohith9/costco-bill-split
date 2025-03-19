
import React from 'react';
import { useBill } from '@/context/BillContext';
import { ArrowLeft, X, Receipt } from 'lucide-react';

const Header: React.FC = () => {
  const { activeStep, setActiveStep, resetBill } = useBill();
  
  const stepTitles = [
    'Scan Receipt',
    'Receipt Analysis',
    'Assign Items',
    'Split Summary'
  ];
  
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };
  
  const handleReset = () => {
    resetBill();
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 z-10 glass-card p-4 flex items-center justify-between border-b">
      <div className="flex items-center">
        {activeStep > 0 ? (
          <button 
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-secondary transition-all-200 mr-2"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        ) : (
          <div className="p-2 mr-2">
            <Receipt size={20} className="text-primary" />
          </div>
        )}
        <h1 className="font-semibold text-lg">{stepTitles[activeStep]}</h1>
      </div>
      
      {activeStep > 0 && (
        <button 
          onClick={handleReset}
          className="p-2 rounded-full hover:bg-secondary transition-all-200"
          aria-label="Cancel and start over"
        >
          <X size={20} />
        </button>
      )}
    </header>
  );
};

export default Header;
