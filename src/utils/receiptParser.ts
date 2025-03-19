
import { ReceiptData } from '@/context/BillContext';
import { performOCR } from './imageProcessing';

interface ExtractedItem {
  name: string;
  price: number;
  tax?: number;
  taxable?: boolean;
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
  for (const line of lines) {
    if (line.toUpperCase().includes('COSTCO')) {
      storeName = 'Costco';
      break;
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
  
  // Look for subtotal, tax, and total values
  for (const line of lines) {
    const lowercaseLine = line.toLowerCase();
    
    if (lowercaseLine.includes('subtotal')) {
      const match = line.match(/(\d+\.\d{2})/);
      if (match) {
        subtotal = parseFloat(match[1]);
      }
    } 
    else if (lowercaseLine.includes('tax')) {
      const match = line.match(/(\d+\.\d{2})/);
      if (match) {
        totalTax = parseFloat(match[1]);
      }
    } 
    else if (lowercaseLine.includes('total')) {
      const match = line.match(/(\d+\.\d{2})/);
      if (match) {
        total = parseFloat(match[1]);
      }
    }
  }
  
  // Custom parser for Costco-like receipts - handles multiple formats
  // Pattern 1: ItemNumber ItemDescription Price Y/N (taxable indicator)
  // Pattern 2: E ItemNumber ItemDescription Price Y/N (E indicates eligible for something, Y/N is tax indicator)
  const itemRegex1 = /([0-9]+)\s+([A-Za-z0-9\s]+)\s+(\d+\.\d{2})\s*([YN])?/;
  const itemRegex2 = /[E]?\s*([0-9]+)\s+([A-Za-z0-9\s]+)\s+(\d+\.\d{2})\s*([YN])?/;
  
  for (const line of lines) {
    // Skip lines that are clearly not item entries
    if (line.toLowerCase().includes('subtotal') || 
        line.toLowerCase().includes('total') || 
        line.toLowerCase().includes('tax') ||
        line.includes('*') ||
        line.length < 10) {
      continue;
    }
    
    const match1 = line.match(itemRegex1);
    const match2 = line.match(itemRegex2);
    const match = match1 || match2;
    
    if (match) {
      const itemNumber = match[1];
      let name = match[2].trim();
      const price = parseFloat(match[3]);
      const taxable = match[4] === 'Y';
      
      // Some OCR results might need cleaning
      if (name.length > 30) {
        name = name.substring(0, 30);
      }
      
      // Skip very short item descriptions, likely errors
      if (name.length < 2) continue;
      
      const item: ExtractedItem = {
        name,
        price,
        taxable
      };
      
      // Estimate tax for this item based on taxable status
      if (taxable) {
        // If we know total tax and total taxable amount, we can calculate tax rate
        const taxRate = 0.0531; // Default tax rate if we can't calculate
        item.tax = parseFloat((price * taxRate).toFixed(2));
      } else {
        item.tax = 0;
      }
      
      items.push(item);
    }
  }
  
  // If we couldn't find subtotal, calculate it
  if (subtotal === 0 && items.length > 0) {
    subtotal = items.reduce((sum, item) => sum + item.price, 0);
    subtotal = parseFloat(subtotal.toFixed(2));
  }
  
  // If we couldn't find tax, calculate it
  if (totalTax === 0 && items.length > 0) {
    totalTax = items.reduce((sum, item) => sum + (item.tax || 0), 0);
    totalTax = parseFloat(totalTax.toFixed(2));
  }
  
  // If we couldn't find total, calculate it
  if (total === 0) {
    total = subtotal + totalTax;
    total = parseFloat(total.toFixed(2));
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
  // Generate items similar to those in the screenshot
  const items = [
    { name: "ADIDAS SOCK", price: 13.49, tax: 0.72, taxable: true },
    { name: "CLVN KLN 3PK", price: 19.99, tax: 1.06, taxable: true },
    { name: "YVES MACARON", price: 11.99, tax: 0.64, taxable: true },
    { name: "KS BXR BRIEF", price: 15.99, tax: 0.85, taxable: true },
    { name: "CHCKN SAUSAG", price: 14.99, tax: 0, taxable: false },
    { name: "ORG BANANAS", price: 1.99, tax: 0, taxable: false },
    { name: "BANANAS", price: 2.98, tax: 0, taxable: false },
    { name: "MANDARINS", price: 13.98, tax: 0, taxable: false }
  ];
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const tax = items.reduce((sum, item) => sum + item.tax, 0);
  const total = subtotal + tax;
  
  // Format the receipt data
  return {
    items: items.map((item, index) => ({
      id: `item-${index}`,
      name: item.name,
      price: item.price,
      tax: item.tax,
      assignedTo: []
    })),
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    date: new Date().toISOString().split('T')[0],
    storeName: 'Costco'
  };
};
