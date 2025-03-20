
import React, { useState, useEffect } from 'react';
import { useBill } from '@/context/BillContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Edit2, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { parseReceipt } from '@/utils/receiptParser';
import { toast } from '@/components/ui/use-toast';

const BillAnalysis: React.FC = () => {
  const { currentImage, setReceiptData, setActiveStep, isAnalyzing, setIsAnalyzing } = useBill();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<
    Array<{ id: string; name: string; price: number }>
  >([]);
  const [storeName, setStoreName] = useState('Costco');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subtotal, setSubtotal] = useState(0);
  
  useEffect(() => {
    if (currentImage) {
      setIsLoading(true);
      
      // Process the image using OCR
      parseReceipt(currentImage)
        .then(result => {
          setEditedItems(result.items);
          setStoreName(result.storeName || 'Costco');
          setDate(result.date || new Date().toISOString().split('T')[0]);
          setSubtotal(result.subtotal);
          
          if (result.items.length === 0) {
            toast({
              title: "Warning",
              description: "Could not detect items automatically. You may need to add them manually.",
              variant: "destructive"
            });
          }
        })
        .catch(error => {
          console.error('Error processing receipt:', error);
          toast({
            title: "Error",
            description: "Failed to analyze receipt. You can still add items manually.",
            variant: "destructive"
          });
        })
        .finally(() => {
          setIsLoading(false);
          setIsAnalyzing(false);
        });
    }
  }, [currentImage, setIsAnalyzing]);
  
  const updateTotals = () => {
    const newSubtotal = editedItems.reduce((sum, item) => sum + item.price, 0);
    setSubtotal(parseFloat(newSubtotal.toFixed(2)));
  };
  
  const handleItemChange = (id: string, field: 'name' | 'price', value: string) => {
    const updatedItems = editedItems.map(item => {
      if (item.id === id) {
        if (field === 'name') {
          return { ...item, name: value };
        } else {
          const numValue = parseFloat(value) || 0;
          return { ...item, [field]: numValue };
        }
      }
      return item;
    });
    
    setEditedItems(updatedItems);
    if (field === 'price') {
      setTimeout(updateTotals, 100);
    }
  };
  
  const addNewItem = () => {
    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'New Item',
      price: 0
    };
    
    setEditedItems([...editedItems, newItem]);
    setIsEditing(true);
  };
  
  const removeItem = (id: string) => {
    setEditedItems(editedItems.filter(item => item.id !== id));
    setTimeout(updateTotals, 100);
  };
  
  const handleContinue = () => {
    // Create the final receipt data
    const receiptData = {
      items: editedItems.map(item => ({
        ...item,
        assignedTo: []
      })),
      subtotal,
      total: subtotal,
      date,
      storeName
    };
    
    setReceiptData(receiptData);
    setActiveStep(2);
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <Card className="w-full max-w-md p-8 glass-card">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-pulse w-full space-y-4">
              <div className="h-6 bg-secondary rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-secondary rounded w-1/2 mx-auto"></div>
              <div className="space-y-2">
                <div className="h-10 bg-secondary rounded"></div>
                <div className="h-10 bg-secondary rounded"></div>
                <div className="h-10 bg-secondary rounded"></div>
              </div>
            </div>
            <p className="text-muted-foreground mt-4">Analyzing your receipt using OCR...</p>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-start h-full pt-16 pb-6 px-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Receipt Details</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm"
          >
            {isEditing ? (
              <>
                <CheckCircle size={16} className="mr-1" /> Done
              </>
            ) : (
              <>
                <Edit2 size={16} className="mr-1" /> Edit
              </>
            )}
          </Button>
        </div>
        
        <Card className="glass-card p-4 mb-6">
          <div className="flex justify-between mb-2">
            <div>
              {isEditing ? (
                <div className="mb-2">
                  <Label htmlFor="store-name" className="text-xs text-muted-foreground">Store</Label>
                  <Input 
                    id="store-name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="h-8"
                  />
                </div>
              ) : (
                <div className="font-medium">{storeName}</div>
              )}
            </div>
            <div>
              {isEditing ? (
                <div className="mb-2">
                  <Label htmlFor="date" className="text-xs text-muted-foreground">Date</Label>
                  <Input 
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-8"
                  />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {new Date(date).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </Card>
        
        <div className="mb-2 flex justify-between items-center">
          <h3 className="font-medium">Items</h3>
          {isEditing && (
            <Button variant="ghost" size="sm" onClick={addNewItem} className="h-8 px-2">
              <Plus size={16} className="mr-1" /> Add Item
            </Button>
          )}
        </div>
        
        <Card className="glass-card p-4 mb-6">
          <div className="space-y-3">
            {editedItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                {isEditing ? (
                  <div className="grid grid-cols-12 gap-2 w-full">
                    <div className="col-span-8">
                      <Label htmlFor={`item-name-${item.id}`} className="text-xs text-muted-foreground">Item</Label>
                      <Input
                        id={`item-name-${item.id}`}
                        value={item.name}
                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor={`item-price-${item.id}`} className="text-xs text-muted-foreground">Price</Label>
                      <Input
                        id={`item-price-${item.id}`}
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="col-span-1 flex items-end pb-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                    </div>
                    <div className="text-right">
                      <div>${item.price.toFixed(2)}</div>
                    </div>
                  </>
                )}
              </div>
            ))}
            
            {editedItems.length === 0 && (
              <div className="py-8 text-center text-muted-foreground flex flex-col items-center">
                <AlertCircle size={24} className="mb-2" />
                <p>No items found. Add items to continue.</p>
              </div>
            )}
          </div>
        </Card>
        
        <Card className="glass-card p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>
        </Card>
        
        <div className="flex justify-center mt-4">
          <Button 
            onClick={handleContinue}
            disabled={editedItems.length === 0}
            className="w-full"
          >
            Continue to Split
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BillAnalysis;
