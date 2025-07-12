// Mock AI parser for receipt processing
// In production, this would integrate with OpenAI Vision API or similar

interface ParsedReceiptData {
  type: 'expense' | 'income';
  description: string;
  date: string;
  total_amount: number;
  vendor?: string;
  currency: string;
  items: Array<{
    id: number;
    name: string;
    amount: number;
    currency: string;
  }>;
}

export async function parseReceiptWithAI(file: File): Promise<ParsedReceiptData> {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Convert file to base64 for AI processing (simulation)
  const base64 = await convertFileToBase64(file);
  
  // Simulate AI response based on file name/type
  const mockData = generateMockReceiptData(file.name);
  
  return mockData;
}

async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

function generateMockReceiptData(fileName: string): ParsedReceiptData {
  // Generate realistic mock data for demonstration
  const vendors = [
    'Starbucks Coffee',
    'Office Depot',
    'Shell Gas Station', 
    'Amazon Business',
    'FedEx Office',
    'Restaurant Cambodia',
    'Khmer Market',
    'Phnom Penh Hotel',
    'Lucky Supermarket',
    'Brown Coffee'
  ];

  const descriptions = [
    'Business meeting refreshments',
    'Office supplies purchase',
    'Business travel fuel',
    'Equipment and supplies',
    'Document printing services',
    'Client dinner meeting',
    'Office snacks and beverages',
    'Business accommodation',
    'Monthly grocery supplies',
    'Team coffee meeting'
  ];

  const vendor = vendors[Math.floor(Math.random() * vendors.length)];
  const amount = Math.round((Math.random() * 200 + 10) * 100) / 100;
  const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const description = descriptions[Math.floor(Math.random() * descriptions.length)];
  
  // Determine currency based on amount (simulate KHR for larger amounts)
  const currency = amount > 100 ? 'KHR' : 'USD';
  const finalAmount = currency === 'KHR' ? amount * 4000 : amount;

  // Generate items
  const itemCount = Math.floor(Math.random() * 3) + 1;
  const items = Array.from({ length: itemCount }, (_, index) => ({
    id: index + 1,
    name: `Item ${index + 1}`,
    amount: Math.round((finalAmount / itemCount) * 100) / 100,
    currency
  }));

  return {
    type: 'expense',
    description,
    date,
    total_amount: finalAmount,
    vendor,
    currency,
    items
  };
}

// For production use with OpenAI Vision API:
/*
export async function parseReceiptWithOpenAI(file: File): Promise<ParsedReceiptData> {
  const base64 = await convertFileToBase64(file);
  
  const prompt = `
    Extract essential information in this transaction picture and format into following json format:  
    response only json format, remember the format json that they send to make api request, in some case where you're unsure about the item just leave the name as "UNKNOWN".

    { 
      "type": EXPENSE OR INCOME, 
      "description": example : "I bought cake",  mostly in remark option, if not found just null. 
      "date": example format like this "YYYY-MM-DD", 
      "total_amount": example (100) put only number and if use see KHR currency please convert to USD format, by multiply by 4000, 
      "items": [ 
        { 
          "id": can be in order 1 to ..., 
          "name": should just be the name of the item (must support Khmer or any other languages), if couldn't identify the name just leave the name as "UNKNOWN",
          "amount": basically the cost of the product, example (100) put only number, 
          "currency": basically follow the currency shows in the receipts, 
        }, 
      ] 
    }
  `;

  const response = await fetch('/api/parse-receipt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: base64,
      prompt: prompt
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to parse receipt with AI');
  }

  return response.json();
}
*/