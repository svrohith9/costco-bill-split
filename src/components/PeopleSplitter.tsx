
import React, { useState } from 'react';
import { useBill } from '@/context/BillContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, UserPlus, User, X, ChevronRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const PeopleSplitter: React.FC = () => {
  const { 
    receiptData, 
    people, 
    addPerson, 
    removePerson, 
    assignItemToPerson, 
    unassignItemFromPerson, 
    setActiveStep 
  } = useBill();
  
  const [newPersonName, setNewPersonName] = useState('');
  
  const handleAddPerson = () => {
    if (newPersonName.trim()) {
      addPerson(newPersonName);
      setNewPersonName('');
    } else {
      toast({
        title: "Name required",
        description: "Please enter a name",
        variant: "destructive",
      });
    }
  };
  
  const handleCheckboxChange = (itemId: string, personId: string, checked: boolean) => {
    if (checked) {
      assignItemToPerson(itemId, personId);
    } else {
      unassignItemFromPerson(itemId, personId);
    }
  };
  
  const handleContinue = () => {
    if (people.length === 0) {
      toast({
        title: "Add people",
        description: "Please add at least one person",
        variant: "destructive",
      });
      return;
    }
    
    // Check if any items are unassigned
    const unassignedItems = receiptData?.items.filter(item => item.assignedTo.length === 0) || [];
    
    if (unassignedItems.length > 0) {
      const confirmContinue = window.confirm(
        `There are ${unassignedItems.length} unassigned items. Continue anyway?`
      );
      
      if (!confirmContinue) {
        return;
      }
    }
    
    setActiveStep(3);
  };
  
  if (!receiptData) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>No receipt data available</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-start h-full pt-16 pb-6 px-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Users size={18} className="mr-2" />
            <h2 className="text-xl font-semibold">People</h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {people.length} {people.length === 1 ? 'person' : 'people'}
          </span>
        </div>
        
        <Card className="glass-card p-4 mb-6">
          <div className="flex items-end gap-2 mb-4">
            <div className="flex-1">
              <Label htmlFor="new-person" className="text-sm text-muted-foreground mb-1">
                Add a person
              </Label>
              <Input
                id="new-person"
                placeholder="Enter name"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPerson()}
              />
            </div>
            <Button onClick={handleAddPerson} className="flex items-center">
              <UserPlus size={16} className="mr-1" />
              Add
            </Button>
          </div>
          
          <div className="space-y-2">
            {people.map((person) => (
              <div 
                key={person.id} 
                className="flex items-center justify-between p-2 rounded-md border border-border group hover:border-primary/30 transition-all-200"
              >
                <div className="flex items-center">
                  <User size={16} className="mr-2 text-primary" />
                  <span>{person.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePerson(person.id)}
                  className="opacity-0 group-hover:opacity-100 transition-all-200 h-8 w-8 text-destructive"
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
            
            {people.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <p>Add people to split the bill</p>
              </div>
            )}
          </div>
        </Card>
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Assign Items</h2>
        </div>
        
        <Card className="glass-card p-4 mb-6">
          {receiptData.items.map((item) => (
            <div key={item.id} className="py-3 border-b last:border-b-0">
              <div className="flex justify-between mb-2">
                <span className="font-medium">{item.name}</span>
                <span>${(item.price + item.tax).toFixed(2)}</span>
              </div>
              
              {people.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {people.map((person) => (
                    <div key={`${item.id}-${person.id}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`checkbox-${item.id}-${person.id}`}
                        checked={item.assignedTo.includes(person.id)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange(item.id, person.id, checked === true)
                        }
                      />
                      <Label
                        htmlFor={`checkbox-${item.id}-${person.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {person.name}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Add people to assign this item
                </div>
              )}
            </div>
          ))}
        </Card>
        
        <div className="flex justify-center mt-4">
          <Button 
            onClick={handleContinue}
            disabled={people.length === 0}
            className="w-full"
          >
            Continue to Summary
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PeopleSplitter;
