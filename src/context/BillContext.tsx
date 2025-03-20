
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types
export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  assignedTo: string[];
}

export interface Person {
  id: string;
  name: string;
}

export interface ReceiptData {
  items: ReceiptItem[];
  subtotal: number;
  total: number;
  date?: string;
  storeName?: string;
}

interface BillContextType {
  activeStep: number;
  setActiveStep: (step: number) => void;
  currentImage: string | null;
  setCurrentImage: (image: string | null) => void;
  receiptData: ReceiptData | null;
  setReceiptData: (data: ReceiptData | null) => void;
  people: Person[];
  addPerson: (name: string) => void;
  removePerson: (id: string) => void;
  assignItemToPerson: (itemId: string, personId: string) => void;
  unassignItemFromPerson: (itemId: string, personId: string) => void;
  calculateSplitAmounts: () => Record<string, number>;
  resetBill: () => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (status: boolean) => void;
}

const defaultReceiptData: ReceiptData = {
  items: [],
  subtotal: 0,
  total: 0
};

const BillContext = createContext<BillContextType | undefined>(undefined);

export const BillProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Add a new person
  const addPerson = (name: string) => {
    if (name.trim() === '') return;
    const newPerson: Person = {
      id: `person-${Date.now()}`,
      name: name.trim()
    };
    setPeople([...people, newPerson]);
  };

  // Remove a person
  const removePerson = (id: string) => {
    setPeople(people.filter(person => person.id !== id));
    
    // Also unassign any items assigned to this person
    if (receiptData) {
      const updatedItems = receiptData.items.map(item => ({
        ...item,
        assignedTo: item.assignedTo.filter(personId => personId !== id)
      }));
      
      setReceiptData({
        ...receiptData,
        items: updatedItems
      });
    }
  };

  // Assign an item to a person
  const assignItemToPerson = (itemId: string, personId: string) => {
    if (!receiptData) return;
    
    const updatedItems = receiptData.items.map(item => {
      if (item.id === itemId) {
        if (!item.assignedTo.includes(personId)) {
          return {
            ...item,
            assignedTo: [...item.assignedTo, personId]
          };
        }
      }
      return item;
    });
    
    setReceiptData({
      ...receiptData,
      items: updatedItems
    });
  };

  // Unassign an item from a person
  const unassignItemFromPerson = (itemId: string, personId: string) => {
    if (!receiptData) return;
    
    const updatedItems = receiptData.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          assignedTo: item.assignedTo.filter(id => id !== personId)
        };
      }
      return item;
    });
    
    setReceiptData({
      ...receiptData,
      items: updatedItems
    });
  };

  // Calculate split amounts for each person
  const calculateSplitAmounts = (): Record<string, number> => {
    if (!receiptData) return {};
    
    const amounts: Record<string, number> = {};
    
    // Initialize amounts for each person
    people.forEach(person => {
      amounts[person.id] = 0;
    });
    
    // Calculate amount for each item
    receiptData.items.forEach(item => {
      const assignedPeople = item.assignedTo.length;
      if (assignedPeople > 0) {
        const perPersonAmount = item.price / assignedPeople;
        
        item.assignedTo.forEach(personId => {
          amounts[personId] += perPersonAmount;
        });
      }
    });
    
    // Round to 2 decimal places
    Object.keys(amounts).forEach(personId => {
      amounts[personId] = Math.round(amounts[personId] * 100) / 100;
    });
    
    return amounts;
  };

  // Reset the current bill
  const resetBill = () => {
    setCurrentImage(null);
    setReceiptData(null);
    setPeople([]);
    setActiveStep(0);
  };

  return (
    <BillContext.Provider
      value={{
        activeStep,
        setActiveStep,
        currentImage,
        setCurrentImage,
        receiptData,
        setReceiptData,
        people,
        addPerson,
        removePerson,
        assignItemToPerson,
        unassignItemFromPerson,
        calculateSplitAmounts,
        resetBill,
        isAnalyzing,
        setIsAnalyzing
      }}
    >
      {children}
    </BillContext.Provider>
  );
};

export const useBill = (): BillContextType => {
  const context = useContext(BillContext);
  if (context === undefined) {
    throw new Error('useBill must be used within a BillProvider');
  }
  return context;
};
