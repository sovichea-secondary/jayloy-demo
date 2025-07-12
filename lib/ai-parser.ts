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
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch('/api/llm', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Failed to process receipt with AI');
  }

  const { description } = await res.json();

  let cleanedResponse = description;
  
  if (cleanedResponse.includes('```json')) {
    cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  } else if (cleanedResponse.includes('```')) {
    cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
  }
  
  cleanedResponse = cleanedResponse.trim();
  
  let parsed: any;
  try {
    parsed = JSON.parse(cleanedResponse);
  } catch (e) {
    console.error('AI Response:', description);
    console.error('Cleaned Response:', cleanedResponse);
    console.error('JSON Parse Error:', e);
    throw new Error(`AI response is not valid JSON. Response: ${description.substring(0, 200)}...`);
  }

  console.log('Parsed AI Response:', parsed);

  const result = {
    type: (parsed.type || 'expense').toLowerCase() as 'expense' | 'income',
    description: parsed.description || 'Receipt from AI extraction',
    date: parsed.date || '',
    total_amount: parsed.total_amount || parsed.amount || 0,
    vendor: parsed.vendor || 'Unknown Vendor',
    currency: parsed.currency || (parsed.items && parsed.items[0]?.currency) || 'USD',
    items: Array.isArray(parsed.items)
      ? parsed.items.map((item: any, idx: number) => ({
          id: item.id || idx + 1,
          name: item.name || 'UNKNOWN',
          amount: item.amount || 0,
          currency: item.currency || 'USD',
          category: item.category || 'Other',
          description: item.description || item.name || 'UNKNOWN',
        }))
      : [],
  };

  console.log('Mapped Result:', result);
  return result;
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
  
  const currency = amount > 100 ? 'KHR' : 'USD';
  const finalAmount = currency === 'KHR' ? amount * 4000 : amount;

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
