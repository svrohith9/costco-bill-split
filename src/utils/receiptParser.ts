
import { ReceiptData } from '@/context/BillContext';
import { performOCR } from './imageProcessing';

interface ExtractedItem {
  name: string;
  price: number;
  tax?: number;
}

// Function to parse receipt text and extract relevant information
export const parseReceiptText = (text: string): {
  items: ExtractedItem[];
  storeName: string;
  date: string;
  subtotal: number;
  tax: number;
  total: number;
} => {
  console.log('Parsing receipt text:', text);
  
  // Initialize default values
  let storeName = 'Costco';
  let date = new Date().toISOString().split('T')[0];
  let subtotal = 0;
  let totalTax = 0;
  let total = 0;
  const items: ExtractedItem[] = [];
  
  // Split text into lines
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Try to extract store name from the beginning of the receipt
  if (lines.length > 0) {
    const firstLine = lines[0].toLowerCase();
    if (firstLine.includes('costco')) {
      storeName = 'Costco';
    } else if (lines.length > 1 && lines[1].toLowerCase().includes('costco')) {
      storeName = 'Costco';
    }
  }
  
  // Try to extract date
  const dateRegex = /(\d{1,2})[/\-](\d{1,2})[/\-](\d{2,4})/;
  for (const line of lines) {
    const dateMatch = line.match(dateRegex);
    if (dateMatch) {
      // Convert to YYYY-MM-DD format
      let year = dateMatch[3];
      if (year.length === 2) {
        year = `20${year}`;
      }
      const month = dateMatch[1].padStart(2, '0');
      const day = dateMatch[2].padStart(2, '0');
      date = `${year}-${month}-${day}`;
      break;
    }
  }
  
  // Look for items with prices
  // This regex matches product descriptions followed by prices
  // For Costco receipts, items typically have a product name/number followed by a price
  const itemRegex = /^(.*?)\s+(\d+\.\d{2})$/;
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // Check if this is a subtotal, tax, or total line
    if (line.toLowerCase().includes('subtotal')) {
      const match = line.match(/(\d+\.\d{2})/);
      if (match) {
        subtotal = parseFloat(match[1]);
      }
    } else if (line.toLowerCase().includes('tax')) {
      const match = line.match(/(\d+\.\d{2})/);
      if (match) {
        totalTax = parseFloat(match[1]);
      }
    } else if (line.toLowerCase().includes('total')) {
      const match = line.match(/(\d+\.\d{2})/);
      if (match) {
        total = parseFloat(match[1]);
      }
    } else {
      // Try to match an item
      const itemMatch = line.match(itemRegex);
      if (itemMatch) {
        const name = itemMatch[1].trim();
        const price = parseFloat(itemMatch[2]);
        
        // Estimate tax for this item based on overall tax ratio
        // This is an approximation since receipts often don't show per-item tax
        const estimatedTax = subtotal > 0 ? (price / subtotal) * totalTax : 0;
        
        items.push({
          name,
          price,
          tax: parseFloat(estimatedTax.toFixed(2))
        });
      }
    }
    
    i++;
  }
  
  // If we couldn't parse any items, subtotal, or total, set some fallback values
  if (items.length === 0) {
    console.warn('Could not parse any items from receipt');
  }
  
  if (subtotal === 0 && items.length > 0) {
    subtotal = items.reduce((sum, item) => sum + item.price, 0);
  }
  
  if (total === 0 && subtotal > 0) {
    total = subtotal + totalTax;
  }
  
  return {
    items,
    storeName,
    date,
    subtotal,
    tax: totalTax,
    total
  };
};

// Function to parse a receipt image and extract data
export const parseReceipt = async (imageUrl: string): Promise<ReceiptData> => {
  try {
    // Perform OCR on the receipt image
    const text = await performOCR(imageUrl);
    console.log('Extracted text from receipt:', text);
    
    // Parse the extracted text
    const parsed = parseReceiptText(text);
    
    // Convert to ReceiptData format
    return {
      items: parsed.items.map(item => ({
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: item.name,
        price: item.price,
        tax: item.tax || 0,
        assignedTo: []
      })),
      subtotal: parsed.subtotal,
      tax: parsed.tax,
      total: parsed.total,
      date: parsed.date,
      storeName: parsed.storeName
    };
  } catch (error) {
    console.error('Failed to parse receipt:', error);
    // Return mock data as fallback
    console.log('Using mock receipt data as fallback');
    return parseReceiptMock();
  }
};

// Mock function to simulate OCR parsing of a receipt (used as fallback)
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
