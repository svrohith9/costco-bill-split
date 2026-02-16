import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { z } from 'zod';

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

const STORAGE_KEY = 'costco-bill-split:v1';

const personSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50)
});

const receiptItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().finite().nonnegative(),
  assignedTo: z.array(z.string())
});

const receiptSchema = z.object({
  items: z.array(receiptItemSchema),
  subtotal: z.number().finite().nonnegative(),
  total: z.number().finite().nonnegative(),
  date: z.string().optional(),
  storeName: z.string().optional()
});

const persistedStateSchema = z.object({
  activeStep: z.number().int().min(0).max(3),
  currentImage: z.string().nullable(),
  receiptData: receiptSchema.nullable(),
  people: z.array(personSchema),
  isAnalyzing: z.boolean().default(false)
});

const BillContext = createContext<BillContextType | undefined>(undefined);

export const BillProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = persistedStateSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    setActiveStep(parsed.data.activeStep);
    setCurrentImage(parsed.data.currentImage);
    setReceiptData(parsed.data.receiptData);
    setPeople(parsed.data.people);
    setIsAnalyzing(false);
  }, []);

  useEffect(() => {
    const snapshot = {
      activeStep,
      currentImage,
      receiptData,
      people,
      isAnalyzing
    };

    const validated = persistedStateSchema.safeParse(snapshot);
    if (validated.success) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validated.data));
    }
  }, [activeStep, currentImage, receiptData, people, isAnalyzing]);

  const addPerson = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (trimmed.length > 50) return;
    if (people.some((person) => person.name.toLowerCase() === trimmed.toLowerCase())) return;

    const newPerson: Person = {
      id: `person-${Date.now()}`,
      name: trimmed
    };
    setPeople([...people, newPerson]);
  };

  const removePerson = (id: string) => {
    setPeople(people.filter(person => person.id !== id));

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

  const assignItemToPerson = (itemId: string, personId: string) => {
    if (!receiptData) return;

    const updatedItems = receiptData.items.map(item => {
      if (item.id === itemId && !item.assignedTo.includes(personId)) {
        return {
          ...item,
          assignedTo: [...item.assignedTo, personId]
        };
      }
      return item;
    });

    setReceiptData({
      ...receiptData,
      items: updatedItems
    });
  };

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

  const calculateSplitAmounts = (): Record<string, number> => {
    if (!receiptData) return {};

    const amounts: Record<string, number> = {};

    people.forEach(person => {
      amounts[person.id] = 0;
    });

    receiptData.items.forEach(item => {
      const assignedPeople = item.assignedTo.length;
      if (assignedPeople > 0) {
        const perPersonAmount = item.price / assignedPeople;

        item.assignedTo.forEach(personId => {
          amounts[personId] += perPersonAmount;
        });
      }
    });

    Object.keys(amounts).forEach(personId => {
      amounts[personId] = Math.round(amounts[personId] * 100) / 100;
    });

    return amounts;
  };

  const resetBill = () => {
    setCurrentImage(null);
    setReceiptData(null);
    setPeople([]);
    setActiveStep(0);
    setIsAnalyzing(false);
    localStorage.removeItem(STORAGE_KEY);
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
