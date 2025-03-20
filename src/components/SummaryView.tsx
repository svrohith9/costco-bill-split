
import React, { useState, useEffect } from 'react';
import { useBill } from '@/context/BillContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Share2, Download, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const SummaryView: React.FC = () => {
  const { receiptData, people, calculateSplitAmounts, resetBill } = useBill();
  const [splitAmounts, setSplitAmounts] = useState<Record<string, number>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  
  useEffect(() => {
    if (receiptData && people.length > 0) {
      const amounts = calculateSplitAmounts();
      setSplitAmounts(amounts);
    }
  }, [receiptData, people, calculateSplitAmounts]);
  
  const getTotalAssignedAmount = (): number => {
    return Object.values(splitAmounts).reduce((total, amount) => total + amount, 0);
  };
  
  const getUnassignedAmount = (): number => {
    if (!receiptData) return 0;
    return parseFloat((receiptData.total - getTotalAssignedAmount()).toFixed(2));
  };
  
  const handleShare = () => {
    // In a real app, this would share the results
    toast({
      title: "Share",
      description: "This would open share options in a real app",
    });
  };
  
  const handleDownload = () => {
    // In a real app, this would download a PDF summary
    toast({
      title: "Download",
      description: "This would download a PDF summary in a real app",
    });
  };
  
  const handleStartNew = () => {
    resetBill();
  };
  
  const handleDone = () => {
    setShowSuccess(true);
    setTimeout(() => {
      resetBill();
    }, 2000);
  };
  
  if (!receiptData || people.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>No receipt data available</p>
      </div>
    );
  }
  
  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-scale-in">
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <Check size={48} className="text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-2 animate-fade-in">All done!</h2>
        <p className="text-muted-foreground animate-fade-in">Everyone knows what they owe</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-start h-full pt-16 pb-6 px-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-center">Payment Summary</h2>
          <p className="text-muted-foreground text-center text-sm">
            {receiptData.storeName} - {new Date(receiptData.date || '').toLocaleDateString()}
          </p>
        </div>
        
        <Card className="glass-card p-6 mb-6">
          <div className="space-y-4">
            {people.map((person) => (
              <div key={person.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <span className="font-medium text-primary">
                      {person.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium">{person.name}</span>
                </div>
                <span className="text-xl font-semibold">
                  ${splitAmounts[person.id]?.toFixed(2) || '0.00'}
                </span>
              </div>
            ))}
            
            {getUnassignedAmount() > 0 && (
              <div className="flex justify-between items-center py-3 text-muted-foreground border-t">
                <span>Unassigned amount</span>
                <span>${getUnassignedAmount().toFixed(2)}</span>
              </div>
            )}
          </div>
        </Card>
        
        <Card className="glass-card p-4 mb-8">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Receipt Total</span>
              <span>${receiptData.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t">
              <span>Total Assigned</span>
              <span>${getTotalAssignedAmount().toFixed(2)}</span>
            </div>
          </div>
        </Card>
        
        <div className="flex flex-col space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full" onClick={handleShare}>
              <Share2 size={16} className="mr-2" />
              Share
            </Button>
            <Button variant="outline" className="w-full" onClick={handleDownload}>
              <Download size={16} className="mr-2" />
              Save
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-3 pt-2">
            <Button className="w-full" onClick={handleDone}>Done</Button>
            <Button variant="ghost" className="w-full" onClick={handleStartNew}>
              <RefreshCw size={16} className="mr-2" />
              Start New
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryView;
