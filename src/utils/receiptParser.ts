
import { ReceiptData } from '@/context/BillContext';

// Mock function to simulate OCR parsing of a receipt
export const parseReceiptMock = (): ReceiptData => {
  // Generate 5-10 random items
  const numItems = Math.floor(Math.random() * 6) + 5;
  const items = [];
  let subtotal = 0;
  
  const possibleItems = [
    { name: "Kirkland Water 40pk", price: 3.99, tax: 0.29 },
    { name: "Organic Eggs", price: 5.49, tax: 0 },
    { name: "Rotisserie Chicken", price: 4.99, tax: 0.37 },
    { name: "Paper Towels 12pk", price: 18.99, tax: 1.42 },
    { name: "Fresh Strawberries", price: 3.99, tax: 0 },
    { name: "Frozen Pizza 4pk", price: 12.99, tax: 0.97 },
    { name: "Organic Milk 2pk", price: 6.49, tax: 0 },
    { name: "Ground Coffee", price: 14.99, tax: 1.12 },
    { name: "Trail Mix", price: 10.99, tax: 0.82 },
    { name: "Salmon Fillet", price: 20.99, tax: 0 },
    { name: "Avocados 6pk", price: 6.99, tax: 0 },
    { name: "Toilet Paper 30pk", price: 21.99, tax: 1.65 },
    { name: "Sparkling Water 24pk", price: 7.99, tax: 0.60 },
    { name: "Peanut Butter", price: 8.49, tax: 0.63 },
    { name: "Maple Syrup", price: 12.99, tax: 0.97 },
    { name: "Organic Spinach", price: 4.49, tax: 0 },
    { name: "Chicken Breast 6pk", price: 17.99, tax: 0 },
    { name: "Olive Oil", price: 15.99, tax: 1.20 },
  ];
  
  // Randomly select items without duplicates
  const selectedItems = [];
  while (selectedItems.length < numItems && selectedItems.length < possibleItems.length) {
    const randomIndex = Math.floor(Math.random() * possibleItems.length);
    const item = possibleItems[randomIndex];
    
    if (!selectedItems.includes(item)) {
      selectedItems.push(item);
    }
  }
  
  // Create final receipt items with random price variations
  for (let i = 0; i < selectedItems.length; i++) {
    const item = selectedItems[i];
    // Add small random variation to price
    const priceVariation = (Math.random() * 0.4) - 0.2; // between -0.2 and 0.2
    const price = parseFloat((item.price + priceVariation).toFixed(2));
    const tax = parseFloat((item.tax * (1 + priceVariation / 2)).toFixed(2));
    
    items.push({
      id: `item-${i}`,
      name: item.name,
      price,
      tax,
      assignedTo: []
    });
    
    subtotal += price;
  }
  
  // Calculate the total tax
  const tax = items.reduce((total, item) => total + item.tax, 0);
  
  // Calculate the total
  const total = parseFloat((subtotal + tax).toFixed(2));
  
  // Format the receipt data
  return {
    items,
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total,
    date: new Date().toISOString().split('T')[0],
    storeName: 'Costco'
  };
};

// In a real application, we would have actual OCR and parsing logic here
// This might involve sending the image to a backend service or using
// a library for OCR processing
